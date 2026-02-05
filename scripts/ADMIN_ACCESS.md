# How to Access Admin Panel

## Step 1: Create an Admin User

You have two options:

### Option A: Use Test Data (Recommended for Testing)
1. Import `scripts/test_data.sql` into your database
2. Login with:
   - **Email:** `admin@test.com`
   - **Password:** `test123`

### Option B: Make Existing User Admin
1. Login to your account normally
2. Go to phpMyAdmin
3. Run this SQL:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
   ```
4. Logout and login again

## Step 2: Access Admin Panel

1. After logging in as admin, you'll automatically be redirected to the admin dashboard
2. The admin dashboard is accessible at: **http://localhost:3000/dashboard** (admins see admin panel, regular users see user dashboard)

## Admin Panel Features

The admin panel has 4 tabs:

1. **Tasks** - Manage CPA/CPI tasks
   - Add/edit/delete tasks
   - Set network payout and user payout
   - Activate/deactivate tasks
   - View profit margins

2. **Users** - Manage all users
   - View all registered users
   - Make users admin
   - Filter by user to see their products/campaigns

3. **Products** - Manage all products
   - View all products from all users
   - Delete products
   - Filter by user

4. **Campaigns** - Manage all QR campaigns
   - View all campaigns
   - Activate/deactivate campaigns
   - Delete campaigns
   - Filter by user

## Test Users

After importing `test_data.sql`, you can login with:

| Email | Password | Role | UPI ID |
|-------|----------|------|--------|
| admin@test.com | test123 | Admin | admin@paytm |
| user1@test.com | test123 | User | john@paytm |
| user2@test.com | test123 | User | jane@upi |
| user3@test.com | test123 | User | mike@paytm |
| user4@test.com | test123 | User | sarah@upi |

Note: Only admin can create products and campaigns. Regular users can only complete tasks.
