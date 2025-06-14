
-- 1. Create a role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Policy: users can see their own roles
CREATE POLICY "Users can see their roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Policy: users can add their own roles (for registration)
CREATE POLICY "Users can insert their role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Policy: only user can delete their own role
CREATE POLICY "Users can delete their own role"
  ON public.user_roles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Add a simple profiles table for username. ("username" is unique)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE
);

-- 8. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Policy: users can see & update only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 10. Optional: create PUBLIC function to check user role (helps with RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

