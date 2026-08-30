"use client";

import { useRouter } from "next/navigation";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/lib/auth/session";
import { useUIStore } from "@/lib/store/ui-store";

export default function ProfilePage() {
  const router = useRouter();
  const customCursor = useUIStore((s) => s.customCursor);
  const setCustomCursor = useUIStore((s) => s.setCustomCursor);

  return (
    <div>
      <ProfileSettings />
      <div className="mx-auto mt-10 max-w-xl space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Animated cursor</p>
            <p className="text-xs text-muted-foreground">Ripple + particle burst on click</p>
          </div>
          <Switch checked={customCursor} onCheckedChange={setCustomCursor} />
        </div>
        <Button
          variant="destructive"
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
