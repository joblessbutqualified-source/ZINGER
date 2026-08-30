"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ZingerLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGooglePlaceholder, signInWithPassword } from "@/lib/auth/session";
import { toast } from "@/lib/store/toast-store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { user, error } = await signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast({ title: "Sign-in issue", description: error, variant: "error" });
      return;
    }
    toast({
      title: "Welcome back to Zinger!",
      description: `Good to see you, ${user.fullName}.`,
      variant: "success",
    });
    const dest = next || (user.role === "admin" ? "/admin" : "/dashboard");
    router.push(dest);
    router.refresh();
  };

  const google = async () => {
    const { error } = await signInWithGooglePlaceholder();
    if (error) {
      toast({ title: "Google OAuth", description: error, variant: "error" });
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button className="w-full" disabled={busy} type="submit">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <Button className="w-full" type="button" variant="outline" onClick={() => void google()}>
        Continue with Google
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Admin demo: admin@zinger.com · any password (demo mode)
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/60 p-8 backdrop-blur-xl">
        <Link href="/" className="inline-block">
          <ZingerLogo />
        </Link>
        <h1 className="mt-6 font-display text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your sprint.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
