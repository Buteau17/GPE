import mammoth from "mammoth";

export type SupportedResumeType = "pdf" | "docx" | "txt";

export function detectResumeType(filename: string, mimeType: string): SupportedResumeType | null {
  const lower = filename.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  )
    return "docx";
  if (mimeType === "text/plain" || lower.endsWith(".txt")) return "txt";
  return null;
}

export async function extractTextFromResume(
  buffer: Buffer,
  type: SupportedResumeType,
): Promise<string> {
  if (type === "pdf") {
    const pdfParse = (await import("pdf-parse-fork")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }
  if (type === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return buffer.toString("utf-8");
}
