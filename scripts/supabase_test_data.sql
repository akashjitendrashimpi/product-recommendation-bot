-- Test Data for Qyantra (Supabase / PostgreSQL)
-- Run this after supabase_schema.sql

-- Step 1: Create test users
INSERT INTO users (email, password, display_name, is_admin, upi_id, phone) VALUES
('user1@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'John Doe', FALSE, 'john@paytm', '9876543210'),
('user2@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Jane Smith', FALSE, 'jane@upi', '9876543211'),
('user3@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Mike Johnson', FALSE, 'mike@paytm', '9876543212'),
('user4@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Sarah Williams', FALSE, 'sarah@upi', '9876543213'),
('admin@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Admin User', TRUE, 'admin@paytm', '9876543214')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Insert products
INSERT INTO products (product_id, name, category, price, description, amazon_link, flipkart_link, quality_score, popularity_score, user_id) VALUES
('ELEC001', 'Wireless Bluetooth Earbuds', 'Electronics', 1499, 'High-quality wireless earbuds with noise cancellation', 'https://amazon.in/dp/ELEC001?tag=demo', 'https://flipkart.com/ELEC001?affid=demo', 7, 9, (SELECT id FROM users WHERE email = 'user1@test.com')),
('ELEC002', 'Smart Watch Fitness Tracker', 'Electronics', 2999, 'Track your health and stay connected', 'https://amazon.in/dp/ELEC002?tag=demo', 'https://flipkart.com/ELEC002?affid=demo', 8, 9, (SELECT id FROM users WHERE email = 'user1@test.com')),
('KTCH001', 'Stainless Steel Water Bottle', 'Kitchen', 599, 'Insulated water bottle keeps drinks cold 24hrs', 'https://amazon.in/dp/KTCH001?tag=demo', 'https://flipkart.com/KTCH001?affid=demo', 8, 8, (SELECT id FROM users WHERE email = 'user2@test.com')),
('FASH001', 'Cotton T-Shirt Pack', 'Fashion', 599, 'Pack of 3 comfortable cotton t-shirts', 'https://amazon.in/dp/FASH001?tag=demo', 'https://flipkart.com/FASH001?affid=demo', 8, 9, (SELECT id FROM users WHERE email = 'user3@test.com')),
('HLTH001', 'Face Moisturizer', 'Health & Beauty', 499, 'Hydrating face cream for all skin types', 'https://amazon.in/dp/HLTH001?tag=demo', 'https://flipkart.com/HLTH001?affid=demo', 6, 8, (SELECT id FROM users WHERE email = 'user4@test.com'))
ON CONFLICT (product_id) DO NOTHING;

-- Step 3: Insert tasks
INSERT INTO tasks (network_id, task_id, title, description, action_type, app_name, app_icon_url, task_url, network_payout, user_payout, currency, country, is_active) VALUES
(NULL, 'TASK001', 'Install Paytm App', 'Download and install Paytm mobile app', 'install', 'Paytm', 'https://play-lh.googleusercontent.com/example1', 'https://play.google.com/store/apps/details?id=net.one97.paytm', 15.00, 12.00, 'INR', 'IN', TRUE),
(NULL, 'TASK002', 'Sign Up on PhonePe', 'Create a new account on PhonePe', 'signup', 'PhonePe', 'https://play-lh.googleusercontent.com/example2', 'https://play.google.com/store/apps/details?id=com.phonepe.app', 12.00, 10.00, 'INR', 'IN', TRUE),
(NULL, 'TASK003', 'Install Zomato App', 'Download Zomato food delivery app', 'install', 'Zomato', 'https://play-lh.googleusercontent.com/example3', 'https://play.google.com/store/apps/details?id=com.application.zomato', 18.00, 15.00, 'INR', 'IN', TRUE)
ON CONFLICT DO NOTHING; -- No unique key on task_id in schema yet, but good practice
