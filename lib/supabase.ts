import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 1. 客户端使用的单例实例 (由 @supabase/ssr 自动管理)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// 2. Admin Client (保持原样，仅供服务端 API 或 Server Actions 使用)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
export const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)