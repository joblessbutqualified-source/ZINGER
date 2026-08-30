-- ============================================================
-- Zinger DM: allow signed-up users to see each other in chat
-- Run this in the Supabase SQL Editor. Safe to re-run.
-- Does not replace older SQL files.
-- ============================================================

-- 1. Directory: authenticated users can read all profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read on all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;

-- Allow users to see other registered users for the chat directory
DROP POLICY IF EXISTS "Allow authenticated read on all profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read on all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Live chat: participants can read/send/update their threads
DROP POLICY IF EXISTS "Users can read their own chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update read receipts" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages select policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages insert policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages update policy" ON public.chat_messages;

CREATE POLICY "Users can read their own chats"
ON public.chat_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read receipts"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Realtime so new messages appear without a page refresh
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
