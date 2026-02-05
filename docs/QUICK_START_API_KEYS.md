# Quick Start: API Keys You Actually Need

## TL;DR - What You Need

**For CPA/CPI Tasks:**
- **Start with 1 network** (enough to begin)
- **Recommended: 2-3 networks** (more offers = better for users)
- **All are FREE** to use

**For Email (Verification & Notifications):**
- **Only 1 email service** needed (handles everything)
- **FREE tier available** (sufficient for small scale)

---

## CPA/CPI Networks - How Many?

### Short Answer: **Start with 1, add more later**

**One network is enough to:**
- ✅ Get started and test the system
- ✅ Have a working task system
- ✅ Learn how the integration works

**Why add more networks?**
- 📈 More offers = more tasks for users
- 💰 Better variety of payouts
- 🎯 Different networks have different offers
- 🔄 If one network has issues, others still work

### Recommended Approach:

1. **Start with 1 network** (pick the easiest one)
   - **Best choice for beginners:** **CPAGrip** or **AdGate Media**
   - They have good documentation and easy setup

2. **Add 1-2 more after testing** (when you're ready)
   - This gives you a good variety of offers
   - Users will have more tasks to choose from

3. **You can add more later** (as you grow)
   - No need to integrate all at once
   - Add networks gradually based on what offers you need

### Which Network to Start With?

**Easiest for Beginners:**
1. **CPAGrip** - Simple API, good documentation
2. **AdGate Media** - Popular, reliable, easy setup

**More Advanced (add later):**
3. **Torox** - Good for specific regions
4. **OfferToro** - Wide variety of offers

---

## Email Service - Only Need ONE

### Short Answer: **Just 1 email service handles everything**

You only need **ONE** email service provider for:
- ✅ Email verification after registration
- ✅ Password reset emails
- ✅ Task completion notifications
- ✅ Payment confirmations
- ✅ All other email needs

### Recommended: **Resend** (Best for Next.js)

**Why Resend?**
- ✅ **3,000 emails/month FREE** (plenty for starting)
- ✅ **Built for developers** - easy integration
- ✅ **Great Next.js support**
- ✅ **Simple API** - just one API key
- ✅ **No domain verification needed** initially (can use their domain)

**How to Get:**
1. Go to https://resend.com/
2. Sign up (free)
3. Get your API key from dashboard
4. That's it! One key for everything.

### Alternative Options:

**SendGrid** (if Resend doesn't work for you)
- 100 emails/day free
- More complex setup
- Requires domain verification

**Mailgun** (for high volume later)
- 5,000 emails/month free (first 3 months)
- Good for scaling up
- Requires domain verification

---

## What You Need Right Now

### Minimum Setup (To Get Started):

```env
# Email Service (REQUIRED for email verification)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# CPA Network (OPTIONAL - start with one)
CPAGRIP_API_KEY=your_cpagrip_key
# OR
ADGATE_API_KEY=your_adgate_key
```

### Recommended Setup (Better Experience):

```env
# Email Service (REQUIRED)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# CPA Networks (2-3 networks for variety)
CPAGRIP_API_KEY=your_cpagrip_key
ADGATE_API_KEY=your_adgate_key
TOROX_API_KEY=your_torox_key  # Optional, add later
```

---

## Cost Breakdown

| Service | How Many | Cost | Free Tier |
|---------|----------|------|-----------|
| **Email Service** | **1 only** | Free | ✅ 3,000 emails/month (Resend) |
| **CPA Networks** | **1-3 recommended** | Free | ✅ All networks are free |

**Total Cost: $0** (for starting out)

---

## Step-by-Step: Getting Your API Keys

### Step 1: Get Email Service API Key (Required)

1. **Go to Resend.com**
2. **Sign up** (takes 2 minutes)
3. **Go to API Keys** in dashboard
4. **Create API Key** → Copy it
5. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

**That's it!** This one key handles all emails.

---

### Step 2: Get CPA Network API Key (Optional - Start with 1)

**Option A: CPAGrip (Recommended for beginners)**

1. Go to https://www.cpagrip.com/
2. **Sign up** as Publisher (free)
3. **Go to API Settings** in dashboard
4. **Generate API Key** → Copy it
5. **Add to `.env.local`:**
   ```env
   CPAGRIP_API_KEY=your_cpagrip_key
   ```

**Option B: AdGate Media (Alternative)**

1. Go to https://www.adgatemedia.com/
2. **Sign up** (free)
3. **Navigate to API section**
4. **Get API Key** → Copy it
5. **Add to `.env.local`:**
   ```env
   ADGATE_API_KEY=your_adgate_key
   ```

---

## Summary

**What you need:**
- ✅ **1 Email Service** (Resend recommended) - **REQUIRED**
- ✅ **1 CPA Network** (CPAGrip or AdGate) - **OPTIONAL** to start
- ✅ **Add more CPA networks later** (when ready)

**Total API Keys Needed:**
- **Minimum:** 1 (just email)
- **Recommended:** 2 (email + 1 CPA network)
- **Ideal:** 3-4 (email + 2-3 CPA networks)

**All FREE to start!** 🎉

---

## Next Steps

1. **Get Resend API key** (for email verification)
2. **Get 1 CPA network API key** (CPAGrip or AdGate)
3. **Add them to `.env.local`**
4. **Test the integration**
5. **Add more CPA networks later** (when you want more offers)

That's it! You don't need anything else to get started.
