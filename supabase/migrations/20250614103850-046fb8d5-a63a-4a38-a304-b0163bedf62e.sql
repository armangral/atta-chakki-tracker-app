
-- 1. Create a function to insert a profile and user_role when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role public.app_role := 'operator';
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT DO NOTHING;

  -- Insert into user_roles (only if not admin invite flow)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, default_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to run after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Optional) Backfill: create missing profiles and user_roles for existing users (if needed)
-- Uncomment below to run ONCE, then comment/remove after use!

-- Insert profiles for any missing users
-- INSERT INTO public.profiles (id, username)
-- SELECT id, email FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles);

-- Insert operator user_roles for users not in user_roles
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'operator'::public.app_role FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM public.user_roles);

