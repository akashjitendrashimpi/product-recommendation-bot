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
    console.warn('[Supabase] Missing environment variables. Supabase client not initialized. Using mock client for dev.\nSet NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable real DB calls.')

    // Minimal mock client to avoid runtime 500s in development when env is not configured.
    class MockQuery {
      _result: any
      constructor(result: any = { data: [], error: null }) {
        this._result = result
      }
      select() { return this }
      eq() { return this }
      gte() { return this }
      lt() { return this }
      order() { return this }
      or() { return this }
      insert() { return this }
      update() { return this }
      delete() { return this }
      single() { return this }
      // Make the object awaitable / thenable like Supabase responses
      then(resolve: any) { resolve(this._result); return Promise.resolve(this._result) }
      catch() { return this }
    }

    _supabaseAdmin = {
      from: (_tableName: string) => new MockQuery(),
    }
    return _supabaseAdmin
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