"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ZingerLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGooglePlaceholder, signUpWithPassword } from "@/lib/auth/session";
import { toast } from "@/lib/store/toast-store";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { user, error } = await signUpWithPassword({ email, password, fullName });
    setBusy(false);
    if (error) {
      toast({ title: "Could not sign up", description: error, variant: "error" });
      return;
    }
    toast({
      title: "Welcome to Zinger!",
      description: "Your studio desk is ready.",
      variant: "success",
    });
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/60 p-8 backdrop-blur-xl">
        <Link href="/" className="inline-block">
          <ZingerLogo />
        </Link>
        <h1 className="mt-6 font-display text-2xl">Create your desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">Email, password, or Google (placeholder).</p>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {busy ? "Creating…" : "Get started"}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={async () => {
              const { error } = await signInWithGooglePlaceholder();
              if (error) toast({ title: "Google OAuth", description: error, variant: "error" });
            }}
          >
            Continue with Google
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
