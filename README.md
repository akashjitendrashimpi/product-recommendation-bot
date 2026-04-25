# Qyantra — Earn Real Money Daily

> India's trusted incentive-based rewards platform. Complete simple tasks, earn real cash, withdraw to UPI.

🌐 **Live:** [www.qyantra.online](https://www.qyantra.online)

---

## What is Qyantra?

Qyantra is a full-stack earn-money platform where users complete simple tasks (install apps, write reviews, complete surveys) and get paid directly to their UPI (Paytm, GPay, PhonePe). Minimum payout ₹50.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| CDN / DDoS | Cloudflare |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Auth | HMAC-signed HTTP-only cookies |
| Push Notifications | OneSignal |
| Analytics | Vercel Analytics |
| Email | Resend + Gmail SMTP |
| Payments | Manual UPI (Paytm, GPay, PhonePe) |

---

## Features

### User Side
- Email signup with auto-login
- Task browsing with search, sort, filter
- Task detail page with step-by-step guide
- Screenshot proof upload for task verification
- Real-time earnings dashboard
- Balance-based UPI withdrawal requests
- Push notifications (web + mobile)
- PWA — installable on Android/iOS
- Referral system (coming soon)

### Admin Side
- Task management (create, edit, duplicate, reorder, bulk actions)
- Proof verification with screenshot preview + download
- Payment approval with UPI copy
- User management (ban/unban with reason, delete)
- Product & affiliate section management
- QR campaign management
- Push notification broadcast
- Analytics per task (clicks, completions, conversion rate)
- Settings (min/max payout limits)

---

## Project Structure

app/
├── api/                    # API routes
│   ├── admin/              # Admin-only endpoints
│   ├── auth/               # Auth endpoints
│   ├── tasks/              # Task endpoints
│   └── ...
├── auth/                   # Auth pages
├── dashboard/              # User dashboard pages
├── admin/                  # Admin panel pages
└── page.tsx                # Landing page
components/
├── dashboard/              # User dashboard components
├── admin/                  # Admin panel components
└── landing/                # Landing page components
lib/
├── auth/                   # Session management
├── db/                     # Database queries
└── security/               # Rate limiting

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=your_64_byte_hex_secret

# OneSignal Push Notifications
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_key

# Web Push (VAPID) — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:contact@qyantra.online
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

---

## Database Setup (Supabase)

Run these SQL migrations in Supabase SQL editor:

```sql
-- Required columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS has_detail_page BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS how_to_steps JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS copy_prompts JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS max_completions INTEGER DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO settings (key, value, description) VALUES
  ('min_payout', '50', 'Minimum withdrawal amount in INR'),
  ('max_payout', '5000', 'Maximum per withdrawal request'),
  ('max_daily_payout', '10000', 'Daily withdrawal limit')
ON CONFLICT (key) DO NOTHING;
```

---

## Creating Admin Account

1. Sign up normally at `/auth/sign-up`
2. Run this in Supabase SQL editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

---

## Deployment

- **Platform:** Vercel (auto-deploy on git push)
- **Domain:** GoDaddy → Cloudflare DNS → Vercel
- **SSL:** Cloudflare (automatic)
- **Environment variables:** Set in Vercel project settings

---

## Security

- HMAC-SHA256 signed session cookies
- HTTP security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on all auth routes
- Input validation and sanitization
- Password hashing (bcrypt)
- Banned users blocked at login
- Admin-only routes protected at middleware level
- Payment duplicate detection

---

## CPA Network Compliance

- Incentive traffic disclosure in Terms of Service (Section 3)
- Age restriction (18+) in footer
- No guaranteed earnings claims
- Honest earnings estimates with disclaimers
- Contact email visible for advertiser verification

---

## Roadmap

- [ ] Email notifications (Resend)
- [ ] Admin analytics dashboard
- [ ] User onboarding flow
- [ ] PWA install prompt
- [ ] Hindi language version
- [ ] CPA network integration (vCommission, Admitad, CPAlead)
- [ ] Referral system launch

---

## License

Private — All rights reserved © 2026 Qyantra