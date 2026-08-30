"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COURSES, getCourseById as getSeedCourse } from "@/lib/data/courses";
import type { Course, CourseCategory } from "@/lib/types";

interface CatalogState {
  extras: Course[];
  upsert: (course: Course) => void;
  remove: (id: string) => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      extras: [],
      upsert: (course) => {
        const rest = get().extras.filter((c) => c.id !== course.id);
        set({ extras: [course, ...rest] });
      },
      remove: (id) => set({ extras: get().extras.filter((c) => c.id !== id) }),
    }),
    { name: "zinger-catalog" }
  )
);

export function findCourse(id: string, extras: Course[]): Course | undefined {
  return extras.find((c) => c.id === id) ?? getSeedCourse(id);
}

export function mergeCourses(extras: Course[]): Course[] {
  const overridden = new Set(extras.map((c) => c.id));
  return [...extras, ...COURSES.filter((c) => !overridden.has(c.id))];
}

export function emptyCourse(): Course {
  return {
    id: `crs_custom_${Date.now()}`,
    title: "",
    description: "",
    category: "Web Dev" as CourseCategory,
    priceInr: 999,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    totalLessons: 10,
    instructor: "Zinger Faculty",
    rating: 4.8,
    students: 0,
    level: "Beginner",
    durationHours: 12,
    tags: ["New"],
    createdAt: new Date().toISOString(),
  };
}
