"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RequireAuth } from "@/components/dashboard/require-auth";
import { Navbar } from "@/components/landing/navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth admin>
      <div className="min-h-screen">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <div className="lg:grid lg:grid-cols-[260px_1fr]">
          <div className="sticky top-0 hidden h-screen lg:block">
            <DashboardSidebar variant="admin" />
          </div>
          <div className="min-h-screen px-4 py-8 sm:px-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
