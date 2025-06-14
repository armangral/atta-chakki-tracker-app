
-- 1. Create a products table with relevant columns
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL CHECK (low_stock_threshold >= 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Allow users with the 'admin' role to perform all operations
CREATE POLICY "Admins can view products"
  ON public.products
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
  );
