"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PaymentModal } from "@/components/dashboard/payment-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findCourse, useCatalogStore } from "@/lib/store/catalog-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatINR } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const extras = useCatalogStore((s) => s.extras);
  const course = findCourse(params.id, extras);
  const user = useAuthStore((s) => s.user);
  const enrolled = useAuthStore((s) =>
    s.enrollments.some((e) => e.userId === user?.id && e.courseId === params.id)
  );
  const [pay, setPay] = useState(false);

  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl">Course not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/courses">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge>{course.category}</Badge>
        <Badge variant="secondary">{course.level}</Badge>
        <Badge variant="outline">{course.durationHours}h</Badge>
      </div>
      <h1 className="mt-4 font-display text-3xl">{course.title}</h1>
      <p className="mt-3 text-muted-foreground">{course.description}</p>
      <p className="mt-4 text-sm">
        Instructor <span className="font-medium">{course.instructor}</span> · {course.students.toLocaleString("en-IN")} learners
      </p>
      <p className="mt-4 font-display text-3xl">{formatINR(course.priceInr)}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {enrolled ? (
          <Button asChild>
            <Link href={`/dashboard/learn/${course.id}`}>Continue watching</Link>
          </Button>
        ) : (
          <Button onClick={() => setPay(true)}>Enroll now</Button>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">All courses</Link>
        </Button>
      </div>
      <PaymentModal course={course} open={pay} onOpenChange={setPay} />
    </div>
  );
}
