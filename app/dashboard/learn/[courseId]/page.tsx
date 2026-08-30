"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/dashboard/video-player";
import { Button } from "@/components/ui/button";
import { findCourse, useCatalogStore } from "@/lib/store/catalog-store";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LearnPage() {
  const params = useParams<{ courseId: string }>();
  const extras = useCatalogStore((s) => s.extras);
  const course = findCourse(params.courseId, extras);
  const user = useAuthStore((s) => s.user);
  const enrolled = useAuthStore((s) =>
    s.enrollments.some((e) => e.userId === user?.id && e.courseId === params.courseId)
  );

  if (!course) {
    return <p className="py-20 text-center">Lesson not found.</p>;
  }

  if (!enrolled) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl">Enroll to unlock the player</p>
        <Button asChild className="mt-4">
          <Link href={`/dashboard/courses/${course.id}`}>View course</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-primary">{course.category}</p>
      <h1 className="mt-1 font-display text-3xl">{course.title}</h1>
      <div className="mt-8">
        <VideoPlayer course={course} />
      </div>
    </div>
  );
}
