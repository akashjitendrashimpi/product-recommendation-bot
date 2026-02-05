# QrBot

A Next.js application for creating QR-powered product recommendation chatbots and daily task rewards system with MySQL/XAMPP support.

## Features

- User authentication with password-based login
- Product catalog management with affiliate links
- QR code campaign creation and management
- Interactive chatbot for product recommendations
- Admin panel for user and content management

## Prerequisites

- Node.js 18+ and npm/pnpm
- XAMPP with MySQL running
- MySQL database created

## Setup Instructions

### 1. Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (usually at http://localhost/phpmyadmin)
3. Create a new database named `qrbot` (or use existing database)
4. Import the schema from `scripts/schema.sql`
5. (Optional) Import `scripts/test_data_clean.sql` for test data

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=qrbot

NODE_ENV=development
```

### 3. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 4. Run the Application

```bash
pnpm dev
# or
npm run dev
```

The application will be available at http://localhost:3000

## Database Schema

The application uses the following main tables:

**System A (Product Recommendations):**
- `users` - User accounts with password hashing
- `products` - Product catalog (admin-managed)
- `qr_campaigns` - QR code campaigns (admin-managed)
- `categories` - Product categories
- `chat_sessions` - Chat interaction logs
- `affiliate_clicks` - Affiliate link click tracking
- `affiliate_conversions` - Purchase conversion tracking

**System B (Daily Tasks):**
- `tasks` - CPA/CPI offers for users to complete
- `task_completions` - User task completion tracking
- `user_earnings` - Daily earnings aggregation
- `payments` - UPI payout records
- `cpa_networks` - CPA network API credentials

## Authentication

- Users sign up with email and password
- Passwords are hashed using PBKDF2
- Sessions are managed via HTTP-only cookies
- Admin users can manage all content

## Default Categories

The following categories are created automatically:
- Daily-use items
- Electronics
- Kitchen
- Fashion
- Health & Beauty
- Sports & Fitness

## Creating an Admin User

After signing up, you can manually set a user as admin in the database:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

Or use the test data which includes an admin account:
- **Email:** `admin@test.com`
- **Password:** `test123`

**Note:** Admin users automatically see the admin dashboard when logging in. Regular users see the user dashboard with tasks only.

## Development

- API routes: `app/api/`
- Database layer: `lib/db/`
- Authentication: `lib/auth/`
- Components: `components/`

## License

MIT
