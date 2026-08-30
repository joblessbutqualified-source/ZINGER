"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import type { SupportTicket } from "@/lib/types";

export default function AdminTicketsPage() {
  const tickets = useAuthStore((s) => s.tickets);
  const update = useAuthStore((s) => s.updateTicketStatus);

  return (
    <div>
      <h1 className="font-display text-3xl">Support tickets</h1>
      {tickets.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No tickets in this workspace.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <article key={t.id} className="rounded-2xl border border-border/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-medium">{t.subject}</h2>
                <Badge>{t.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["open", "in_progress", "resolved"] as SupportTicket["status"][]).map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => update(t.id, s)}>
                    Mark {s}
                  </Button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
