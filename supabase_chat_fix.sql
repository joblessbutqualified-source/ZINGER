-- 1. Drop the previous broad policy that might be causing INSERT failures
DROP POLICY IF EXISTS "Allow chat read/write for participants" ON public.chat_messages;

-- Safe to re-run: drop then recreate the strict policies
DROP POLICY IF EXISTS "Chat messages select policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages insert policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages update policy" ON public.chat_messages;

-- 2. Create a strict SELECT policy (Users can only read chats they are part of)
CREATE POLICY "Chat messages select policy"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 3. Create a strict INSERT policy (Users can only send messages as themselves)
CREATE POLICY "Chat messages insert policy"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 4. Create an UPDATE policy (For read receipts / seen status)
CREATE POLICY "Chat messages update policy"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- 5. Ensure realtime is enabled (no-op if already a member)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
