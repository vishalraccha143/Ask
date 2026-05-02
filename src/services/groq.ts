import axios from 'axios';
import type { Message, Provider, RateLimitInfo, Attachment } from '../types';

interface ContentPart {
  type: 'text' | 'image_url' | 'file';
  text?: string;
  image_url?: { url: string; detail?: string };
  file?: { filename: string; file_data: string };
}

interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentPart[];
}

function isTextFile(type: string): boolean {
  return (
    type.startsWith('text/') ||
    type === 'application/json' ||
    type === 'application/javascript' ||
    type === 'application/x-python-code' ||
    type === 'text/x-python'
  );
}

function extractTextFromDataUrl(dataUrl: string): string {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return '';
  try {
    return atob(base64);
  } catch {
    return '';
  }
}

function buildContent(
  text: string,
  attachments: Attachment[] | undefined,
  supportsVision: boolean
): string | ContentPart[] {
  if (!attachments || attachments.length === 0) return text;

  const imageAttachments = attachments.filter((a) => a.type.startsWith('image/'));
  const pdfAttachments = attachments.filter((a) => a.type === 'application/pdf');
  const textAttachments = attachments.filter((a) => isTextFile(a.type));

  // Build text portion: original text + extracted text file contents
  let fullText = text;

  for (const att of textAttachments) {
    const extracted = extractTextFromDataUrl(att.data);
    if (extracted) {
      fullText += `\n\n--- File: ${att.name} ---\n${extracted}\n--- End of ${att.name} ---`;
    }
  }

  // If model doesn't support vision, just send text (with extracted text files)
  if (!supportsVision) {
    if (imageAttachments.length > 0 || pdfAttachments.length > 0) {
      const names = [...imageAttachments, ...pdfAttachments].map((a) => a.name).join(', ');
      fullText += `\n\n[Attached files: ${names}. Note: Current model does not support image/PDF analysis. Switch to a vision-capable model for file analysis.]`;
    }
    return fullText;
  }

  // Vision model: use array content format for images and PDFs
  const parts: ContentPart[] = [{ type: 'text', text: fullText }];

  for (const att of imageAttachments) {
    parts.push({
      type: 'image_url',
      image_url: { url: att.data, detail: 'auto' },
    });
  }

  for (const att of pdfAttachments) {
    parts.push({
      type: 'file',
      file: { filename: att.name, file_data: att.data },
    });
  }

  return parts;
}

function parseRateHeaders(headers: Record<string, string>): RateLimitInfo {
  return {
    remainingTokens: headers['x-ratelimit-remaining-tokens'] ? parseInt(headers['x-ratelimit-remaining-tokens']) : null,
    remainingRequests: headers['x-ratelimit-remaining-requests'] ? parseInt(headers['x-ratelimit-remaining-requests']) : null,
    limitTokens: headers['x-ratelimit-limit-tokens'] ? parseInt(headers['x-ratelimit-limit-tokens']) : null,
    limitRequests: headers['x-ratelimit-limit-requests'] ? parseInt(headers['x-ratelimit-limit-requests']) : null,
    resetTokens: headers['x-ratelimit-reset-tokens'] ?? null,
    resetRequests: headers['x-ratelimit-reset-requests'] ?? null,
  };
}

export interface SendMessageResult {
  content: string;
  rateLimit: RateLimitInfo;
}

export async function sendMessage(
  messages: Message[],
  apiKey: string,
  provider: Provider,
  modelId: string,
  supportsVision: boolean
): Promise<SendMessageResult> {
  const payload: ApiMessage[] = messages.map((m) => ({
    role: m.role,
    content: buildContent(m.content, m.attachments, supportsVision),
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await axios.post(
    provider.endpoint,
    { messages: payload, model: modelId, max_tokens: 2048, temperature: 0.7 },
    { headers }
  );

  const rateLimit = parseRateHeaders(response.headers as Record<string, string>);
  const content = response.data.choices[0].message.content as string;

  return { content, rateLimit };
}
