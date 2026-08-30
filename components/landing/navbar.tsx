"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, Droplets, Leaf, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { ZingerLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/effects/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUIStore, type AmbientEffect } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
  { href: "/#stories", label: "Stories" },
];

const FX: { id: AmbientEffect; label: string; icon: typeof Leaf }[] = [
  { id: "leaves", label: "Leaves", icon: Leaf },
  { id: "clouds", label: "Clouds", icon: Cloud },
  { id: "water", label: "Water", icon: Droplets },
  { id: "none", label: "None", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const ambient = useUIStore((s) => s.ambient);
  const setAmbient = useUIStore((s) => s.setAmbient);
  const customCursor = useUIStore((s) => s.customCursor);
  const setCustomCursor = useUIStore((s) => s.setCustomCursor);
  const [open, setOpen] = useState(false);
  const marketing = pathname === "/" || pathname === "/terms" || pathname === "/privacy";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/55 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <ZingerLogo />
        </Link>
        {marketing ? (
          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                FX
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FX.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => setAmbient(f.id)}
                  className={cn(ambient === f.id && "bg-secondary")}
                >
                  <f.icon className="mr-2 h-4 w-4" />
                  {f.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setCustomCursor(!customCursor)}>
                Cursor {customCursor ? "on" : "off"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
            </Button>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 text-sm">
                {l.label}
              </Link>
            ))}
            {!user ? (
              <Link href="/login" onClick={() => setOpen(false)} className="py-1 text-sm">
                Log in
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
