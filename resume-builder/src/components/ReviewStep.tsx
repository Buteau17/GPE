"use client";

import { useState } from "react";
import type { ExperienceEntry, KeywordAnalysis, ResumeData } from "@/lib/types";

interface Props {
  resumeData: ResumeData;
  jobDescription: string;
  onBack: () => void;
}

function updateAt<T>(arr: T[], index: number, value: T): T[] {
  const copy = [...arr];
  copy[index] = value;
  return copy;
}

export function ReviewStep({ resumeData: initial, jobDescription, onBack }: Props) {
  const [resumeData, setResumeData] = useState<ResumeData>(initial);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pageCountNote, setPageCountNote] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleOptimize() {
    setOptimizing(true);
    setOptimizeError(null);
    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to optimize resume.");
      setResumeData(json.optimizedResumeData);
      setAnalysis(json.keywordAnalysis);
      setUsedAI(json.usedAI);
      setHasOptimized(true);
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : "Failed to optimize resume.");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    setPageCountNote(null);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Failed to generate PDF.");
      }
      const pageCount = Number(res.headers.get("X-Page-Count") ?? "1");
      setPageCountNote(
        pageCount <= 1
          ? "Generated a 1-page PDF."
          : `Generated a ${pageCount}-page PDF — your content didn't fit on one page at a readable size. Trim bullets if you'd like a strict one-pager.`,
      );
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      a.download = match?.[1] ?? "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  }

  function updateExperience(index: number, entry: ExperienceEntry) {
    setResumeData((prev) => ({ ...prev, experience: updateAt(prev.experience, index, entry) }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Review &amp; download</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Optimize against the job description, tweak anything that needs a human touch, then download a
compact, ATS-friendly PDF — one page when your content fits, more if it doesn&apos;t.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">ATS keyword match</p>
            {analysis ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {analysis.scoreBefore}% → <span className="font-semibold text-emerald-600 dark:text-emerald-400">{analysis.scoreAfter}%</span>{" "}
                of job keywords found in your resume{usedAI ? " (AI-tailored)" : " (rule-based tailoring)"}
              </p>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Not yet analyzed against the job posting.</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleOptimize}
            disabled={optimizing}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {optimizing ? "Tailoring…" : hasOptimized ? "Re-optimize" : "Optimize for this job"}
          </button>
        </div>
        {analysis && analysis.missing.length > 0 ? (
          <div className="text-sm">
            <p className="text-zinc-500 dark:text-zinc-400">
              Still missing from your resume (only add if truthful):
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {analysis.missing.slice(0, 15).map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {optimizeError ? <p className="text-sm text-red-600 dark:text-red-400">{optimizeError}</p> : null}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full name</label>
          <input
            value={resumeData.contact.fullName}
            onChange={(e) =>
              setResumeData((prev) => ({ ...prev, contact: { ...prev.contact, fullName: e.target.value } }))
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Summary</label>
          <textarea
            value={resumeData.summary}
            onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Skills (comma-separated)
          </label>
          <textarea
            value={resumeData.skills.join(", ")}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }))
            }
            rows={2}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        {resumeData.experience.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Experience</p>
            <div className="flex flex-col gap-3">
              {resumeData.experience.map((job, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      value={job.title}
                      placeholder="Title"
                      onChange={(e) => updateExperience(idx, { ...job, title: e.target.value })}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    <input
                      value={job.company}
                      placeholder="Company"
                      onChange={(e) => updateExperience(idx, { ...job, company: e.target.value })}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <textarea
                    value={job.bullets.join("\n")}
                    onChange={(e) =>
                      updateExperience(idx, {
                        ...job,
                        bullets: e.target.value.split("\n").filter((b) => b.trim().length > 0),
                      })
                    }
                    rows={Math.max(2, job.bullets.length)}
                    placeholder="One bullet per line"
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {pageCountNote ? (
        <p
          className={`text-sm ${
            pageCountNote.startsWith("Generated a 1-page")
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {pageCountNote}
        </p>
      ) : null}
      {downloadError ? <p className="text-sm text-red-600 dark:text-red-400">{downloadError}</p> : null}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {downloading ? "Generating…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
