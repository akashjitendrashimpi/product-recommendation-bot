import { supabaseAdmin } from '@/lib/supabase/client'
import crypto from "crypto"

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Create email verification token for user (stores in separate table for audit trail)
export async function createEmailVerificationToken(userId: number): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

  // Delete any existing tokens for this user
  await supabaseAdmin
    .from('email_verification_tokens')
    .delete()
    .eq('user_id', userId)

  // Create new token
  const { error } = await supabaseAdmin
    .from('email_verification_tokens')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString()
    })

  if (error) {
    console.error('Failed to create verification token:', error)
    throw new Error('Failed to create verification token')
  }

  return token
}

// Verify email verification token
export async function verifyEmailToken(token: string): Promise<number | null> {
  // Find valid token
  const { data: tokenData } = await supabaseAdmin
    .from('email_verification_tokens')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (!tokenData) {
    return null
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return null
  }

  // Check if user email is already verified
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email_verified')
    .eq('id', tokenData.user_id)
    .single()

  if (!user || user.email_verified) {
    return null
  }

  // Mark email as verified
  await supabaseAdmin
    .from('users')
    .update({
      email_verified: true,
      email_verification_token: null,
      email_verification_token_expires: null
    })
    .eq('id', tokenData.user_id)

  // Delete the used token
  await supabaseAdmin
    .from('email_verification_tokens')
    .delete()
    .eq('token', token)

  return tokenData.user_id
}

// Resend email verification token (with rate limiting)
export async function resendEmailVerificationToken(email: string): Promise<{ token: string; userId: number } | null> {
  // Get user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email_verified')
    .eq('email', email)
    .single()

  if (!user || user.email_verified) {
    return null
  }

  // Check if a recent token exists (prevent spam)
  const { data: recentToken } = await supabaseAdmin
    .from('email_verification_tokens')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (recentToken) {
    const createdAt = new Date(recentToken.created_at)
    const now = new Date()
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 1000 / 60

    // Only allow resend after 2 minutes
    if (minutesSinceCreation < 2) {
      throw new Error('Please wait 2 minutes before requesting another verification email')
    }
  }

  // Create new token
  const token = await createEmailVerificationToken(user.id)
  return { token, userId: user.id }
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    return null // Don't reveal if user exists
  }

  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour from now

  await supabaseAdmin
    .from('users')
    .update({
      password_reset_token: token,
      password_reset_token_expires: expiresAt.toISOString()
    })
    .eq('id', user.id)

  return token
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, password_reset_token_expires')
    .eq('password_reset_token', token)
    .single()

  if (!user) {
    return null
  }

  // Check if token is expired
  if (new Date(user.password_reset_token_expires) < new Date()) {
    return null
  }

  return user.id
}

// Clear password reset token after use
export async function clearPasswordResetToken(userId: number): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({
      password_reset_token: null,
      password_reset_token_expires: null
    })
    .eq('id', userId)
}

// Get token expiry info (for UI display)
export async function getTokenExpiryInfo(token: string): Promise<{ expiresAt: Date; isExpired: boolean } | null> {
  const { data: tokenData } = await supabaseAdmin
    .from('email_verification_tokens')
    .select('expires_at')
    .eq('token', token)
    .single()

  if (!tokenData) {
    return null
  }

  const expiresAt = new Date(tokenData.expires_at)
  const isExpired = expiresAt < new Date()

  return { expiresAt, isExpired }
}

// Clean up expired tokens (run this periodically)
export async function cleanupExpiredTokens(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('email_verification_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select()

  if (error) {
    console.error('Failed to cleanup expired tokens:', error)
    return 0
  }

  return data?.length || 0
}