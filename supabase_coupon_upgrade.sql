-- Migration: Enhance Coupons table for Phase 11
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 9999;

-- Re-enable RLS and policies (just to be safe)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to coupons" ON public.coupons;
CREATE POLICY "Allow public read access to coupons" 
ON public.coupons FOR SELECT USING (true);
