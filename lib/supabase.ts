import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 1. 客户端使用的单例实例 (由 @supabase/ssr 自动管理)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)