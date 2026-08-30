"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DM_DIRECTORY_CHANNEL,
  DM_MESSAGE_CHANNEL,
  DM_PRESENCE_CHANNEL,
} from "@/lib/chat/channels";
import { getAuthUserId, loadProfileForAuthUser } from "@/lib/chat/auth-user";
import { mapChatRow, mapProfileRow, uid, type ChatRow, type ProfileRow } from "@/lib/chat/mappers";
import { fetchDirectoryFromSupabase } from "@/lib/chat/profile-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDirectoryStore } from "@/lib/store/directory-store";
import { useDmStore } from "@/lib/store/dm-store";
import { toast } from "@/lib/store/toast-store";
import type { ChatMessage, ChatUser, Profile } from "@/lib/types";
import { isOnline, isSupabaseConfigured } from "@/lib/utils";

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

      let queryBuilder = supabase
        .from("chat_messages")
        .select("id, sender_id, receiver_id, message, created_at, is_read, read_at")
        .order("created_at", { ascending: true });

      if (activePeerId) {
        queryBuilder = queryBuilder.or(conversationOrFilter(selfId, activePeerId));
      } else {
        queryBuilder = queryBuilder.or(`sender_id.eq.${selfId},receiver_id.eq.${selfId}`);
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
    if (supabase && live) {
      const boot = async () => {
        setDirectoryLoading(true);
        try {
          const authId = await getAuthUserId();
          if (authId && authId !== sessionUserId) {
            await loadProfileForAuthUser();
          }
          const selfId = authId ?? useAuthStore.getState().user?.id ?? sessionUserId;
          const people = await fetchDirectoryFromSupabase(selfId);
          useDirectoryStore.getState().replaceUsers(people);
          await fetchMessages(selfId);
          const first = people[0];
          if (first) {
            setPeerId(first.id);
            void fetchMessages(selfId, first.id);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setDirectoryLoading(false);
        }
      };
      void boot();

      const chats = supabase
        .channel(`chat-messages:${sessionUserId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages" },
          (payload) => {
            const row = payload.new as ChatRow;
            if (!row?.id) return;
            const selfId = useAuthStore.getState().user?.id;
            if (!selfId) return;
            const involved = row.sender_id === selfId || row.receiver_id === selfId;
            if (!involved) return;
            useDmStore.getState().upsertMessage(mapChatRow(row));
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "chat_messages" },
          (payload) => {
            const row = payload.new as ChatRow;
            if (!row?.id) return;
            useDmStore.getState().upsertMessage(mapChatRow(row));
          }
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(err ?? new Error(`Realtime ${status}`));
          }
        });

      const profiles = supabase
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
            }
            useDirectoryStore.getState().upsertUser(mapped);
          }
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(chats);
        void supabase.removeChannel(profiles);
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
      if (ev.data?.id) useDirectoryStore.getState().mergeRemote([ev.data]);
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
      msgBc.removeEventListener("message", onMsg);
      dirBc.removeEventListener("message", onDir);
      presBc.removeEventListener("message", onPres);
      msgBc.close();
      dirBc.close();
      presBc.close();
    };
  }, [user?.id, live, fetchMessages]);

  const markRead = useCallback(
    async (targetPeerId: string) => {
      if (!user) return;
      const updated = useDmStore.getState().markConversationRead(user.id, targetPeerId, !live);
      if (!updated.length) return;
      const supabase = createClient();
      if (supabase && live) {
        const readAt = updated[0]?.readAt ?? new Date().toISOString();
        const { error } = await supabase
          .from("chat_messages")
          .update({ is_read: true, read_at: readAt })
          .in(
            "id",
            updated.map((m) => m.id)
          );
        if (error) console.error(error);
      }
    },
    [user, live]
  );

  const selectPeer = useCallback(
    (id: string | null) => {
      setPeerId(id);
      if (id && user) {
        void fetchMessages(user.id, id);
        void markRead(id);
      }
    },
    [fetchMessages, markRead, user]
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
    if (directoryLoading || peerId || people.length === 0) return;
    selectPeer(people[0].id);
  }, [directoryLoading, peerId, people, selectPeer]);

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
