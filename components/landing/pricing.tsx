"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { POPULAR_STREAMS } from "@/lib/data/courses";
import { PRICING_PLANS } from "@/lib/data/content";
import { cn, formatINR } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="section-pad">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Honest INR. No dollar theatre.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-3xl border p-8",
                plan.highlighted
                  ? "border-primary/50 bg-primary/10 shadow-[0_0_40px_hsl(38_92%_55%/0.15)]"
                  : "border-border/80 bg-card/50 backdrop-blur-xl"
              )}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </span>
              ) : null}
              <h3 className="font-display text-2xl">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                {formatINR(plan.priceInr)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{plan.cadence}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"}>
                <Link href="/signup">Start {plan.name}</Link>
              </Button>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_STREAMS.map((s) => (
            <div key={s.category} className="rounded-2xl border border-border/70 p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.category}</p>
              <p className="mt-1 font-display text-xl">From {formatINR(s.fromInr)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
