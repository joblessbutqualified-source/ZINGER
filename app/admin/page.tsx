"use client";

import { COURSES } from "@/lib/data/courses";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCatalogStore } from "@/lib/store/catalog-store";

export default function AdminHome() {
  const extras = useCatalogStore((s) => s.extras);
  const students = useAuthStore((s) => (s.user ? 1 : 0)) + 84200;
  const sales = useAuthStore((s) => s.enrollments.length);
  const tickets = useAuthStore((s) => s.tickets.length);

  const metrics = [
    { label: "Registered students", value: students.toLocaleString("en-IN") },
    { label: "Course sales (this workspace)", value: String(sales) },
    { label: "Support tickets", value: String(tickets) },
    { label: "Catalog size", value: String(COURSES.length + extras.length) },
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Admin</p>
      <h1 className="mt-2 font-display text-3xl">Studio metrics</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Restricted to whitelisted emails (admin@zinger.com). Live totals mix demo baseline with this session.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border/70 bg-card/50 p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</p>
            <p className="mt-3 font-display text-3xl">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
