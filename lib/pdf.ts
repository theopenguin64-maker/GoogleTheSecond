import pdfParse from 'pdf-parse';

export function tokenizeText(text: string): string[] {
  // Normalize: lowercase, remove punctuation, split on whitespace
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

