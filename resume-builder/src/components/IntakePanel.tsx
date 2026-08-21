"use client";

import { AlertCircle, Loader2, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { TextArea } from "./FormPrimitives";
import { detectResumeType, extractTextFromResume } from "@/lib/resumeParser";
import { parseResumeText } from "@/lib/structuredResume";
import { TOKENS } from "@/lib/tokens";
import type { ResumeData } from "@/lib/types";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

interface Props {
  onResumeParsed: (data: ResumeData) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onTailor: () => void;
  hasResume: boolean;
  tailoring: boolean;
  accent: string;
}

export function IntakePanel({
  onResumeParsed,
  jobDescription,
  onJobDescriptionChange,
  onTailor,
  hasResume,
  tailoring,
  accent,
}: Props) {
  const [fileName, setFileName] = useState("");
  const [parsingFile, setParsingFile] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setParsingFile(true);
    setError("");
    setFileName(file.name);
    try {
      if (file.size > MAX_FILE_SIZE) throw new Error("File is too large (max 8MB).");
      const type = detectResumeType(file.name, file.type);
      if (!type) throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");

      let rawText: string;
      try {
        rawText = await extractTextFromResume(file, type);
      } catch {
        throw new Error("Couldn't read that file. Make sure it isn't password-protected or corrupted.");
      }
      if (!rawText || rawText.trim().length < 40) {
        throw new Error("Couldn't find enough text in that file. It may be a scanned image without selectable text.");
      }

      onResumeParsed(parseResumeText(rawText));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read that file.");
    } finally {
      setParsingFile(false);
    }
  }

  const canTailor = hasResume && jobDescription.trim().length >= 40 && !tailoring;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-lg p-5" style={{ background: "#fff", border: `1px solid ${TOKENS.mist}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontFamily: "var(--font-plex-mono)", fontSize: 12, color: TOKENS.slate }}>01</span>
          <span style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15 }}>Your CV</span>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={parsingFile}
          className="w-full flex items-center justify-center gap-2 py-3 rounded mb-2 transition disabled:opacity-60"
          style={{
            border: `1.5px dashed ${TOKENS.mist}`,
            fontFamily: "var(--font-plex-mono)",
            fontSize: 12,
            color: TOKENS.slate,
            background: TOKENS.paper,
          }}
        >
          {parsingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {parsingFile ? "Reading…" : fileName || "Upload .pdf, .docx, or .txt"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="hidden"
        />
        <div style={{ fontSize: 11, color: TOKENS.slate, marginBottom: 8 }}>
          Everything happens in your browser — nothing is uploaded anywhere. Fields below fill in automatically;
          edit anything that needs a human touch.
        </div>
        {error ? (
          <div className="flex items-center gap-1.5" style={{ color: TOKENS.red, fontSize: 12.5 }}>
            <AlertCircle size={14} /> {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg p-5" style={{ background: "#fff", border: `1px solid ${TOKENS.mist}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontFamily: "var(--font-plex-mono)", fontSize: 12, color: TOKENS.slate }}>02</span>
          <span style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15 }}>
            Target job posting
          </span>
        </div>
        <TextArea
          label="Paste the job description"
          placeholder="Open the posting (LinkedIn, Indeed, Glassdoor, or anywhere else), copy the full description, and paste it here."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          rows={5}
        />
        <button
          type="button"
          onClick={onTailor}
          disabled={!canTailor}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 600,
            fontSize: 13,
            color: "#fff",
            background: canTailor ? accent : "#A9B3C1",
            cursor: canTailor ? "pointer" : "not-allowed",
          }}
        >
          {tailoring ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {tailoring ? "Tailoring…" : "Tailor resume to this job"}
        </button>
        {!hasResume ? (
          <div style={{ fontSize: 11, color: TOKENS.slate, marginTop: 8 }}>Upload your CV first (step 01).</div>
        ) : null}
      </div>
    </div>
  );
}
