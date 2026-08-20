import { renderToBuffer } from "@react-pdf/renderer";
import type { ResumeData } from "../types";
import { ResumeDocument, TIERS, pickFontTierIndex } from "./ResumeDocument";

async function countPdfPages(buffer: Buffer): Promise<number> {
  const pdfParse = (await import("pdf-parse-fork")).default;
  const result = await pdfParse(buffer);
  return result.numpages;
}

export async function renderResumePdf(
  resume: ResumeData,
): Promise<{ buffer: Buffer; pageCount: number }> {
  const startTier = pickFontTierIndex(resume);

  // Try progressively smaller (but still readable) tiers to fit compactly.
  // If the content is simply long, the last tier's output — spanning
  // multiple pages — is returned as-is rather than distorting the layout.
  let buffer: Buffer = await renderToBuffer(ResumeDocument({ resume, tierIndex: startTier }));
  let pages = await countPdfPages(buffer);

  for (let tierIndex = startTier + 1; pages > 1 && tierIndex < TIERS.length; tierIndex++) {
    buffer = await renderToBuffer(ResumeDocument({ resume, tierIndex }));
    pages = await countPdfPages(buffer);
  }

  return { buffer, pageCount: pages };
}
