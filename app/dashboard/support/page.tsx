"use client";

import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/lib/store/toast-store";

export default function SupportPage() {
  const user = useAuthStore((s) => s.user);
  const tickets = useAuthStore((s) => s.tickets).filter((t) => t.userId === user?.id);
  const addTicket = useAuthStore((s) => s.addTicket);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    addTicket(subject.trim(), description.trim());
    setSubject("");
    setDescription("");
    toast({ title: "Ticket submitted", description: "We'll ping you in-app.", variant: "success" });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">Support</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        File a query or use Zing in the corner for instant answers.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border/70 p-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">What happened?</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <Button type="submit">Submit ticket</Button>
      </form>

      <h2 className="mt-10 font-display text-xl">Your tickets</h2>
      {tickets.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No tickets yet. When you hit a wall, drop it here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {tickets.map((t) => (
            <article key={t.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{t.subject}</h3>
                <Badge variant={t.status === "resolved" ? "accent" : "default"}>{t.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(t.createdAt).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
