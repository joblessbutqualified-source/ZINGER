-- ============================================================
-- Zinger Edutech — Chat & Profile upgrade (additive)
-- Run AFTER supabase_schema.sql. Do not replace that file.
-- ============================================================

-- 1. Update Profiles Table to include username
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Backfill usernames for existing rows so UNIQUE holds
UPDATE public.profiles
SET username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
               || substr(replace(id::text, '-', ''), 1, 4)
WHERE username IS NULL OR username = '';

-- 2. Update Chat Messages Table for Read Receipts
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 3. Create Supabase Storage Bucket for Avatars (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies for Avatars Bucket
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "User Update Own Avatar" ON storage.objects;

CREATE POLICY "Public Read Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Upload Avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "User Update Own Avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Learners may also replace their own object via upsert
DROP POLICY IF EXISTS "User Delete Own Avatar" ON storage.objects;
CREATE POLICY "User Delete Own Avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Directory: every signed-in user can browse other profiles (DM sidebar)
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 5. Realtime Publication Setup
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_chat_unread ON public.chat_messages (receiver_id, is_read);
