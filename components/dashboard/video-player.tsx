"use client";

import { Check, Circle, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLessonsForCourse } from "@/lib/data/courses";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VideoPlayer({ course }: { course: Course }) {
  const lessons = useMemo(() => getLessonsForCourse(course), [course]);
  const user = useAuthStore((s) => s.user);
  const enrollments = useAuthStore((s) => s.enrollments);
  const updateProgress = useAuthStore((s) => s.updateProgress);
  const enrollment = enrollments.find(
    (e) => e.userId === user?.id && e.courseId === course.id
  );
  const completed = enrollment?.completedLessons ?? [];
  const [active, setActive] = useState(lessons[0]?.id ?? "");
  const current = lessons.find((l) => l.id === active) ?? lessons[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,185,66,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(46,230,214,0.15),transparent_40%)]" />
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <Play className="h-14 w-14 text-primary" />
            <p className="mt-3 font-display text-xl">{current?.title}</p>
            <p className="text-sm text-muted-foreground">Embedded player placeholder · {current?.duration}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[200px] flex-1">
            <p className="text-xs text-muted-foreground">Continue watching</p>
            <Progress value={enrollment?.progressPercentage ?? 0} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {enrollment?.progressPercentage ?? 0}% complete
            </p>
          </div>
          <Button
            onClick={() => {
              if (!current) return;
              updateProgress(course.id, current.id, course.totalLessons);
            }}
          >
            Mark as complete
          </Button>
        </div>
      </div>
      <aside className="max-h-[640px] overflow-y-auto rounded-2xl border border-border/80 p-3">
        {lessons.map((l) => {
          const done = completed.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(l.id)}
              className={cn(
                "mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm",
                active === l.id ? "bg-primary/15" : "hover:bg-secondary"
              )}
            >
              {done ? (
                <Check className="mt-0.5 h-4 w-4 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              )}
              <span>
                <span className="block font-medium">{l.title}</span>
                <span className="text-xs text-muted-foreground">{l.duration}</span>
              </span>
            </button>
          );
        })}
      </aside>
    </div>
  );
}
