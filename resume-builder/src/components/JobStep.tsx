"use client";

interface Props {
  jobDescription: string;
  onChange: (jobDescription: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function JobStep({ jobDescription, onChange, onBack, onNext }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add the job posting</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Open the job posting (LinkedIn, Indeed, Glassdoor, or anywhere else), copy the full description, and
          paste it below.
        </p>
      </div>

      <div>
        <label htmlFor="job-description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Job description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
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
