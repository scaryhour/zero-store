CREATE TABLE IF NOT EXISTS public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric(10, 2) not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: We'll instruct the user to run this in their Supabase SQL editor
