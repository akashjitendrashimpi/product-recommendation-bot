import { query, queryOne, execute } from "./connection"
import crypto from "crypto"

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Create email verification token for user
export async function createEmailVerificationToken(userId: number): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

  await execute(
    `UPDATE users 
     SET email_verification_token = ?, 
         email_verification_token_expires = ?
     WHERE id = ?`,
    [token, expiresAt, userId]
  )

  return token
}

// Verify email verification token
export async function verifyEmailToken(token: string): Promise<number | null> {
  const user = await queryOne<{ id: number }>(
    `SELECT id FROM users 
     WHERE email_verification_token = ? 
     AND email_verification_token_expires > NOW()
     AND email_verified = FALSE`,
    [token]
  )

  if (!user) {
    return null
  }

  // Mark email as verified and clear token
  await execute(
    `UPDATE users 
     SET email_verified = TRUE,
         email_verification_token = NULL,
         email_verification_token_expires = NULL
     WHERE id = ?`,
    [user.id]
  )

  return user.id
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await queryOne<{ id: number }>(
    `SELECT id FROM users WHERE email = ?`,
    [email]
  )

  if (!user) {
    return null // Don't reveal if user exists
  }

  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour from now

  await execute(
    `UPDATE users 
     SET password_reset_token = ?, 
         password_reset_token_expires = ?
     WHERE id = ?`,
    [token, expiresAt, user.id]
  )

  return token
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const user = await queryOne<{ id: number }>(
    `SELECT id FROM users 
     WHERE password_reset_token = ? 
     AND password_reset_token_expires > NOW()`,
    [token]
  )

  if (!user) {
    return null
  }

  return user.id
}

// Clear password reset token after use
export async function clearPasswordResetToken(userId: number): Promise<void> {
  await execute(
    `UPDATE users 
     SET password_reset_token = NULL,
         password_reset_token_expires = NULL
     WHERE id = ?`,
    [userId]
  )
}
