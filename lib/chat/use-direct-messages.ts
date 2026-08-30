"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DM_DIRECTORY_CHANNEL,
  DM_MESSAGE_CHANNEL,
  DM_PRESENCE_CHANNEL,
} from "@/lib/chat/channels";
import { getAuthUserId, loadProfileForAuthUser, resolveAuthUserId } from "@/lib/chat/auth-user";
import { mapChatRow, mapProfileRow, uid, type ChatRow, type ProfileRow } from "@/lib/chat/mappers";
import { fetchDirectoryFromSupabase } from "@/lib/chat/profile-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDirectoryStore } from "@/lib/store/directory-store";
import { useDmStore } from "@/lib/store/dm-store";
import { toast } from "@/lib/store/toast-store";
import type { ChatMessage, ChatUser, Profile } from "@/lib/types";
import { isOnline, isSupabaseConfigured, isUuid } from "@/lib/utils";

function conversationOrFilter(userId: string, peerId: string): string {
  return `and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`;
}

export function useDirectMessages() {
  const user = useAuthStore((s) => s.user);
  const directory = useDirectoryStore((s) => s.users);
  const messages = useDmStore((s) => s.messages);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const live = isSupabaseConfigured();
  const [directoryLoading, setDirectoryLoading] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const fetchMessages = useCallback(
    async (selfId: string, activePeerId?: string | null) => {
      const supabase = createClient();
      if (!supabase || !live) return;

      const safeSelf = isUuid(selfId) ? selfId : await resolveAuthUserId();
      if (!isUuid(safeSelf)) return;
      if (activePeerId && !isUuid(activePeerId)) return;

      let queryBuilder = supabase
        .from("chat_messages")
        .select("id, sender_id, receiver_id, message, created_at, is_read, read_at")
        .order("created_at", { ascending: true });

      if (activePeerId) {
        queryBuilder = queryBuilder.or(conversationOrFilter(safeSelf, activePeerId));
      } else {
        queryBuilder = queryBuilder.or(`sender_id.eq.${safeSelf},receiver_id.eq.${safeSelf}`);
      }

      const { data, error } = await queryBuilder;
      if (error) {
        console.error(error);
        toast({
          title: "Could not load messages",
          description: error.message,
          variant: "error",
        });
        return;
      }
      if (!data) return;
      const mapped = (data as ChatRow[]).map(mapChatRow);
      if (activePeerId) {
        useDmStore.getState().upsertMany(mapped);
      } else {
        useDmStore.getState().hydrateFromServer(mapped);
      }
    },
    [live]
  );

  useEffect(() => {
    if (!user?.id) {
      setDirectoryLoading(false);
      return;
    }
    const sessionUserId = user.id;
    const supabase = createClient();
    let chats: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    let profiles: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    let cancelled = false;

    const boot = async () => {
      setDirectoryLoading(true);
      try {
        const authId = await resolveAuthUserId();
        if (cancelled) return;
        await loadProfileForAuthUser();
        const selfId = (await resolveAuthUserId()) ?? authId;
        const people = await fetchDirectoryFromSupabase(selfId ?? sessionUserId);
        if (cancelled) return;
        useDirectoryStore.getState().replaceUsers(people);

        if (!supabase || !isUuid(selfId)) return;
        await fetchMessages(selfId);
        if (cancelled) return;

        const applyChatRow = (row: ChatRow | null | undefined) => {
          if (!row?.id) return;
          const involved = row.sender_id === selfId || row.receiver_id === selfId;
          if (!involved) return;
          useDmStore.getState().upsertMessage(mapChatRow(row));
        };

        chats = supabase
          .channel(`dm:${selfId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
              filter: `receiver_id=eq.${selfId}`,
            },
            (payload) => applyChatRow(payload.new as ChatRow)
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
            },
            (payload) => applyChatRow(payload.new as ChatRow)
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "chat_messages",
              filter: `sender_id=eq.${selfId}`,
            },
            (payload) => applyChatRow(payload.new as ChatRow)
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "chat_messages",
              filter: `receiver_id=eq.${selfId}`,
            },
            (payload) => applyChatRow(payload.new as ChatRow)
          )
          .subscribe((status, err) => {
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.error(err ?? new Error(`Realtime ${status}`));
            }
          });

        profiles = supabase
          .channel("zinger-profiles")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "profiles" },
            (payload) => {
              if (payload.eventType === "DELETE") return;
              const row = payload.new as ProfileRow;
              if (!row?.id) return;
              const mapped = mapProfileRow(row);
              const me = useAuthStore.getState().user;
              if (me && me.id === mapped.id) {
                useAuthStore.getState().setUser({ ...me, ...mapped });
                return;
              }
              useDirectoryStore.getState().upsertUser(mapped);
            }
          )
          .subscribe();
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setDirectoryLoading(false);
      }
    };
    void boot();

    if (supabase) {
      return () => {
        cancelled = true;
        if (chats) void supabase.removeChannel(chats);
        if (profiles) void supabase.removeChannel(profiles);
      };
    }

    const msgBc = new BroadcastChannel(DM_MESSAGE_CHANNEL);
    const dirBc = new BroadcastChannel(DM_DIRECTORY_CHANNEL);
    const presBc = new BroadcastChannel(DM_PRESENCE_CHANNEL);

    const onMsg = (
      ev: MessageEvent<ChatMessage | { type: "read"; ids: string[]; readAt: string }>
    ) => {
      const data = ev.data;
      if (!data) return;
      if ("type" in data && data.type === "read") {
        useDmStore.getState().applyRead(data.ids, data.readAt);
        return;
      }
      if ("id" in data && "message" in data) {
        useDmStore.getState().upsertMessage(data);
      }
    };
    const onDir = (ev: MessageEvent<Profile>) => {
      const incoming = ev.data;
      if (!incoming?.id) return;
      const me = useAuthStore.getState().user;
      if (me && (incoming.id === me.id || incoming.email.toLowerCase() === me.email.toLowerCase())) {
        return;
      }
      useDirectoryStore.getState().mergeRemote([incoming]);
    };
    const onPres = (ev: MessageEvent<{ id: string; lastSeenAt: string }>) => {
      if (ev.data?.id) {
        useDirectoryStore.getState().touchPresence(ev.data.id, ev.data.lastSeenAt);
      }
    };

    msgBc.addEventListener("message", onMsg);
    dirBc.addEventListener("message", onDir);
    presBc.addEventListener("message", onPres);
    return () => {
      cancelled = true;
      msgBc.removeEventListener("message", onMsg);
      dirBc.removeEventListener("message", onDir);
      presBc.removeEventListener("message", onPres);
      msgBc.close();
      dirBc.close();
      presBc.close();
    };
  }, [user?.id, live, fetchMessages]);

  useEffect(() => {
    if (!user?.id) return;
    const { users, replaceUsers } = useDirectoryStore.getState();
    if (
      users.some(
        (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
      )
    ) {
      replaceUsers(users);
    }
  }, [user?.id, user?.email]);

  const markRead = useCallback(
    async (targetPeerId: string) => {
      if (!user) return;
      const updated = useDmStore.getState().markConversationRead(user.id, targetPeerId, !live);
      if (!updated.length) return;
      const supabase = createClient();
      if (supabase && live) {
        const ids = updated.map((m) => m.id).filter(isUuid);
        if (!ids.length) return;
        const readAt = updated[0]?.readAt ?? new Date().toISOString();
        const { error } = await supabase
          .from("chat_messages")
          .update({ is_read: true, read_at: readAt })
          .in("id", ids);
        if (error) console.error(error);
      }
    },
    [user, live]
  );

  const selectPeer = useCallback(
    (id: string | null) => {
      setPeerId(id);
      if (!id) return;
      void (async () => {
        const selfId = await resolveAuthUserId();
        if (!isUuid(selfId) || !isUuid(id)) return;
        await fetchMessages(selfId, id);
        await markRead(id);
      })();
    },
    [fetchMessages, markRead]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !peerId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const supabase = createClient();
      if (supabase && live) {
        const authId = await getAuthUserId();
        if (!authId) {
          const err = new Error("No Supabase auth session — sign in again.");
          console.error(err);
          toast({ title: "Message not sent", description: err.message, variant: "error" });
          return;
        }
        if (!isUuid(authId) || !isUuid(peerId)) {
          toast({
            title: "Message not sent",
            description: "Sign in again to chat with this learner.",
            variant: "error",
          });
          return;
        }
        if (authId !== user.id) {
          await loadProfileForAuthUser();
        }

        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            sender_id: authId,
            receiver_id: peerId,
            message: trimmed,
            is_read: false,
          })
          .select("id, sender_id, receiver_id, message, created_at, is_read, read_at")
          .single();

        if (error) {
          console.error(error);
          toast({
            title: "Message not sent",
            description: error.message,
            variant: "error",
          });
          return;
        }

        if (data) {
          useDmStore.getState().upsertMessage(mapChatRow(data as ChatRow));
        }
        return;
      }

      const payload: ChatMessage = {
        id: uid(),
        senderId: user.id,
        receiverId: peerId,
        message: trimmed,
        createdAt: new Date().toISOString(),
        isRead: false,
        readAt: null,
      };
      useDmStore.getState().upsertMessage(payload, true);
    },
    [user, peerId, live]
  );

  const people = useMemo(() => {
    if (!user) return [] as ChatUser[];
    const q = query.trim().toLowerCase();
    void tick;
    return directory
      .filter((p) => p.id !== user.id)
      .filter((p) => {
        if (!q) return true;
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
        );
      })
      .map((p) => {
        const thread = messages.filter(
          (m) =>
            (m.senderId === user.id && m.receiverId === p.id) ||
            (m.senderId === p.id && m.receiverId === user.id)
        );
        const last = thread[thread.length - 1];
        const unreadCount = thread.filter(
          (m) => m.receiverId === user.id && m.senderId === p.id && !m.isRead
        ).length;
        return {
          id: p.id,
          fullName: p.fullName,
          username: p.username,
          email: p.email,
          avatarUrl: p.avatarUrl,
          lastSeenAt: p.lastSeenAt,
          online: isOnline(p.lastSeenAt),
          unreadCount,
          lastMessage: last?.message,
          lastMessageAt: last?.createdAt,
        } satisfies ChatUser;
      })
      .sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        if (at !== bt) return bt - at;
        return a.fullName.localeCompare(b.fullName);
      });
  }, [directory, messages, query, tick, user, live]);

  useEffect(() => {
    if (peerId) void markRead(peerId);
  }, [peerId, messages.length, markRead]);

  const peer = useMemo(
    () => directory.find((p) => p.id === peerId) ?? null,
    [directory, peerId]
  );

  const thread = useMemo(() => {
    if (!user || !peerId) return [] as ChatMessage[];
    return messages
      .filter(
        (m) =>
          (m.senderId === user.id && m.receiverId === peerId) ||
          (m.senderId === peerId && m.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, peerId, user]);

  return {
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
    isLoading: directoryLoading,
  };
}
