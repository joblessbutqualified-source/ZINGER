"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ZingerLogo } from "@/components/brand/logo";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/effects/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileHeader({ variant }: { variant: "student" | "admin" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-1">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <Link href="/" className="min-w-0 shrink-0" aria-label="Zinger home">
              <ZingerLogo />
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <SheetContent
        side="left"
        className="flex h-full w-[min(100vw-1.5rem,300px)] flex-col gap-0 border-border/70 bg-card/95 p-0 backdrop-blur-2xl [&>button]:z-10"
      >
        <SheetTitle className="sr-only">Main navigation</SheetTitle>
        <DashboardSidebar variant={variant} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
