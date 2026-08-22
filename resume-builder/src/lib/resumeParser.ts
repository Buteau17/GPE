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

export class PasswordProtectedPdfError extends Error {}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (err) {
    // pdfjs already falls back internally to a main-thread "fake worker" if
    // the background worker can't load, so a rejection here is a real parse
    // failure (encrypted/password-protected or malformed PDF) — log the
    // actual cause for diagnosis instead of only showing a generic message.
    console.error("PDF parsing failed:", err);
    if (err instanceof pdfjsLib.PasswordException) {
      throw new PasswordProtectedPdfError("This PDF is password-protected.");
    }
    throw err;
  }

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    // pdf.js gives text as a flat run of items with no visual line breaks.
    // `hasEOL` only fires for prose-flow text and misses separately
    // positioned blocks (e.g. a name and a contact line rendered as two
    // absolutely-positioned elements, common in PDFs generated from
    // templates) — comparing each item's Y position to the previous one is
    // the robust signal the heuristic resume parser downstream needs
    // (section headers, one-name-per-line, bullets all rely on line breaks).
    let pageText = "";
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null) {
        pageText += Math.abs(y - lastY) > 1 ? "\n" : " ";
      }
      pageText += item.str;
      lastY = y;
    }
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n\n");
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  } catch (err) {
    console.error("DOCX parsing failed:", err);
    throw err;
  }
}

export async function extractTextFromResume(file: File, type: SupportedResumeType): Promise<string> {
  if (type === "txt") {
    return file.text();
  }
  if (type === "pdf") return extractTextFromPdf(file);
  return extractTextFromDocx(file);
}
