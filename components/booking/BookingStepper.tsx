export function BookingStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Booking progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "todo";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                state === "done"
                  ? "bg-primary text-white"
                  : state === "active"
                    ? "bg-primary-light text-teal-800 ring-2 ring-primary"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {state === "done" ? "✓" : n}
            </span>
            <span className={`text-xs sm:text-sm ${state === "todo" ? "text-slate-400" : "text-slate-700"}`}>
              {label}
            </span>
            {n < steps.length && <span aria-hidden className="mx-1 h-px w-4 sm:w-8 bg-slate-300" />}
          </li>
        );
      })}
    </ol>
  );
}