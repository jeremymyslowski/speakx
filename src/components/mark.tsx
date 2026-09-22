import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-foreground", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 13.2h3.4l5.6-4.4v14.4L10.4 18.8H7A1.2 1.2 0 0 1 5.8 17.6v-3.2A1.2 1.2 0 0 1 7 13.2Z"
        fill="currentColor"
      />
      <path
        d="M20.2 11.4a4.4 4.4 0 0 1 0 9.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M23.4 8.6a8 8 0 0 1 0 14.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function Equalizer({ className, active }: { className?: string; active?: boolean }) {
  return (
    <span className={cn("inline-flex h-3.5 items-end gap-[3px]", className)} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "eq-bar w-[2.5px] rounded-full bg-current",
            i === 0 || i === 3 ? "h-2" : "h-3.5",
            !active && "[animation:none] opacity-50",
          )}
        />
      ))}
    </span>
  );
}
