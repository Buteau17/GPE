"use client";

import { useRef, useState } from "react";
import { detectResumeType, extractTextFromResume } from "@/lib/resumeParser";
import { parseResumeText } from "@/lib/structuredResume";
import type { ResumeData } from "@/lib/types";

interface Props {
  onParsed: (data: ResumeData, rawText: string) => void;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export function UploadStep({ onParsed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File is too large (max 8MB).");
      }
      const type = detectResumeType(file.name, file.type);
      if (!type) {
        throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      }

      let rawText: string;
      try {
        rawText = await extractTextFromResume(file, type);
      } catch {
        throw new Error("Couldn't read that file. Make sure it isn't password-protected or corrupted.");
      }

      if (!rawText || rawText.trim().length < 40) {
        throw new Error(
          "Couldn't find enough text in that file. It may be a scanned image without selectable text.",
        );
      }

      const data = parseResumeText(rawText);
      onParsed(data, rawText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Upload your resume</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          PDF, DOCX, or TXT. We&apos;ll extract your details so you can tailor them to a job posting. Everything
          runs in your browser — nothing is uploaded anywhere.
        </p>
      </div>

      <label
        htmlFor="resume-file"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white px-6 py-10 text-center transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {fileName ? fileName : "Click to choose a file, or drag it here"}
        </span>
        <span className="text-xs text-zinc-400">.pdf, .docx, or .txt — up to 8MB</span>
        <input
          ref={inputRef}
          id="resume-file"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Reading your resume…</p>
      ) : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
