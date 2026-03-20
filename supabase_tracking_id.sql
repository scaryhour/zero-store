-- Step 1: Add Tracking ID column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS track_id TEXT UNIQUE;

-- Step 2: Populate existing orders with a short tracking ID
-- We take the first 8 characters of the UUID and uppercase it for existing records
UPDATE public.orders 
SET track_id = UPPER(SUBSTRING(id::TEXT FROM 1 FOR 8))
WHERE track_id IS NULL;

-- Step 3: Make track_id NOT NULL for future records (optional but recommended)
-- ALTER TABLE public.orders ALTER COLUMN track_id SET NOT NULL;

-- Step 4: Index for high-speed synchronization
CREATE INDEX IF NOT EXISTS idx_orders_track_id ON public.orders(track_id);

-- Step 5: Security Protocol - Enable Public Tracking
-- This allows the storefront to 'SELECT' orders for the Trace Order feature
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to track orders" ON public.orders;
CREATE POLICY "Allow public to track orders" 
ON public.orders FOR SELECT USING (true);

-- Ensure public insert is also allowed (if not already set)
DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
CREATE POLICY "Allow public to insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);
