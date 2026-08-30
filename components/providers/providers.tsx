"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AmbientCanvas } from "@/components/effects/ambient-canvas";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { Toaster } from "@/components/ui/toaster";
import { AIChatbot } from "@/components/chat/ai-chatbot";
import { AuthHydration } from "@/components/providers/auth-hydration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthHydration />
      <AmbientCanvas />
      <CustomCursor />
      <div className="relative z-10">{children}</div>
      <AIChatbot />
      <Toaster />
    </ThemeProvider>
  );
}
