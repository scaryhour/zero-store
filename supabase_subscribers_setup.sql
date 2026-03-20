-- Migration: Subscribers table for Newsletter integration
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (anyone can subscribe)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can view subscribers
DROP POLICY IF EXISTS "Only admins can view subscribers" ON public.subscribers;
CREATE POLICY "Only admins can view subscribers" ON public.subscribers
  FOR SELECT USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );
