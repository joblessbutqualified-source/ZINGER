import type { ChatMessage, Profile, UserRole } from "@/lib/types";
import { makeUsername } from "@/lib/utils";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  username?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string | null;
  last_seen_at?: string | null;
}

export interface ChatRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read?: boolean | null;
  read_at?: string | null;
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    username: row.username || makeUsername(row.full_name, row.email),
    avatarUrl: row.avatar_url,
    role: row.role === "admin" ? "admin" : "student",
    createdAt: row.created_at ?? new Date().toISOString(),
    lastSeenAt: row.last_seen_at,
  };
}

export function mapChatRow(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message,
    createdAt: row.created_at,
    isRead: Boolean(row.is_read),
    readAt: row.read_at,
  };
}

export function toProfileRow(profile: Profile): Record<string, unknown> {
  return {
    id: profile.id,
    full_name: profile.fullName,
    email: profile.email,
    username: profile.username,
    avatar_url: profile.avatarUrl ?? null,
    role: profile.role,
    last_seen_at: profile.lastSeenAt ?? null,
  };
}

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function ensureUsername(profile: Omit<Profile, "username"> & { username?: string }): Profile {
  return {
    ...profile,
    username: profile.username || makeUsername(profile.fullName, profile.email),
    role: profile.role as UserRole,
  };
}
