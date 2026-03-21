import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client for browser interactions
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Admin Client (Internal Use Only) ---
// This client uses the Service Role Key to bypass RLS. 
// Should ONLY be used in server-side API routes.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Fallback to anon if secret is missing
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)