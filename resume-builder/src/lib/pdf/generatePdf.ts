import { pdf } from "@react-pdf/renderer";
import type { ResumeData } from "../types";
import { ResumeDocument, TIERS, pickFontTierIndex } from "./ResumeDocument";

async function countPdfPages(blob: Blob): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const arrayBuffer = await blob.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return doc.numPages;
}

export async function renderResumePdf(
  resume: ResumeData,
): Promise<{ blob: Blob; pageCount: number }> {
  const startTier = pickFontTierIndex(resume);

  // Try progressively smaller (but still readable) tiers to fit compactly.
  // If the content is simply long, the last tier's output — spanning
  // multiple pages — is returned as-is rather than distorting the layout.
  let blob = await pdf(ResumeDocument({ resume, tierIndex: startTier })).toBlob();
  let pages = await countPdfPages(blob);

  for (let tierIndex = startTier + 1; pages > 1 && tierIndex < TIERS.length; tierIndex++) {
    blob = await pdf(ResumeDocument({ resume, tierIndex })).toBlob();
    pages = await countPdfPages(blob);
  }

  return { blob, pageCount: pages };
}
