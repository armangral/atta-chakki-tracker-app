
-- 1. Create a sales table
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  operator_id uuid NOT NULL REFERENCES profiles(id),
  operator_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 3. Policy: admins see all sales
CREATE POLICY "Admins can view all sales"
  ON public.sales
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Policy: operators can view only their own sales
CREATE POLICY "Operators can view their own sales"
  ON public.sales
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'operator')
    AND operator_id = auth.uid()
  );

-- 5. Policy: admin or operator can INSERT a sale
CREATE POLICY "Admins or operators can insert sales"
  ON public.sales
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operator')
  );

-- 6. Policy: admins can update any sale
CREATE POLICY "Admins can update sales"
  ON public.sales
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Policy: admins can delete any sale
CREATE POLICY "Admins can delete sales"
  ON public.sales
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
