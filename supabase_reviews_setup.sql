-- Migration: Add Reviews table for Phase 13
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_approved BOOLEAN DEFAULT true -- Simplified for now
);

-- RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
CREATE POLICY "Allow public read access to reviews" 
ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write access to reviews" ON public.reviews;
CREATE POLICY "Allow public write access to reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);
