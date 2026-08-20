"use client";

import { useState } from "react";

interface Props {
  jobDescription: string;
  onChange: (jobDescription: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function JobStep({ jobDescription, onChange, onBack, onNext }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);

  async function handleFetch() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setFetchedTitle(null);
    try {
      const res = await fetch("/api/job/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch that job posting.");
      onChange(json.description);
      setFetchedTitle([json.jobTitle, json.company].filter(Boolean).join(" at ") || "Job posting fetched");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch that job posting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add the job posting</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Paste a LinkedIn, Indeed, or Glassdoor link and we&apos;ll try to read the description — or just
          paste the job description text directly below.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          placeholder="https://www.linkedin.com/jobs/view/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Fetching…" : "Fetch description"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : fetchedTitle ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Loaded: {fetchedTitle}</p>
      ) : null}

      <div>
        <label htmlFor="job-description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Job description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder="Paste the full job description here…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

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
          onClick={onNext}
          disabled={jobDescription.trim().length < 40}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
