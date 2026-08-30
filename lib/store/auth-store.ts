"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Enrollment, Profile, SupportTicket } from "@/lib/types";
import { isAdminEmail, makeUsername } from "@/lib/utils";

interface AuthState {
  user: Profile | null;
  enrollments: Enrollment[];
  tickets: SupportTicket[];
  hydrated: boolean;
  setHydrated: () => void;
  setUser: (user: Profile | null) => void;
  logout: () => void;
  enroll: (courseId: string) => void;
  updateProgress: (courseId: string, lessonId: string, totalLessons: number) => void;
  addTicket: (subject: string, description: string) => void;
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      enrollments: [],
      tickets: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setUser: (user) => {
        if (!user) {
          set({ user: null });
          return;
        }
        const normalized: Profile = {
          ...user,
          username: user.username || makeUsername(user.fullName, user.email),
          role: isAdminEmail(user.email) ? "admin" : user.role,
        };
        set({ user: normalized });
      },
      logout: () => set({ user: null }),
      enroll: (courseId) => {
        const user = get().user;
        if (!user) return;
        const exists = get().enrollments.some(
          (e) => e.userId === user.id && e.courseId === courseId
        );
        if (exists) return;
        const enrollment: Enrollment = {
          id: makeId(),
          userId: user.id,
          courseId,
          progressPercentage: 0,
          enrolledAt: new Date().toISOString(),
          completedLessons: [],
        };
        set({ enrollments: [...get().enrollments, enrollment] });
      },
      updateProgress: (courseId, lessonId, totalLessons) => {
        const user = get().user;
        if (!user) return;
        set({
          enrollments: get().enrollments.map((e) => {
            if (e.userId !== user.id || e.courseId !== courseId) return e;
            const completed = e.completedLessons.includes(lessonId)
              ? e.completedLessons
              : [...e.completedLessons, lessonId];
            const progressPercentage = Math.min(
              100,
              Math.round((completed.length / Math.max(totalLessons, 1)) * 100)
            );
            return { ...e, completedLessons: completed, progressPercentage };
          }),
        });
      },
      addTicket: (subject, description) => {
        const user = get().user;
        if (!user) return;
        const ticket: SupportTicket = {
          id: makeId(),
          userId: user.id,
          subject,
          description,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        set({ tickets: [ticket, ...get().tickets] });
      },
      updateTicketStatus: (id, status) => {
        set({
          tickets: get().tickets.map((t) => (t.id === id ? { ...t, status } : t)),
        });
      },
    }),
    {
      name: "zinger-auth",
      partialize: (state) => ({
        user: state.user,
        enrollments: state.enrollments,
        tickets: state.tickets,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
