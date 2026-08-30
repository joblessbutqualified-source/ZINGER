"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RequireAuth } from "@/components/dashboard/require-auth";
import { Navbar } from "@/components/landing/navbar";
import { PresenceSync } from "@/components/providers/presence-sync";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <PresenceSync />
      <div className="min-h-screen">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <div className="lg:grid lg:grid-cols-[260px_1fr]">
          <div className="hidden h-screen sticky top-0 lg:block">
            <DashboardSidebar variant="student" />
          </div>
          <div className="min-h-screen px-4 py-8 sm:px-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
