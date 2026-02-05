# Database Setup Scripts

## Setup Order

1. **schema.sql** - Complete database schema
   - Creates all tables for both System A (Product Recommendations) and System B (Daily Tasks)
   - Includes users, products, campaigns, categories, tasks, earnings, payments, and more
   - Run this first

2. **test_data_clean.sql** - Test data (optional)
   - Creates 5 test users (4 regular users + 1 admin)
   - Creates 5 products per user (25 total products)
   - Creates 5 test tasks
   - Password for all test users: `test123`
   - Run this after schema.sql if you want test data

## How to Run

### Using phpMyAdmin:
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select your database (or create one: `qrbot`)
3. Go to "Import" tab
4. Import `schema.sql` first
5. (Optional) Import `test_data_clean.sql` for test data

### Using MySQL Command Line:
```bash
mysql -u root -p qrbot < schema.sql
mysql -u root -p qrbot < test_data_clean.sql
```

## Database Structure

- **Users**: Authentication, profiles, admin flags
- **Products**: Admin-managed product catalog
- **QR Campaigns**: Admin-managed QR code campaigns
- **Tasks**: CPA/CPI offers for users to complete
- **Earnings**: User earnings tracking
- **Payments**: UPI payout records

## Notes

- All products and campaigns are admin-managed (no user accounts)
- Users can only complete tasks and track earnings
- Admin can create products, campaigns, and manage tasks
