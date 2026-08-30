"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireAuth({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (admin && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [admin, hydrated, router, user]);

  if (!hydrated || !user || (admin && user.role !== "admin")) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
