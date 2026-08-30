import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(
    url &&
      key &&
      url.startsWith("http") &&
      !url.includes("your_supabase") &&
      !key.includes("your_supabase")
  );
}

export const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "admin@zinger.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeUsername(fullName: string, email?: string): string {
  const fromName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18);
  const fromEmail = (email?.split("@")[0] ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  return fromName || fromEmail || "learner";
}

export function isUsernameValid(username: string): boolean {
  return /^[a-z0-9._]{3,24}$/.test(username);
}

export const ONLINE_WINDOW_MS = 60_000;

export function isOnline(lastSeenAt?: string | null, now = Date.now()): boolean {
  if (!lastSeenAt) return false;
  const t = new Date(lastSeenAt).getTime();
  if (Number.isNaN(t)) return false;
  return now - t < ONLINE_WINDOW_MS;
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  return `${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(d)}, ${time}`;
}

export function formatMessageTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatLastActive(lastSeenAt?: string | null): string {
  if (!lastSeenAt) return "Offline";
  if (isOnline(lastSeenAt)) return "Active now";
  const t = new Date(lastSeenAt).getTime();
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Active ${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${Math.floor(hours / 24)}d ago`;
}
