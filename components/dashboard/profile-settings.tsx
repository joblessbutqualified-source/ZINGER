"use client";

import { FormEvent, useEffect, useState } from "react";
import { Camera, Link2 } from "lucide-react";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfile, uploadAvatarFile } from "@/lib/chat/profile-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/lib/store/toast-store";
import { isUsernameValid } from "@/lib/utils";

export function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setUsername(user.username);
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  if (!user) return null;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const { url, error } = await uploadAvatarFile(file);
    setBusy(false);
    if (error || !url) {
      toast({ title: "Upload failed", description: error, variant: "error" });
      return;
    }
    setAvatarUrl(url);
    toast({ title: "Preview ready", description: "Save to publish across chat.", variant: "success" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase();
    if (!isUsernameValid(clean)) {
      toast({
        title: "Invalid username",
        description: "Use 3–24 characters: letters, numbers, dots, underscores.",
        variant: "error",
      });
      return;
    }
    setBusy(true);
    const { error } = await saveProfile({
      fullName,
      username: clean,
      avatarUrl: avatarUrl.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Couldn’t save", description: error, variant: "error" });
      return;
    }
    toast({
      title: "Profile live",
      description: "Name, username, and photo now sync in DMs in realtime.",
      variant: "success",
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Account</p>
      <h1 className="mt-2 font-display text-3xl">Profile & settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Changes land instantly in the DM directory, chat headers, and your own bubbles.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-6">
        <div className="flex items-center gap-5">
          <UserAvatar name={fullName || user.fullName} src={avatarUrl} size="lg" />
          <div className="space-y-2">
            <Label htmlFor="avatar-file" className="cursor-pointer">
              <span className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm">
                <Camera className="mr-2 h-4 w-4" />
                Upload photo
              </span>
            </Label>
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">PNG or JPG · max 2 MB · or paste a URL below</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar-url">Avatar URL</Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="avatar-url"
              className="pl-9"
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              className="pl-8"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled />
          <p className="text-xs text-muted-foreground">Email is locked for account security.</p>
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
