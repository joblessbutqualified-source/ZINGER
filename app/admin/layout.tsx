"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { RequireAuth } from "@/components/dashboard/require-auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth admin>
      <div className="min-h-screen">
        <MobileHeader variant="admin" />
        <div className="h-16 shrink-0 md:hidden" aria-hidden />
        <div className="md:grid md:grid-cols-[260px_1fr]">
          <div className="sticky top-0 hidden h-screen md:block">
            <DashboardSidebar variant="admin" />
          </div>
          <div className="min-h-screen px-4 py-8 sm:px-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
