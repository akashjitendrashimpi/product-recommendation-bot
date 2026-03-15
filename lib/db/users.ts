import { supabaseAdmin } from '@/lib/supabase/client'
import { hashPassword, verifyPassword } from "../auth/password"
import type { UserProfile } from "@/lib/types"

export interface User {
  id: number
  email: string
  password?: string
  display_name: string | null
  is_admin: boolean
  upi_id: string | null
  phone: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

// ── Create a new user ──────────────────────────────────────────────────────
export async function createUser(data: {
  email: string
  password: string
  display_name?: string | null
  phone?: string | null
  upi_id?: string | null
  is_admin?: boolean
}): Promise<User> {
  const passwordHash = await hashPassword(data.password)

  const { data: user, error } = await (supabaseAdmin as any)
    .from('users')
    .insert({
      email: data.email,
      password: passwordHash,
      display_name: data.display_name || null,
      phone: data.phone || null,
      upi_id: data.upi_id || null,
      is_admin: data.is_admin || false,
    })
    .select('id, email, display_name, is_admin, upi_id, phone, email_verified, created_at, updated_at')
    .single()

  if (error || !user) {
    throw new Error("Failed to create user: " + (error?.message || 'Unknown error'))
  }

  return user as User
}

// ── Get user by ID (no password) ───────────────────────────────────────────
export async function getUserById(id: number): Promise<User | null> {
  const { data: user } = await (supabaseAdmin as any)
    .from('users')
    .select('id, email, display_name, is_admin, upi_id, phone, email_verified, created_at, updated_at')
    .eq('id', id)
    .single()

  return (user || null) as User | null
}

// ── Get user by email (with password for auth only) ────────────────────────
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data: user } = await (supabaseAdmin as any)
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  return (user || null) as User | null
}

// ── Verify user credentials ────────────────────────────────────────────────
export async function verifyUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email)

  if (!user || !user.password) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  // Never return password hash
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword as User
}

// ── Get all users (no password) ────────────────────────────────────────────
export async function getAllUsers(): Promise<User[]> {
  const { data: users } = await (supabaseAdmin as any)
    .from('users')
    .select('id, email, display_name, is_admin, upi_id, phone, email_verified, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (users || []) as User[]
}

// ── Update user profile ────────────────────────────────────────────────────
export async function updateUser(
  id: number,
  data: {
    display_name?: string | null
    is_admin?: boolean
    upi_id?: string | null
    phone?: string | null
  }
): Promise<void> {
  const updates: Record<string, any> = {}

  if (data.display_name !== undefined) updates.display_name = data.display_name
  if (data.is_admin !== undefined) updates.is_admin = data.is_admin
  if (data.upi_id !== undefined) updates.upi_id = data.upi_id
  if (data.phone !== undefined) updates.phone = data.phone

  if (Object.keys(updates).length === 0) return

  const { error } = await (supabaseAdmin as any)
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error("Failed to update user: " + error.message)
}

// ── Update user password ───────────────────────────────────────────────────
export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  const { error } = await (supabaseAdmin as any)
    .from('users')
    .update({ password: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error("Failed to update password: " + error.message)
}

// ── Delete user ────────────────────────────────────────────────────────────
export async function deleteUser(id: number): Promise<void> {
  const { error } = await (supabaseAdmin as any)
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw new Error("Failed to delete user: " + error.message)
}

// ── Convert User to UserProfile ────────────────────────────────────────────
export function userToProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    is_admin: user.is_admin,
    upi_id: user.upi_id,
    phone: user.phone,
    email_verified: user.email_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}