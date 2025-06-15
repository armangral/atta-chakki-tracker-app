
-- Step 1: Add a new column 'bill_id' to sales. We'll use a UUID for grouping.
ALTER TABLE public.sales
ADD COLUMN bill_id uuid;

-- Step 2: In new sales, all items from the same checkout should use the same bill_id.
-- We'll use this to group sales in the UI.

-- Step 3: Improve performance (optional, but good practice)
CREATE INDEX IF NOT EXISTS idx_sales_bill_id ON public.sales (bill_id);

-- NOTE: Existing RLS policies allow operators to see their own sales. No change needed.
