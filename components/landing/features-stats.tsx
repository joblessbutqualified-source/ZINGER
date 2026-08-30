"use client";

import { motion, useInView } from "framer-motion";
import { Brain, Code2, LineChart, Smartphone, Sparkles, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { STATS } from "@/lib/data/content";

const FEATURES = [
  {
    icon: Code2,
    title: "Build, don&apos;t binge",
    body: "Every module ends in a shippable artifact — not a quiz farm.",
  },
  {
    icon: Brain,
    title: "AI that actually helps",
    body: "Zing, our in-app copilot, unblocks you 24/7 with product-aware answers.",
  },
  {
    icon: Workflow,
    title: "Studio cadence",
    body: "Sprints, reviews, and peer chat that mimic a high-agency product team.",
  },
  {
    icon: LineChart,
    title: "Signals over certificates",
    body: "Hiring partners see progress, capstones, and real Git history.",
  },
  {
    icon: Smartphone,
    title: "Learn anywhere",
    body: "Continue watching, offline notes, and a player that remembers you.",
  },
  {
    icon: Sparkles,
    title: "Crafted for India",
    body: "INR pricing, UPI-ready checkout simulation, and IST mentor hours.",
  },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-bold sm:text-5xl">
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function FeaturesStats() {
  return (
    <section id="features" className="section-pad">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">The studio</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            A campus without the campus tax
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-6 text-center">
              <Counter value={s.value} suffix={s.suffix} />
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title.replace("&apos;", "'")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
