import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Outfit, Syne } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Zinger — Learn like you're already hired",
  description:
    "Zinger Edutech is a production-grade learning studio for India's next product engineers. Courses, mentors, peer chat, and hiring partners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${syne.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
