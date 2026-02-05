import { query, queryOne, execute } from "./connection"
import { hashPassword, verifyPassword } from "../auth/password"
import type { UserProfile } from "@/lib/types"

export interface User {
  id: number
  email: string
  password?: string // Only present when fetching for auth
  display_name: string | null
  is_admin: boolean
  upi_id: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// Create a new user
export async function createUser(data: {
  email: string
  password: string
  display_name?: string
  phone?: string
  upi_id?: string
  is_admin?: boolean
}): Promise<User> {
  const passwordHash = await hashPassword(data.password)

  const result = await execute(
    `INSERT INTO users (email, password, display_name, phone, upi_id, is_admin)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.email,
      passwordHash,
      data.display_name || null,
      data.phone || null,
      data.upi_id || null,
      data.is_admin || false,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create user")
  }

  return getUserById(result.insertId) as Promise<User>
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    // Try to get user with email verification fields (if they exist)
    const user = await queryOne<User>(
      `SELECT id, email, display_name, is_admin, upi_id, phone,
              COALESCE(email_verified, FALSE) as email_verified,
              email_verification_token, email_verification_token_expires,
              password_reset_token, password_reset_token_expires,
              created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    )
    return user
  } catch (error: any) {
    // If columns don't exist yet, fall back to basic query
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      const user = await queryOne<User>(
        `SELECT id, email, display_name, is_admin, upi_id, phone,
                created_at, updated_at
         FROM users WHERE id = ?`,
        [id]
      )
      return user ? { ...user, email_verified: false } as User : null
    }
    throw error
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Try with email verification fields
    const user = await queryOne<User>(
      `SELECT id, email, password, display_name, is_admin, upi_id, phone,
              COALESCE(email_verified, FALSE) as email_verified,
              email_verification_token, email_verification_token_expires,
              password_reset_token, password_reset_token_expires,
              created_at, updated_at
       FROM users WHERE email = ?`,
      [email]
    )
    return user
  } catch (error: any) {
    // Fallback if columns don't exist yet
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      const user = await queryOne<User>(
        `SELECT id, email, password, display_name, is_admin, upi_id, phone, 
                created_at, updated_at
         FROM users WHERE email = ?`,
        [email]
      )
      return user ? { ...user, email_verified: false } as User : null
    }
    throw error
  }
}

// Verify user credentials
export async function verifyUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email)

  if (!user || !user.password) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return null
  }

  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword as User
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  return query<User>(
    `SELECT id, email, display_name, is_admin, created_at, updated_at
     FROM users ORDER BY created_at DESC`
  )
}

// Update user
export async function updateUser(
  id: number,
  data: {
    display_name?: string | null
    is_admin?: boolean
    upi_id?: string | null
    phone?: string | null
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.display_name !== undefined) {
    updates.push("display_name = ?")
    values.push(data.display_name)
  }
  if (data.is_admin !== undefined) {
    updates.push("is_admin = ?")
    values.push(data.is_admin)
  }
  if (data.upi_id !== undefined) {
    updates.push("upi_id = ?")
    values.push(data.upi_id)
  }
  if (data.phone !== undefined) {
    updates.push("phone = ?")
    values.push(data.phone)
  }

  if (updates.length === 0) return

  values.push(id)
  await execute(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    values
  )
}

// Update user password
export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  await execute(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, id])
}

// Delete user
export async function deleteUser(id: number): Promise<void> {
  await execute("DELETE FROM users WHERE id = ?", [id])
}

// Convert User to UserProfile format
export function userToProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    is_admin: user.is_admin,
    upi_id: user.upi_id,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}
