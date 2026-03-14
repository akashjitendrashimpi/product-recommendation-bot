import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { rateLimit } from '@/lib/security/rate-limit'
import { validateEmail, validatePassword, validatePhone, validateUpiId, sanitizeString } from '@/lib/security/validation'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting: 5 signups per minute per IP ──
    const rateLimitResponse = rateLimit(request, 5, 60000)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse input ──
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { email, password, displayName, phone, upiId, referralCode } = body

    // ── Validate required fields ──
    if (!email || typeof email !== 'string')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!validateEmail(email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    if (!password || typeof password !== 'string')
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid)
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })

    if (!displayName || typeof displayName !== 'string' || !displayName.trim())
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })

    // ── Validate optional fields ──
    if (phone && !validatePhone(phone))
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    if (upiId && !validateUpiId(upiId))
      return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 })

    const normalizedEmail = email.toLowerCase().trim()

    // ── Check if user already exists ──
    const { data: existingUser, error: checkError } = await (supabaseAdmin as any)
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    if (existingUser)
      return NextResponse.json(
        { error: 'Email already registered. Please login or use a different email.' },
        { status: 409 }
      )

    // ── Hash password ──
    let passwordHash: string
    try {
      passwordHash = await hashPassword(password)
    } catch {
      return NextResponse.json({ error: 'Failed to process password' }, { status: 500 })
    }

    // ── Sanitize inputs ──
    const sanitizedDisplayName = sanitizeString(displayName.trim(), 255)
    const sanitizedPhone = phone ? sanitizeString(phone.trim(), 20) : null
    const sanitizedUpiId = upiId ? sanitizeString(upiId.trim(), 100) : null
    const sanitizedReferralCode = referralCode
      ? sanitizeString(referralCode.trim().toUpperCase(), 20)
      : null

    // ── Generate unique referral code for new user ──
    const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // ── Create user ──
    const { data: user, error: createError } = await (supabaseAdmin as any)
      .from('users')
      .insert({
        email: normalizedEmail,
        password: passwordHash,
        display_name: sanitizedDisplayName,
        phone: sanitizedPhone,
        upi_id: sanitizedUpiId,
        is_admin: false, // ALWAYS false on signup — never trust client
        email_verified: false,
        referral_code: newReferralCode,
      })
      .select('id, email, display_name, is_admin')
      .single()

    if (createError) {
      console.error('Signup error:', createError)
      if (createError.code === '23505')
        return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    if (!user)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })

    // ── Apply referral code if provided ──
    if (sanitizedReferralCode) {
      try {
        const { data: referrer } = await (supabaseAdmin as any)
          .from('users')
          .select('id, referral_earnings')
          .eq('referral_code', sanitizedReferralCode)
          .neq('id', user.id) // Security: can't refer yourself
          .maybeSingle()

        if (referrer) {
          // Link referred_by on new user
          await (supabaseAdmin as any)
            .from('users')
            .update({ referred_by: referrer.id })
            .eq('id', user.id)

          // Credit ₹20 to referrer
          await (supabaseAdmin as any)
            .from('users')
            .update({
              referral_earnings: Number(referrer.referral_earnings || 0) + 20,
            })
            .eq('id', referrer.id)

          // Credit ₹10 signup bonus to new user earnings
          const today = new Date().toISOString().split('T')[0]
          await (supabaseAdmin as any)
            .from('user_earnings')
            .insert({
              user_id: user.id,
              date: today,
              daily_earnings: 10,
              tasks_completed: 0,
              amount: 10,
            })
        }
      } catch (refError) {
        console.error('Referral apply error:', refError)
        // Don't fail signup if referral processing fails
      }
    }

    // ── Create session so user is auto-logged in → goes straight to dashboard ──
    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: false,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
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