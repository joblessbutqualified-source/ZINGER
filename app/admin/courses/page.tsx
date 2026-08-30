"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_CATEGORIES, type Course } from "@/lib/types";
import { emptyCourse, useCatalogStore } from "@/lib/store/catalog-store";
import { COURSES } from "@/lib/data/courses";
import { toast } from "@/lib/store/toast-store";
import { formatINR } from "@/lib/utils";

export default function AdminCoursesPage() {
  const extras = useCatalogStore((s) => s.extras);
  const upsert = useCatalogStore((s) => s.upsert);
  const remove = useCatalogStore((s) => s.remove);
  const [draft, setDraft] = useState<Course>(emptyCourse());

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    upsert({ ...draft, title: draft.title.trim() });
    toast({ title: "Course saved", variant: "success" });
    setDraft(emptyCourse());
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Course management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Add or edit catalog entries (draft UI, local + merge with seed data).</p>

      <form onSubmit={save} className="mt-8 grid gap-4 rounded-2xl border border-border/70 p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Title</Label>
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as Course["category"] })}
          >
            {COURSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Price (INR)</Label>
          <Input
            type="number"
            min={0}
            value={draft.priceInr}
            onChange={(e) => setDraft({ ...draft, priceInr: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Lessons</Label>
          <Input
            type="number"
            min={1}
            value={draft.totalLessons}
            onChange={(e) => setDraft({ ...draft, totalLessons: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Instructor</Label>
          <Input
            value={draft.instructor}
            onChange={(e) => setDraft({ ...draft, instructor: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Save course</Button>
        </div>
      </form>

      <h2 className="mt-10 font-display text-xl">Custom / edited</h2>
      {extras.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No custom courses yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {extras.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <span>
                {c.title} · {formatINR(c.priceInr)}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDraft(c)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 font-display text-xl">Seed catalog ({COURSES.length})</h2>
      <p className="text-sm text-muted-foreground">Read-only baseline. Use Edit on a clone via Save as new title if needed.</p>
    </div>
  );
}
