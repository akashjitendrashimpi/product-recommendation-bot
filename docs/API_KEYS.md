# API Keys & External Services Setup

This document explains what API keys and external services you'll need for QrBot, whether they're free, and how to obtain them.

## Quick Answer

**For CPA/CPI Networks:** Start with **1 network** (enough to begin), add 2-3 more later for variety. All are FREE.

**For Email Service:** You only need **1 email service** (handles verification, password reset, notifications, etc.). FREE tier available.

👉 **See [QUICK_START_API_KEYS.md](./QUICK_START_API_KEYS.md) for a simple guide on what you actually need.**

## Current Status

**Note:** Most of these integrations are planned for future implementation. The current version works without any external API keys for basic functionality.

## Required API Keys (For Future Features)

### 1. CPA/CPI Network APIs (For Daily Tasks System)

**Status:** Not yet implemented  
**Free:** Yes (most networks offer free accounts)  
**When Needed:** When you want to automatically sync tasks from CPA networks

#### Popular Networks:

1. **AdGate Media**
   - Website: https://www.adgatemedia.com/
   - Free: Yes
   - How to get:
     1. Sign up for an account
     2. Navigate to API section in dashboard
     3. Generate API key
   - API Docs: Usually available in their dashboard

2. **Torox**
   - Website: https://torox.com/
   - Free: Yes
   - How to get:
     1. Register as publisher
     2. Access API credentials from dashboard
   - API Docs: Contact support for API documentation

3. **CPAGrip**
   - Website: https://www.cpagrip.com/
   - Free: Yes
   - How to get:
     1. Create publisher account
     2. Go to API settings
     3. Generate API key
   - API Docs: Available in dashboard

4. **OfferToro**
   - Website: https://www.offertoro.com/
   - Free: Yes
   - How to get:
     1. Sign up as publisher
     2. Access API section
     3. Get API key and secret
   - API Docs: Provided in dashboard

#### Implementation Notes:
- These networks typically require:
  - API Key
  - API Secret (sometimes)
  - Publisher ID
  - Postback URL (for conversion tracking)
- Most networks offer REST APIs
- Some may require webhook endpoints for callbacks

---

### 2. UPI Payment Gateway (For Payouts)

**Status:** Not yet implemented  
**Free:** No (transaction fees apply)  
**When Needed:** When you want to automatically process UPI payouts to users

#### Options:

1. **Razorpay**
   - Website: https://razorpay.com/
   - Free: No (2% + ₹2 per transaction)
   - How to get:
     1. Sign up for Razorpay account
     2. Complete KYC verification
     3. Get API keys from dashboard
   - API Docs: https://razorpay.com/docs/api/
   - Features: UPI, IMPS, NEFT support

2. **Paytm Payment Gateway**
   - Website: https://paytm.com/business/
   - Free: No (transaction fees apply)
   - How to get:
     1. Register business account
     2. Complete verification
     3. Get merchant credentials
   - API Docs: Available in merchant dashboard

3. **PhonePe Payment Gateway**
   - Website: https://www.phonepe.com/business/
   - Free: No (transaction fees apply)
   - How to get:
     1. Register as merchant
     2. Complete onboarding
     3. Get API credentials
   - API Docs: Provided after registration

4. **Cashfree**
   - Website: https://www.cashfree.com/
   - Free: No (transaction fees apply)
   - How to get:
     1. Sign up for account
     2. Complete KYC
     3. Get API keys
   - API Docs: https://docs.cashfree.com/

#### Implementation Notes:
- All payment gateways require:
  - Merchant ID / API Key
  - API Secret
  - Webhook URL (for payment status updates)
- Most require business verification/KYC
- Transaction fees typically range from 1.5% - 3% per transaction
- Some offer lower rates for high volume

---

### 3. QR Code Generation (Current - No API Key Needed)

**Status:** Already implemented  
**Free:** Yes  
**Package Used:** `qrcode` (npm package)

No external API key needed - QR codes are generated client-side using the `qrcode` npm package.

---

## Optional Services

### 4. Email Service (For Notifications)

**Status:** Not yet implemented  
**Free:** Yes (with limits)  
**When Needed:** For sending email notifications (password reset, payment confirmations, etc.)

#### Options:

1. **Resend**
   - Website: https://resend.com/
   - Free: 3,000 emails/month
   - How to get:
     1. Sign up for free account
     2. Get API key from dashboard
   - API Docs: https://resend.com/docs

2. **SendGrid**
   - Website: https://sendgrid.com/
   - Free: 100 emails/day
   - How to get:
     1. Create free account
     2. Verify sender
     3. Get API key
   - API Docs: https://docs.sendgrid.com/

3. **Mailgun**
   - Website: https://www.mailgun.com/
   - Free: 5,000 emails/month (first 3 months)
   - How to get:
     1. Sign up
     2. Verify domain
     3. Get API key
   - API Docs: https://documentation.mailgun.com/

---

## Environment Variables Setup

When you implement these features, add the following to your `.env.local`:

```env
# CPA Network APIs (Future)
ADGATE_API_KEY=your_adgate_key
ADGATE_API_SECRET=your_adgate_secret
TOROX_API_KEY=your_torox_key
CPAGRIP_API_KEY=your_cpagrip_key

# Payment Gateway (Future)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
# OR
PAYTM_MERCHANT_ID=your_paytm_merchant_id
PAYTM_MERCHANT_KEY=your_paytm_key

# Email Service (Future)
RESEND_API_KEY=your_resend_key
# OR
SENDGRID_API_KEY=your_sendgrid_key
```

---

## Cost Summary

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| CPA Networks | ✅ Yes | N/A | Free to use, you earn from commissions |
| Payment Gateway | ❌ No | ~2% per transaction | Required for automated payouts |
| Email Service | ✅ Yes (limited) | $10-20/month | Free tier usually sufficient for small scale |
| QR Generation | ✅ Yes | N/A | Already implemented, no cost |

---

## Getting Started (Priority Order)

1. **Start without API keys** - The app works fine for:
   - Product recommendations
   - QR campaign creation
   - Manual task management
   - User management

2. **Add CPA Network APIs** (When ready to automate tasks):
   - Choose 1-2 networks to start
   - Sign up and get API keys
   - Implement sync functionality

3. **Add Payment Gateway** (When ready for automated payouts):
   - Choose a payment provider
   - Complete business verification
   - Implement payout automation

4. **Add Email Service** (Optional, for better UX):
   - Choose a provider
   - Set up email templates
   - Implement notifications

---

## Support & Documentation

- Most services provide comprehensive documentation
- Support is usually available via email/chat
- Some services offer developer communities/forums

---

## Security Notes

⚠️ **Important:**
- Never commit API keys to version control
- Always use environment variables
- Rotate keys regularly
- Use different keys for development and production
- Monitor API usage for suspicious activity
