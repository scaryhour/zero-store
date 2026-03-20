import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Avoid creating multiple instances in a browser environment
// This prevents "Multiple GoTrueClient instances detected" errors
let supabaseInstance: SupabaseClient | null = null;
if (typeof window !== 'undefined') {
    // Check if we already have a client on the global object (for HMR)
    const globalSupabase = (window as any).__supabase_client;
    if (globalSupabase) {
        supabaseInstance = globalSupabase;
    } else {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        (window as any).__supabase_client = supabaseInstance;
    }
} else {
    // Server-side
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseInstance!;

// --- Admin Client (Internal Use Only) ---
// This client uses the Service Role Key to bypass RLS. 
// Should ONLY be used in server-side API routes.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)