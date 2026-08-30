-- Directory RLS: authenticated users can read all profiles (needed for chat sidebar)
-- 1. Drop the old restrictive SELECT policy (if it exists)
DROP POLICY IF EXISTS "Allow authenticated read/write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read on all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- 2. Create a new SELECT policy allowing logged-in users to see the directory of other users
CREATE POLICY "Allow authenticated read on all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Ensure users can still ONLY update their own profiles
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
