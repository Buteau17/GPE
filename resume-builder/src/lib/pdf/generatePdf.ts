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

function capBullets(resume: ResumeData, max: number): ResumeData {
  return {
    ...resume,
    experience: resume.experience.map((job) =>
      job.bullets.length <= max ? job : { ...job, bullets: job.bullets.slice(0, max) },
    ),
  };
}

function withoutProjects(resume: ResumeData): ResumeData {
  return { ...resume, projects: [], customSections: [] };
}

function withoutCertifications(resume: ResumeData): ResumeData {
  return { ...resume, certifications: "" };
}

// Content variants tried in order, from least to most destructive. Each one
// is tried across every font tier before moving on, matching how a human
// editor would fit a resume to one page: shrink font first, then trim the
// least essential content (projects and any custom sections, then
// certifications), only as a last resort.
function buildCandidates(resume: ResumeData): ResumeData[] {
  const capped4 = capBullets(resume, 4);
  const capped3 = capBullets(resume, 3);
  const capped3NoExtras = withoutProjects(capped3);
  const capped3NoExtrasNoCerts = withoutCertifications(capped3NoExtras);
  const capped2NoExtrasNoCerts = capBullets(capped3NoExtrasNoCerts, 2);

  return [resume, capped4, capped3, capped3NoExtras, capped3NoExtrasNoCerts, capped2NoExtrasNoCerts];
}

export async function renderResumePdf(
  resume: ResumeData,
  options?: { allowMultiPage?: boolean },
): Promise<{ blob: Blob; pageCount: number; trimmed: boolean }> {
  const startTier = pickFontTierIndex(resume);

  if (options?.allowMultiPage) {
    // User explicitly wants however many pages their content needs — render
    // at a normal readable size, untrimmed, and report however many pages
    // that produces instead of fighting to compress it into one.
    const blob = await pdf(ResumeDocument({ resume, tierIndex: startTier })).toBlob();
    const pages = await countPdfPages(blob);
    return { blob, pageCount: pages, trimmed: false };
  }

  const candidates = buildCandidates(resume);

  let bestBlob: Blob | null = null;
  let bestPages = Infinity;

  for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
    const candidate = candidates[candidateIndex];
    for (let tierIndex = candidateIndex === 0 ? startTier : 0; tierIndex < TIERS.length; tierIndex++) {
      const blob = await pdf(ResumeDocument({ resume: candidate, tierIndex })).toBlob();
      const pages = await countPdfPages(blob);

      if (pages === 1) {
        return { blob, pageCount: 1, trimmed: candidateIndex > 0 };
      }
      if (pages < bestPages) {
        bestBlob = blob;
        bestPages = pages;
      }
    }
  }

  // Nothing fit on one page even after trimming — return the closest result
  // (most content preserved, smallest overflow) rather than distorting the
  // layout further.
  return { blob: bestBlob as Blob, pageCount: bestPages, trimmed: candidates.length > 1 };
}
