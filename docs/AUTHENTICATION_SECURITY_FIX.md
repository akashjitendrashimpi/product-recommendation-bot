# Authentication & Security Fixes - Complete Guide

## Overview

This document details all authentication and security fixes applied to the Qyantra application to ensure secure and consistent user login and registration flows.

## Critical Fixes Applied

### 1. ✅ Password Hashing Consistency Fix

**Issue:** Password hashing mismatch between signup and login
- **signup/route.ts** was using `bcryptjs`
- **lib/auth/password.ts** was using `PBKDF2`
- **Result:** Passwords hashed during signup couldn't be verified during login

**Fix Applied:**
- Updated `app/api/auth/signup/route.ts` to use `PBKDF2` hashing from `lib/auth/password.ts`
- Changed: `await bcrypt.hash(password, 10)` → `await hashPassword(password)`
- Now both signup and login use the same `PBKDF2` algorithm with:
  - 32-byte salt (256-bit)
  - 100,000 iterations (PBKDF2-SHA512)
  - 64-byte hash length (512-bit)

**Files Modified:**
- `app/api/auth/signup/route.ts`

---

### 2. ✅ Rate Limiting on Login

**Issue:** Login endpoint had no rate limiting, allowing brute force attacks

**Fix Applied:**
- Added rate limiting to `app/api/auth/login/route.ts`
- Configured: 5 requests per 60,000ms (1 minute)
- Uses IP address for rate limit tracking
- Returns 429 (Too Many Requests) when limit exceeded

**Implementation:**
```typescript
const rateLimitResponse = rateLimit(request, 5, 60000)
if (rateLimitResponse) return rateLimitResponse
```

**Files Modified:**
- `app/api/auth/login/route.ts`

---

### 3. ✅ Email Verification Field Added

**Issue:** Email verification workflow existed but wasn't tracked in user interface

**Fix Applied:**
- Added `email_verified: boolean` field to User interface
- Added `email_verified: boolean` field to UserProfile type
- Email verification status now properly typed

**Files Modified:**
- `lib/db/users.ts` - User interface
- `lib/types.ts` - UserProfile interface

---

## Current Authentication Architecture

### Password Hashing (PBKDF2)
```
Algorithm: PBKDF2-SHA512
Salt: 32 bytes (256-bit) - cryptographically random
Iterations: 100,000
Hash Length: 64 bytes (512-bit)
Format: "{salt}:{hash}"
```

### Session Management
```
Storage: HTTP-only cookie (auth_session)
Encoding: URL-encoded JSON
Max Age: 7 days (604,800 seconds)
Same-Site: lax (CSRF protection)
Secure: true (HTTPS only in production)
```

### Session Structure
```typescript
{
  userId: number
  email: string
  isAdmin: boolean
}
```

### Email Verification Flow
```
1. User signs up → Email verification token created (24-hour expiry)
2. Verification link sent to user email
3. User clicks link → Email marked as verified
4. User can now login (verification optional - configurable)
```

### Rate Limiting
```
Signup: 5 requests / 60 seconds per IP
Login: 5 requests / 60 seconds per IP
Forgot Password: N/A (documented in docs)
```

---

## Security Checklist

### ✅ Implemented
- [x] Password hashing with PBKDF2
- [x] Rate limiting on authentication endpoints
- [x] Email verification support
- [x] Session cookies (HTTP-only, secure, SameSite)
- [x] Input validation (email, password, phone, UPI)
- [x] Input sanitization
- [x] CORS protection (SameSite policy)

### ⚠️ To Consider
- [ ] Session signature verification (currently plain JSON)
- [ ] CAPTCHA for repeated failed login attempts
- [ ] Password reset email verification
- [ ] Admin audit logging
- [ ] Suspicious activity alerts
- [ ] Two-factor authentication (2FA)
- [ ] Device fingerprinting

---

## Database Integration

### Current Status: Mixed (Technical Debt)
- **Auth System** uses Supabase:
  - `app/api/auth/signup/route.ts`
  - `app/api/auth/login/route.ts`
  - `lib/db/users.ts`
  - `lib/db/email-tokens.ts`

- **Business Logic** uses PostgreSQL (via `lib/db/connection.ts`):
  - `lib/db/products.ts`
  - `lib/db/tasks.ts`
  - `lib/db/campaigns.ts`
  - `lib/db/earnings.ts`
  - `lib/db/payments.ts`
  - `lib/db/categories.ts`

### Recommendation
**Unify to Supabase for all database operations** to ensure:
- Single source of truth
- Consistent connection pooling
- Easier maintenance
- Better TypeScript integration

---

## API Endpoints

### POST /api/auth/signup
**Rate Limit:** 5 requests/minute per IP

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe (Optional)",
  "phone": "+91XXXXXXXXXX (Optional)",
  "upiId": "john@paytm (Optional)"
}
```

Response (Success - 200):
```json
{
  "success": true,
  "message": "Account created. Please check your email to verify your email address.",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "display_name": "John Doe",
    "phone": "+91XXXXXXXXXX",
    "upi_id": "john@paytm"
  }
}
```

Response (Error - 400/500):
```json
{
  "error": "Specific error message"
}
```

---

### POST /api/auth/login
**Rate Limit:** 5 requests/minute per IP

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response (Success - 200):
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com"
  }
}
```

Response (Invalid Credentials - 401):
```json
{
  "error": "Invalid email or password"
}
```

Response (Too Many Attempts - 429):
```json
{
  "error": "Too many requests. Please try again later."
}
```

---

## Password Requirements

Users must create passwords that meet these requirements:
- **Minimum length:** 8 characters
- **Maximum length:** 128 characters
- **Must contain:** Uppercase letter (A-Z)
- **Must contain:** Lowercase letter (a-z)
- **Must contain:** Number (0-9)

**Examples:**
- ✅ `SecurePass123` - Valid
- ❌ `password123` - No uppercase
- ❌ `PASSWORD` - No lowercase or number
- ❌ `Pass12` - Too short (6 chars)

---

## Environment Variables Needed

```env
# Supabase Configuration (Required for Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email Service (Required for Verification Emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (For non-auth operations)
DATABASE_URL=postgresql://user:password@localhost:5432/qyantra
```

---

## Testing Checklist

### Manual Testing
- [ ] Sign up with valid credentials
- [ ] Email verification link works
- [ ] Cannot login before verifying email (if enforced)
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] Rate limiting blocks after 5 attempts
- [ ] Password meets all requirements
- [ ] Logout clears session

### Security Testing
- [ ] SQL injection attempts blocked (input validation)
- [ ] XSS attempts blocked (input sanitization)
- [ ] CSRF protection (SameSite cookie)
- [ ] Session hijacking prevention (secure cookie)
- [ ] Password exposure in logs (verify passwords not logged)
- [ ] Timing attacks (password verification takes consistent time)

---

## Troubleshooting

### "Invalid email or password" - Always shown on failed login
This is intentional for security. Never reveal if email exists or password is wrong.

### Email verification link expired
- Token expiry: 24 hours
- Solution: Resend verification email from login page

### Session cookie not being set
- Check: `NODE_ENV` is set correctly
- Check: Cookie domain matches request origin
- Check: Browser allows HTTP-only cookies
- Check: HTTPS in production (secure flag requires HTTPS)

### PBKDF2 Hashing Performance
- 100,000 iterations takes ~100-200ms per password
- This is intentional for security (prevents brute force)
- Use connection pooling to minimize database calls

---

## Future Improvements

1. **Session Signing**
   - Add cryptographic signature to session cookie
   - Prevent session tampering

2. **Implement 2FA**
   - TOTP (Time-based One-Time Password)
   - Recovery codes

3. **Advanced Rate Limiting**
   - Redis for distributed rate limiting
   - Exponential backoff per user
   - IP reputation filtering

4. **Audit Logging**
   - Log all authentication events
   - Track suspicious patterns
   - Admin dashboard for security events

5. **Password Policy**
   - Enforce password history (no reuse)
   - Automatic expiration
   - Breach detection (Have I Been Pwned API)

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [PBKDF2 Standard (RFC 2898)](https://tools.ietf.org/html/rfc2898)
- [HTTP Cookies - SameSite Attribute](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site)
- [Node.js Crypto PBKDF2](https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback)

---

## Document Version

- **Version:** 1.0
- **Last Updated:** 2026-02-24
- **Author:** Security Team
- **Status:** ✅ All Critical Fixes Applied
