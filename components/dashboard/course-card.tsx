"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        href={`/dashboard/courses/${course.id}`}
        className="group block overflow-hidden rounded-2xl border border-border/80 bg-card/60 transition hover:border-primary/40"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge className="absolute left-3 top-3">{course.category}</Badge>
        </div>
        <div className="p-4">
          <h3 className="font-display text-base font-semibold leading-snug">{course.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {course.rating}
            </span>
            <span>{course.totalLessons} lessons</span>
            <span className="font-semibold text-foreground">{formatINR(course.priceInr)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
