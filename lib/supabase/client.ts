import { createClient } from '@supabase/supabase-js'

let _supabaseAdmin: any = null

// Lazy initialize Supabase admin client
function initializeSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase] Missing environment variables. Supabase client not initialized.')
    return null
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return _supabaseAdmin
}

// Server-side client with service role (bypasses RLS)
export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    const client = initializeSupabaseAdmin()
    if (!client) {
      throw new Error('Supabase API Key not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
    }
    return (client as any)[prop]
  }
})