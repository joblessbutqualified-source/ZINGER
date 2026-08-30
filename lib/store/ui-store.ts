"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AmbientEffect = "none" | "leaves" | "clouds" | "water";

interface UIState {
  ambient: AmbientEffect;
  customCursor: boolean;
  setAmbient: (ambient: AmbientEffect) => void;
  setCustomCursor: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ambient: "leaves",
      customCursor: true,
      setAmbient: (ambient) => set({ ambient }),
      setCustomCursor: (customCursor) => set({ customCursor }),
    }),
    { name: "zinger-ui" }
  )
);
