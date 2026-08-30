"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Settings,
  Shield,
} from "lucide-react";
import { ZingerLogo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn, isOnline } from "@/lib/utils";

const STUDENT = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ADMIN = [
  { href: "/admin", label: "Metrics", icon: Shield },
  { href: "/admin/courses", label: "Manage courses", icon: GraduationCap },
  { href: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
];

export function DashboardSidebar({
  variant,
  onNavigate,
}: {
  variant: "student" | "admin";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const links = variant === "admin" ? ADMIN : STUDENT;

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border/70 bg-card/40 p-4 backdrop-blur-xl">
      <Link href="/" className="px-2 py-1" onClick={onNavigate}>
        <ZingerLogo />
      </Link>
      <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {links.map((l) => {
          const active =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
        {user?.role === "admin" && variant === "student" ? (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            <Shield className="h-4 w-4" />
            Admin portal
          </Link>
        ) : null}
      </nav>
      <div className="mt-3 shrink-0 rounded-xl border border-border/60 p-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user?.fullName ?? "Guest"}
            src={user?.avatarUrl}
            online={isOnline(user?.lastSeenAt)}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.fullName ?? "Guest"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.username ? `@${user.username}` : user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start"
          onClick={async () => {
            onNavigate?.();
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
