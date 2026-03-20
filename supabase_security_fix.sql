-- Supabase Security Hardening Protocol
-- Run these as individual SQL commands in your Supabase SQL Editor

-- 0. Ensure extensions and tables exist for archival tracking
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  amount_total NUMERIC(10, 2),
  currency TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB,
  shipping_address JSONB,
  stripe_session_id TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. Enable Row Level Security (RLS) on all archive tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 2. Storefront Policies (Public Read Access)
-- Allowing anyone to view products, categories, posters, and verify coupons

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to posters" ON public.posters;
CREATE POLICY "Allow public read access to posters" 
ON public.posters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to coupons" ON public.coupons;
CREATE POLICY "Allow public read access to coupons" 
ON public.coupons FOR SELECT USING (true);

-- 3. Acquisition & Subscription Policies (Public Write, No Public Read)
-- Allowing anyone to submit an order or subscribe, but blocking them from reading others' data

DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
CREATE POLICY "Allow public to insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to insert subscribers" ON public.subscribers;
CREATE POLICY "Allow public to insert subscribers" 
ON public.subscribers FOR INSERT WITH CHECK (true);

-- 4. Admin Lockdown (All access for Service Role / Authenticated Admins)
-- Note: Supabase service_role always bypasses RLS, but if you want to use the dashboard 
-- to manage these via Auth, you can add AUTH policies here.

-- For now, this baseline ensures that your "Security Vulnerabilities" warning 
-- will disappear because the tables are no longer wide open to the public internet.
