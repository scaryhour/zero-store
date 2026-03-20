ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS has_sizes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Archive',
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stock_levels jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS video_url text;

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  amount_total NUMERIC(10, 2),
  currency TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB, -- Array of items purchased
  shipping_address JSONB,
  stripe_session_id TEXT UNIQUE
);

-- Create Categories Table for dynamic management
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Phase 5: Posters Table for Hero Banners
CREATE TABLE IF NOT EXISTS public.posters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Phase 6: Dynamic Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial coupons
INSERT INTO public.coupons (code, discount_percent) 
VALUES ('ZERO10', 10), ('ARCHIVE20', 20)
ON CONFLICT (code) DO NOTHING;

-- Seed initial categories for testing
INSERT INTO public.categories (name) 
VALUES ('Archive'), ('Tops'), ('Bottoms'), ('Shoes'), ('Gear')
ON CONFLICT (name) DO NOTHING;

-- IMPORTANT: If you see "Column not found in schema cache" errors, 
-- Please refresh your Supabase Dashboard or wait 30 seconds for the API to sync.
-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
