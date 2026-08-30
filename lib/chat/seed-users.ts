import type { Profile } from "@/lib/types";

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export function getSeedUsers(): Profile[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: "usr_peer_ananya",
      fullName: "Ananya Rao",
      username: "ananya.codes",
      email: "ananya@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=5",
      createdAt,
      lastSeenAt: minutesAgo(0.2),
    },
    {
      id: "usr_peer_karthik",
      fullName: "Karthik Menon",
      username: "karthik",
      email: "karthik@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=11",
      createdAt,
      lastSeenAt: minutesAgo(8),
    },
    {
      id: "usr_peer_sneha",
      fullName: "Sneha Iyer",
      username: "sneha.design",
      email: "sneha@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=32",
      createdAt,
      lastSeenAt: minutesAgo(2),
    },
    {
      id: "usr_peer_irfan",
      fullName: "Mohammed Irfan",
      username: "irfan.ops",
      email: "irfan@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=15",
      createdAt,
      lastSeenAt: minutesAgo(55),
    },
    {
      id: "usr_peer_kavya",
      fullName: "Kavya Reddy",
      username: "kavya.data",
      email: "kavya@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=20",
      createdAt,
      lastSeenAt: minutesAgo(14),
    },
    {
      id: "usr_peer_varun",
      fullName: "Varun Desai",
      username: "varun.swift",
      email: "varun@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=8",
      createdAt,
      lastSeenAt: minutesAgo(120),
    },
    {
      id: "usr_peer_meera",
      fullName: "Dr. Meera Iyer",
      username: "meera.ml",
      email: "meera@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=24",
      createdAt,
      lastSeenAt: minutesAgo(3),
    },
    {
      id: "usr_peer_aisha",
      fullName: "Aisha Khan",
      username: "aisha.cloud",
      email: "aisha@zinger.dev",
      role: "student",
      avatarUrl: "https://i.pravatar.cc/160?img=27",
      createdAt,
      lastSeenAt: minutesAgo(22),
    },
  ];
}

export const SEED_USER_IDS = new Set(getSeedUsers().map((u) => u.id));
