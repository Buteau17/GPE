const STEPS = ["Upload resume", "Job posting", "Review & download"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-4">
      {STEPS.map((label, idx) => {
        const stepNumber = idx + 1;
        const isActive = stepNumber === current;
        const isDone = stepNumber < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isDone
                  ? "bg-emerald-600 text-white"
                  : isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {isDone ? "✓" : stepNumber}
            </span>
            <span
              className={`hidden text-sm font-medium sm:block ${
                isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {label}
            </span>
            {stepNumber !== STEPS.length ? (
              <span className="mx-1 h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
