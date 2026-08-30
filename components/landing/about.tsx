"use client";

import { motion } from "framer-motion";

const VALUES = [
  {
    title: "Mission",
    body: "Make world-class product craft affordable and culturally native for Indian learners — without watering down the bar.",
  },
  {
    title: "Vision",
    body: "A generation of engineers and designers who ship like studios, not like tutorial tourists.",
  },
  {
    title: "Values",
    body: "Clarity over hype. Mentorship over content dumps. Outcomes over vanity certificates.",
  },
  {
    title: "Culture",
    body: "Small teams, high taste, async-first. We hire operators who have built, not just taught.",
  },
];

export function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container grid items-start gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">About Zinger</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Built in Bengaluru. Tuned for the whole country.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Zinger Edutech Pvt. Ltd. started as a late-night study circle in Koramangala
            and grew into a full learning OS. We run like a product company: weekly
            releases, design critiques, and instructors who still ship on the side.
          </p>
          <p className="mt-4 text-muted-foreground">
            Our campus is virtual; our standards are not. Every course is reviewed by
            practitioners from India&apos;s product ecosystem before it goes live.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="font-display text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
