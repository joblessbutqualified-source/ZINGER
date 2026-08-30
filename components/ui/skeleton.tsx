import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted bg-[length:200%_100%] bg-gradient-to-r from-muted via-secondary to-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
