
-- Allow operators to update the 'stock' of products (and nothing else) for POS
CREATE POLICY "Operators can update product stock"
  ON public.products
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'operator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'operator')
  );
