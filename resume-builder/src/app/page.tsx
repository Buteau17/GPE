"use client";

import { Check, Copy, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { AtsMeter } from "@/components/AtsMeter";
import { EditorPanel } from "@/components/EditorPanel";
import { IntakePanel } from "@/components/IntakePanel";
import { PreviewPane } from "@/components/PreviewPane";
import { buildKeywordAnalysis } from "@/lib/keywords";
import { renderResumePdf } from "@/lib/pdf/generatePdf";
import { optimizeResume } from "@/lib/resumeOptimizer";
import { resumeDataToText } from "@/lib/resumeText";
import { ACCENTS } from "@/lib/tokens";
import { emptyResumeData, type KeywordAnalysis, type ResumeData } from "@/lib/types";

function slugifyFilename(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug || "resume";
}

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData());
  const [hasResume, setHasResume] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pageCountNote, setPageCountNote] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function handleResumeParsed(data: ResumeData) {
    setResumeData(data);
    setHasResume(true);
    setAnalysis(null);
  }

  function handleTailor() {
    setTailoring(true);
    try {
      const beforeText = resumeDataToText(resumeData);
      const optimized = optimizeResume(resumeData, jobDescription);
      const afterText = resumeDataToText(optimized);
      setResumeData(optimized);
      setAnalysis(buildKeywordAnalysis(beforeText, afterText, jobDescription));
    } finally {
      setTailoring(false);
    }
  }

  function handleCopyText() {
    const { contact, summary, experience, education, skills, projects, certifications } = resumeData;
    const lines: string[] = [];
    lines.push(contact.fullName || "Your Name");
    if (contact.title) lines.push(contact.title);
    lines.push(
      [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website]
        .filter(Boolean)
        .join(" | "),
    );
    lines.push("");
    if (summary) {
      lines.push("SUMMARY", summary, "");
    }
    if (experience.some((e) => e.company || e.title)) {
      lines.push("EXPERIENCE");
      experience.forEach((e) => {
        lines.push(`${e.title || "Role"} — ${e.company || "Company"}`);
        lines.push([e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")].filter(Boolean).join(" | "));
        e.bullets.filter(Boolean).forEach((b) => lines.push(`- ${b}`));
        lines.push("");
      });
    }
    if (education.some((e) => e.school)) {
      lines.push("EDUCATION");
      education.forEach((e) => {
        lines.push(`${e.degree || "Degree"} — ${e.school}`);
        lines.push([e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")].filter(Boolean).join(" | "));
        if (e.details) lines.push(e.details);
        lines.push("");
      });
    }
    if (skills.length > 0) {
      lines.push("SKILLS", skills.join(", "), "");
    }
    if (projects.some((p) => p.name)) {
      lines.push("PROJECTS");
      projects.forEach((p) => {
        lines.push(`${p.name}${p.tech ? ` (${p.tech})` : ""}`);
        if (p.description) lines.push(p.description);
        if (p.link) lines.push(p.link);
        lines.push("");
      });
    }
    if (certifications.length > 0) {
      lines.push("CERTIFICATIONS", certifications.join(", "), "");
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    setPageCountNote(null);
    try {
      const { blob, pageCount } = await renderResumePdf(resumeData);
      setPageCountNote(
        pageCount <= 1
          ? "Generated a 1-page PDF."
          : `Generated a ${pageCount}-page PDF — trim content if you'd like a strict one-pager.`,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugifyFilename(resumeData.contact.fullName || "resume")}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ background: "#E7E5DC", minHeight: "100vh", color: "#14181F" }}>
      {/* Top bar */}
      <div
        className="no-print flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ background: "#14181F" }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: 17, color: "#FBFAF6" }}>
            resume<span style={{ color: accent.hex }}>.</span>build
          </div>
          <div style={{ fontFamily: "var(--font-plex-mono)", fontSize: 11, color: "#8B94A3" }}>
            upload your CV, tailor it to a job posting, export a 1-page ATS-friendly PDF
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            {ACCENTS.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => setAccent(a)}
                title={a.label}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: a.hex,
                  border: accent.id === a.id ? "2px solid #FBFAF6" : "2px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded transition"
            style={{ fontFamily: "var(--font-plex-mono)", fontSize: 12, color: "#FBFAF6", border: "1px solid #3A4152", background: "transparent" }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded transition disabled:opacity-60"
            style={{ fontFamily: "var(--font-plex-mono)", fontSize: 12, color: "#14181F", background: "#FBFAF6", border: "1px solid #FBFAF6" }}
          >
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="no-print max-w-[1400px] mx-auto p-6 pb-2">
        <IntakePanel
          onResumeParsed={handleResumeParsed}
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          onTailor={handleTailor}
          hasResume={hasResume}
          tailoring={tailoring}
          accent={accent.hex}
        />
        {pageCountNote ? (
          <p className="mt-3 text-sm" style={{ color: pageCountNote.startsWith("Generated a 1-page") ? "#3E7A5C" : "#B8863B" }}>
            {pageCountNote}
          </p>
        ) : null}
        {downloadError ? (
          <p className="mt-3 text-sm" style={{ color: "#A34438" }}>
            {downloadError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6 pt-2 max-w-[1400px] mx-auto">
        <div className="no-print w-full lg:w-[46%] rounded-lg" style={{ background: "#fff", border: "1px solid #E7E5DC" }}>
          <AtsMeter resumeData={resumeData} analysis={analysis} accent={accent.hex} />
          <EditorPanel resumeData={resumeData} setResumeData={setResumeData} />
        </div>
        <PreviewPane resumeData={resumeData} accent={accent.hex} />
      </div>
    </div>
  );
}
