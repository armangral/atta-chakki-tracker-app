
-- Allow admins to see all profiles
CREATE POLICY "Admin can see all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to see all user_roles
CREATE POLICY "Admin can see all user_roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
