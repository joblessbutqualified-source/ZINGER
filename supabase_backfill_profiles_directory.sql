-- ============================================================
-- Zinger DM: backfill existing Auth users into profiles
-- + keep new signups in sync. Run in the Supabase SQL Editor.
-- Safe to re-run. Does not replace older SQL files.
-- ============================================================

-- 0. Columns used by the app
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Unique username (ignore if already present)
DO $$
BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL;
END $$;

-- 1. Create a profile for EVERY already-registered auth user
INSERT INTO public.profiles (id, full_name, email, username, avatar_url, role, created_at, last_seen_at)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    split_part(COALESCE(u.email, 'learner'), '@', 1),
    'Learner'
  ),
  COALESCE(u.email, u.id::text || '@zinger.local'),
  lower(regexp_replace(split_part(COALESCE(u.email, 'user'), '@', 1), '[^a-zA-Z0-9]', '', 'g'))
    || substr(replace(u.id::text, '-', ''), 1, 6),
  NULLIF(u.raw_user_meta_data->>'avatar_url', ''),
  CASE
    WHEN lower(COALESCE(u.email, '')) IN (
      'admin@zinger.com',
      'joblessbutqualified@gmail.com'
    ) THEN 'admin'
    ELSE 'student'
  END,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
  username = COALESCE(NULLIF(public.profiles.username, ''), EXCLUDED.username);

-- 2. New signups always get a profiles row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, avatar_url, role, last_seen_at)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1), 'Learner'),
    NEW.email,
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
      || substr(replace(NEW.id::text, '-', ''), 1, 6),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE
      WHEN lower(NEW.email) IN ('admin@zinger.com', 'joblessbutqualified@gmail.com') THEN 'admin'
      ELSE 'student'
    END,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Table privileges (RLS alone is not enough)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;

-- 4. Directory: any signed-in user can read every profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read on all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Allow authenticated read on all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Live DMs
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update read receipts" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages select policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages insert policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages update policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow chat read/write for participants" ON public.chat_messages;

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
