"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBotReply } from "@/lib/data/chatbot";

interface Line {
  id: string;
  from: "user" | "bot";
  text: string;
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [lines, setLines] = useState<Line[]>([
    {
      id: "w",
      from: "bot",
      text: "Hi, I'm Zing. Ask me about plans, courses, login, or tickets.",
    },
  ]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const userLine: Line = { id: `u_${Date.now()}`, from: "user", text: value };
    const botLine: Line = {
      id: `b_${Date.now()}`,
      from: "bot",
      text: getBotReply(value),
    };
    setLines((prev) => [...prev, userLine, botLine]);
    setText("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="mb-3 flex h-[420px] w-[min(100vw-2.5rem,360px)] flex-col overflow-hidden rounded-2xl border border-border glass-strong shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Zing · AI support</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    l.from === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {l.text}
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-border/70 p-3">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask Zing…"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Button
        size="lg"
        className="h-14 rounded-full shadow-[0_0_24px_hsl(38_92%_55%/0.4)]"
        onClick={() => setOpen((v) => !v)}
      >
        <Bot className="mr-2 h-4 w-4" />
        {open ? "Close" : "Ask Zing"}
      </Button>
    </div>
  );
}
