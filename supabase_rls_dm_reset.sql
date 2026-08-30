-- Reset profiles + chat_messages RLS for DM directory and realtime
-- Run in the Supabase SQL Editor.

-- Fix Profiles Table Policies (Allow everyone to see the directory)
DROP POLICY IF EXISTS "Allow authenticated read on all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read/write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;

CREATE POLICY "Enable read access for all authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Fix Chat Messages Policies (Strict participant rules)
DROP POLICY IF EXISTS "Chat messages select policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages insert policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages update policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow chat read/write for participants" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can read their own chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;

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
