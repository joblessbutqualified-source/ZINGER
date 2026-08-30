import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ZingerLogo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <ZingerLogo />
      <h1 className="mt-8 font-display text-4xl">This page skipped class</h1>
      <p className="mt-2 text-sm text-muted-foreground">404 — we couldn&apos;t find that route.</p>
      <Button asChild className="mt-6">
        <Link href="/">Back to Zinger</Link>
      </Button>
    </div>
  );
}
