"use client";

import Link from "next/link";
import { BookOpen, MessageCircle, PlayCircle } from "lucide-react";
import { CourseCard } from "@/components/dashboard/course-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { COURSES } from "@/lib/data/courses";
import { useAuthStore } from "@/lib/store/auth-store";

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const enrollments = useAuthStore((s) => s.enrollments).filter((e) => e.userId === user?.id);
  const continueCourse = enrollments
    .map((e) => ({ e, course: COURSES.find((c) => c.id === e.courseId) }))
    .find((x) => x.course && x.e.progressPercentage < 100);
  const suggested = COURSES.filter(
    (c) => !enrollments.some((e) => e.courseId === c.id)
  ).slice(0, 6);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Student hub</p>
      <h1 className="mt-2 font-display text-3xl">Hey {user?.fullName?.split(" ")[0]}, keep shipping.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {enrollments.length} enrolled · pick up where you left off or explore the catalog.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 p-5">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="mt-3 font-display text-2xl">{enrollments.length}</p>
          <p className="text-sm text-muted-foreground">Active enrollments</p>
        </div>
        <div className="rounded-2xl border border-border/70 p-5">
          <PlayCircle className="h-5 w-5 text-primary" />
          <p className="mt-3 font-display text-2xl">
            {enrollments[0]?.progressPercentage ?? 0}%
          </p>
          <p className="text-sm text-muted-foreground">Latest course progress</p>
        </div>
        <div className="rounded-2xl border border-border/70 p-5">
          <MessageCircle className="h-5 w-5 text-primary" />
          <p className="mt-3 font-display text-2xl">Live</p>
          <p className="text-sm text-muted-foreground">Peer chat + Zing copilot</p>
        </div>
      </div>

      {continueCourse?.course ? (
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-xs uppercase tracking-widest text-primary">Continue watching</p>
          <h2 className="mt-1 font-display text-xl">{continueCourse.course.title}</h2>
          <Progress value={continueCourse.e.progressPercentage} className="mt-4 max-w-md" />
          <Button asChild className="mt-4">
            <Link href={`/dashboard/learn/${continueCourse.course.id}`}>Resume player</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-display text-lg">No courses in progress</p>
          <p className="mt-1 text-sm text-muted-foreground">Enroll from the catalog to start a sprint.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/courses">Browse catalog</Link>
          </Button>
        </div>
      )}

      <h2 className="mt-10 font-display text-xl">Recommended</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {suggested.map((c, i) => (
          <CourseCard key={c.id} course={c} index={i} />
        ))}
      </div>
    </div>
  );
}
