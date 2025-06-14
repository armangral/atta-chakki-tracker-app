
-- Allow operators to view products in POS by granting SELECT access
CREATE POLICY "Operators can view products"
  ON public.products
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'operator')
  );
