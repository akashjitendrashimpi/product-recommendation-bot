import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { createEmailVerificationToken } from '@/lib/db/email-tokens'
import { rateLimit } from '@/lib/security/rate-limit'
import { validateEmail, validatePassword, validatePhone, validateUpiId, sanitizeString } from '@/lib/security/validation'
import { hashPassword } from '@/lib/auth/password'

export async function POST(request: NextRequest) {
  try {
    // ============ RATE LIMITING ============
    const rateLimitResponse = rateLimit(request, 3, 60000) // 3 requests per minute
    if (rateLimitResponse) return rateLimitResponse

    // ============ PARSE INPUT ============
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { email, password, displayName, phone, upiId } = body

    // ============ VALIDATE EMAIL ============
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // ============ VALIDATE PASSWORD ============
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    // ============ VALIDATE OPTIONAL FIELDS ============
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    if (upiId && !validateUpiId(upiId)) {
      return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 })
    }

    // ============ CHECK IF USER EXISTS ============
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login or use a different email.' },
        { status: 409 } // 409 Conflict
      )
    }

    // ============ HASH PASSWORD ============
    let passwordHash
    try {
      passwordHash = await hashPassword(password)
    } catch (error) {
      console.error('Hashing error:', error)
      return NextResponse.json({ error: 'Failed to process password' }, { status: 500 })
    }

    // ============ SANITIZE INPUTS ============
    const sanitizedDisplayName = displayName ? sanitizeString(displayName, 255) : null
    const sanitizedPhone = phone ? sanitizeString(phone, 20) : null
    const sanitizedUpiId = upiId ? sanitizeString(upiId, 100) : null

    // ============ CREATE USER ============
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: passwordHash,
        display_name: sanitizedDisplayName,
        phone: sanitizedPhone,
        upi_id: sanitizedUpiId,
        is_admin: false, // ALWAYS false for signups
        email_verified: false,
      })
      .select('id, email, display_name, is_admin, created_at')
      .single()

    if (createError) {
      console.error('Signup error:', createError)
      
      // Handle unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Email already registered. Please login.' },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // ============ CREATE VERIFICATION TOKEN ============
    try {
      const token = await createEmailVerificationToken(user.id)
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔗 VERIFICATION LINK FOR:', email)
      console.log('📋 Copy this URL:', verificationUrl)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } catch (tokenError) {
      console.error('Failed to create verification token:', tokenError)
    }

    // ============ RETURN SUCCESS ============
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}