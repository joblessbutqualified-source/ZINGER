"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RequireAuth } from "@/components/dashboard/require-auth";
import { Navbar } from "@/components/landing/navbar";
import { PresenceSync } from "@/components/providers/presence-sync";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname === "/dashboard/chat";

  return (
    <RequireAuth>
      <PresenceSync />
      <div className={cn("flex flex-col", isChat ? "h-dvh overflow-hidden" : "min-h-screen")}>
        <div className="shrink-0 lg:hidden">
          <Navbar />
        </div>
        <div
          className={cn(
            "lg:grid lg:grid-cols-[260px_1fr]",
            isChat && "min-h-0 flex-1 overflow-hidden"
          )}
        >
          <div className={cn("sticky top-0 hidden lg:block", isChat ? "h-full" : "h-screen")}>
            <DashboardSidebar variant="student" />
          </div>
          <div
            className={cn(
              isChat ? "h-full min-h-0 overflow-hidden" : "min-h-screen px-4 py-8 sm:px-8"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
