import { cn } from "@/lib/utils";

export function ZingerLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <defs>
          <linearGradient id="zg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5b942" />
            <stop offset="100%" stopColor="#2ee6d6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#zg)" />
        <path
          d="M8 10h16l-10 6h10L8 22"
          fill="none"
          stroke="#0b0b12"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        Zinger
      </span>
    </span>
  );
}
