"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { EmojiPicker } from "@/components/chat/emoji-picker";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDirectMessages } from "@/lib/chat/use-direct-messages";
import type { ChatMessage, ChatUser } from "@/lib/types";
import { cn, formatLastActive, formatMessageTime, formatMessageTimestamp, isOnline } from "@/lib/utils";

export function DirectMessages() {
  const {
    user,
    peer,
    peerId,
    selectPeer,
    people,
    thread,
    query,
    setQuery,
    sendMessage,
    live,
    directoryLoading,
  } = useDirectMessages();
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, peerId]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center rounded-none border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Sign in to open DMs.
      </div>
    );
  }

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(draft);
    setDraft("");
    setEmojiOpen(false);
  };

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden border-border/70 bg-card/40 shadow-2xl backdrop-blur-xl md:grid-cols-[350px_minmax(0,1fr)]">
      <aside
        className={cn(
          "h-full min-h-0 min-w-0 flex-col md:border-r md:border-border/60",
          peerId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="shrink-0 border-b border-border/60 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl">Messages</h1>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {live ? "Live" : "Offline"}
            </span>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-full pl-9"
              placeholder="Search name or username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {directoryLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading people…
            </div>
          ) : people.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {query.trim()
                ? "No learners match that search."
                : "No other registered users yet. When someone signs up, they will appear here."}
            </p>
          ) : (
            people.map((p) => (
              <UserRow
                key={p.id}
                person={p}
                active={p.id === peerId}
                onSelect={() => selectPeer(p.id)}
              />
            ))
          )}
        </div>
      </aside>

      <section
        className={cn(
          "h-full min-h-0 min-w-0 flex-col md:flex",
          peerId ? "flex animate-in slide-in-from-right-4 duration-200 md:animate-none" : "hidden md:flex"
        )}
      >
        {!peer ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <MessageCircle className="h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-2xl">Your messages</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Pick someone from the directory. Messages arrive live — no refresh.
            </p>
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-3 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-1 shrink-0 gap-1 px-2 md:hidden"
                onClick={() => selectPeer(null)}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <UserAvatar
                name={peer.fullName}
                src={peer.avatarUrl}
                online={isOnline(peer.lastSeenAt)}
              />
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{peer.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  @{peer.username} · {formatLastActive(peer.lastSeenAt)}
                </p>
              </div>
            </header>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {thread.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <UserAvatar name={peer.fullName} src={peer.avatarUrl} size="lg" />
                  <p className="mt-3 font-medium">{peer.fullName}</p>
                  <p className="text-sm text-muted-foreground">@{peer.username}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You&apos;re both on Zinger. Say hello.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {thread.map((m) => (
                    <MessageBubble key={m.id} message={m} mine={m.senderId === user.id} />
                  ))}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={onSend}
              className="sticky bottom-0 z-10 shrink-0 border-t border-border/60 bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
            >
              <div className="relative">
                {emojiOpen ? (
                  <div className="absolute bottom-12 left-0 z-10">
                    <EmojiPicker
                      onPick={(e) => {
                        setDraft((d) => d + e);
                      }}
                    />
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Emoji picker"
                    onClick={() => setEmojiOpen((v) => !v)}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Message…"
                    className="rounded-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage(draft);
                        setDraft("");
                        setEmojiOpen(false);
                      }
                    }}
                  />
                  <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function UserRow({
  person,
  active,
  onSelect,
}: {
  person: ChatUser;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition",
        active ? "bg-primary/10" : "hover:bg-secondary/70"
      )}
    >
      <UserAvatar
        name={person.fullName}
        src={person.avatarUrl}
        online={person.online}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{person.fullName}</span>
          {person.lastMessageAt ? (
            <span
              className="shrink-0 text-[10px] text-muted-foreground"
              title={formatMessageTimestamp(person.lastMessageAt)}
            >
              {formatMessageTime(person.lastMessageAt)}
            </span>
          ) : null}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {person.lastMessage ? person.lastMessage : `@${person.username}`}
          </span>
          {person.unreadCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {person.unreadCount > 9 ? "9+" : person.unreadCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex", mine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-[22px] px-3.5 py-2 text-sm shadow-sm",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
        <p
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            mine ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span title={formatMessageTimestamp(message.createdAt)}>
            {formatMessageTime(message.createdAt)}
          </span>
          {mine ? (
            message.isRead ? (
              <>
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Seen{message.readAt ? ` ${formatMessageTime(message.readAt)}` : ""}</span>
              </>
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          ) : null}
        </p>
      </div>
    </motion.div>
  );
}
