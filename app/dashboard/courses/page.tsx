"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/dashboard/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COURSE_CATEGORIES, type CourseCategory } from "@/lib/types";
import { mergeCourses, useCatalogStore } from "@/lib/store/catalog-store";

const PAGE_SIZE = 12;

export default function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | CourseCategory>("All");
  const [page, setPage] = useState(1);

  const extras = useCatalogStore((s) => s.extras);
  const catalog = mergeCourses(extras);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return catalog.filter((c) => {
      const matchCat = cat === "All" || c.category === cat;
      const matchQ =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query));
      return matchCat && matchQ;
    });
  }, [q, cat, catalog]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="font-display text-3xl">Catalog</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {catalog.length} production courses · filter, search, paginate.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search React, Kubernetes, Figma…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", ...COURSE_CATEGORIES] as const).map((c) => (
          <Button
            key={c}
            size="sm"
            variant={cat === c ? "default" : "outline"}
            onClick={() => {
              setCat(c);
              setPage(1);
            }}
          >
            {c}
          </Button>
        ))}
      </div>

      {slice.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-lg">No courses match that filter</p>
          <p className="text-sm text-muted-foreground">Try another stream or clear search.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {slice.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {pages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
