"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ZingerLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/store/toast-store";

export function Footer() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Enter a valid email", variant: "error" });
      return;
    }
    toast({
      title: "You're on the list",
      description: "Studio notes will land in your inbox.",
      variant: "success",
    });
    setEmail("");
  };

  return (
    <footer className="border-t border-border/60 bg-background/70">
      <div className="container grid gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <ZingerLogo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Zinger Edutech HQ, 14th Floor, Helios Tech Park, Outer Ring Road,
            Bellandur, Bengaluru, KA 560103, India.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">CIN: U80902KA2024PTC182441</p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="https://linkedin.com" className="hover:text-primary" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://x.com" className="hover:text-primary" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="https://instagram.com" className="hover:text-primary" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://youtube.com" className="hover:text-primary" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Studio</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/#about">About</Link>
            <Link href="/dashboard/courses">Courses</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Legal & notes</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/terms">Terms of use</Link>
            <Link href="/privacy">Privacy policy</Link>
          </div>
          <form onSubmit={onSubmit} className="mt-5 flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email"
              type="email"
              aria-label="Newsletter email"
            />
            <Button type="submit" size="sm" className="shrink-0">
              Join
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zinger Edutech Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}
