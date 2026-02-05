-- Test Data for QrBot
-- Run this after schema.sql
-- Password for all test users: test123

-- Step 1: Create 5 test users
INSERT INTO users (email, password, display_name, is_admin, upi_id, phone) VALUES
('user1@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'John Doe', FALSE, 'john@paytm', '9876543210'),
('user2@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Jane Smith', FALSE, 'jane@upi', '9876543211'),
('user3@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Mike Johnson', FALSE, 'mike@paytm', '9876543212'),
('user4@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Sarah Williams', FALSE, 'sarah@upi', '9876543213'),
('admin@test.com', 'dddaddf48e84a98132052aced55a9e1cf0ead88751fe03fd0c390731974f195f:90437ad420e53c84bfd7067810c41a821ce49b6adaaba80db4a598bafe3cf75794812c93486934f29bdb591c56d67a29c2b2bc43175f3cc8b0bee0eba7532c31', 'Admin User', TRUE, 'admin@paytm', '9876543214');

-- Step 2: Get user IDs
SET @user1_id = (SELECT id FROM users WHERE email = 'user1@test.com');
SET @user2_id = (SELECT id FROM users WHERE email = 'user2@test.com');
SET @user3_id = (SELECT id FROM users WHERE email = 'user3@test.com');
SET @user4_id = (SELECT id FROM users WHERE email = 'user4@test.com');

-- Step 3: Insert products for User 1 (Electronics)
INSERT INTO products (product_id, name, category, price, description, amazon_link, flipkart_link, quality_score, popularity_score, user_id) VALUES
('ELEC001', 'Wireless Bluetooth Earbuds', 'Electronics', 1499, 'High-quality wireless earbuds with noise cancellation', 'https://amazon.in/dp/ELEC001?tag=demo', 'https://flipkart.com/ELEC001?affid=demo', 7, 9, @user1_id),
('ELEC002', 'Smart Watch Fitness Tracker', 'Electronics', 2999, 'Track your health and stay connected', 'https://amazon.in/dp/ELEC002?tag=demo', 'https://flipkart.com/ELEC002?affid=demo', 8, 9, @user1_id),
('ELEC003', 'Portable Power Bank 20000mAh', 'Electronics', 1299, 'Fast charging portable charger', 'https://amazon.in/dp/ELEC003?tag=demo', 'https://flipkart.com/ELEC003?affid=demo', 5, 5, @user1_id),
('ELEC004', 'USB-C Hub Multiport Adapter', 'Electronics', 1899, '7-in-1 USB hub for laptops', 'https://amazon.in/dp/ELEC004?tag=demo', 'https://flipkart.com/ELEC004?affid=demo', 6, 9, @user1_id),
('ELEC005', 'Wireless Mouse Ergonomic', 'Electronics', 799, 'Comfortable wireless mouse for work', 'https://amazon.in/dp/ELEC005?tag=demo', 'https://flipkart.com/ELEC005?affid=demo', 9, 5, @user1_id);

-- Step 4: Insert products for User 2 (Kitchen)
INSERT INTO products (product_id, name, category, price, description, amazon_link, flipkart_link, quality_score, popularity_score, user_id) VALUES
('KTCH001', 'Stainless Steel Water Bottle', 'Kitchen', 599, 'Insulated water bottle keeps drinks cold 24hrs', 'https://amazon.in/dp/KTCH001?tag=demo', 'https://flipkart.com/KTCH001?affid=demo', 8, 8, @user2_id),
('KTCH002', 'Electric Kettle 1.5L', 'Kitchen', 899, 'Fast boiling electric kettle with auto shutoff', 'https://amazon.in/dp/KTCH002?tag=demo', 'https://flipkart.com/KTCH002?affid=demo', 7, 5, @user2_id),
('KTCH003', 'Non-Stick Cookware Set', 'Kitchen', 2499, '5-piece non-stick pan set', 'https://amazon.in/dp/KTCH003?tag=demo', 'https://flipkart.com/KTCH003?affid=demo', 8, 7, @user2_id),
('KTCH004', 'Silicone Baking Mats Set', 'Kitchen', 499, 'Reusable baking mats for oven', 'https://amazon.in/dp/KTCH004?tag=demo', 'https://flipkart.com/KTCH004?affid=demo', 8, 6, @user2_id),
('KTCH005', 'Coffee Maker Machine', 'Kitchen', 3499, 'Automatic drip coffee maker', 'https://amazon.in/dp/KTCH005?tag=demo', 'https://flipkart.com/KTCH005?affid=demo', 8, 5, @user2_id);

-- Step 5: Insert products for User 3 (Fashion)
INSERT INTO products (product_id, name, category, price, description, amazon_link, flipkart_link, quality_score, popularity_score, user_id) VALUES
('FASH001', 'Cotton T-Shirt Pack', 'Fashion', 599, 'Pack of 3 comfortable cotton t-shirts', 'https://amazon.in/dp/FASH001?tag=demo', 'https://flipkart.com/FASH001?affid=demo', 8, 9, @user3_id),
('FASH002', 'Denim Jeans', 'Fashion', 1299, 'Classic fit denim jeans', 'https://amazon.in/dp/FASH002?tag=demo', 'https://flipkart.com/FASH002?affid=demo', 7, 9, @user3_id),
('FASH003', 'Leather Wallet', 'Fashion', 899, 'Genuine leather wallet with card slots', 'https://amazon.in/dp/FASH003?tag=demo', 'https://flipkart.com/FASH003?affid=demo', 5, 7, @user3_id),
('FASH004', 'Sports Shoes', 'Fashion', 2499, 'Comfortable running shoes', 'https://amazon.in/dp/FASH004?tag=demo', 'https://flipkart.com/FASH004?affid=demo', 7, 7, @user3_id),
('FASH005', 'Sunglasses', 'Fashion', 699, 'UV protection sunglasses', 'https://amazon.in/dp/FASH005?tag=demo', 'https://flipkart.com/FASH005?affid=demo', 6, 6, @user3_id);

-- Step 6: Insert products for User 4 (Health & Beauty)
INSERT INTO products (product_id, name, category, price, description, amazon_link, flipkart_link, quality_score, popularity_score, user_id) VALUES
('HLTH001', 'Face Moisturizer', 'Health & Beauty', 499, 'Hydrating face cream for all skin types', 'https://amazon.in/dp/HLTH001?tag=demo', 'https://flipkart.com/HLTH001?affid=demo', 6, 8, @user4_id),
('HLTH002', 'Hair Shampoo', 'Health & Beauty', 299, 'Nourishing shampoo for healthy hair', 'https://amazon.in/dp/HLTH002?tag=demo', 'https://flipkart.com/HLTH002?affid=demo', 6, 5, @user4_id),
('HLTH003', 'Toothbrush Electric', 'Health & Beauty', 1299, 'Electric toothbrush with timer', 'https://amazon.in/dp/HLTH003?tag=demo', 'https://flipkart.com/HLTH003?affid=demo', 8, 7, @user4_id),
('HLTH004', 'Face Mask Pack', 'Health & Beauty', 399, 'Sheet masks for glowing skin', 'https://amazon.in/dp/HLTH004?tag=demo', 'https://flipkart.com/HLTH004?affid=demo', 8, 9, @user4_id),
('HLTH005', 'Body Lotion', 'Health & Beauty', 349, 'Moisturizing body lotion', 'https://amazon.in/dp/HLTH005?tag=demo', 'https://flipkart.com/HLTH005?affid=demo', 6, 7, @user4_id);

-- Step 7: Insert 5 test tasks
INSERT INTO tasks (network_id, task_id, title, description, action_type, app_name, app_icon_url, task_url, network_payout, user_payout, currency, country, is_active) VALUES
(NULL, 'TASK001', 'Install Paytm App', 'Download and install Paytm mobile app', 'install', 'Paytm', 'https://play-lh.googleusercontent.com/example1', 'https://play.google.com/store/apps/details?id=net.one97.paytm', 15.00, 12.00, 'INR', 'IN', TRUE),
(NULL, 'TASK002', 'Sign Up on PhonePe', 'Create a new account on PhonePe', 'signup', 'PhonePe', 'https://play-lh.googleusercontent.com/example2', 'https://play.google.com/store/apps/details?id=com.phonepe.app', 12.00, 10.00, 'INR', 'IN', TRUE),
(NULL, 'TASK003', 'Install Zomato App', 'Download Zomato food delivery app', 'install', 'Zomato', 'https://play-lh.googleusercontent.com/example3', 'https://play.google.com/store/apps/details?id=com.application.zomato', 18.00, 15.00, 'INR', 'IN', TRUE),
(NULL, 'TASK004', 'Spend 10 Minutes in Swiggy', 'Open Swiggy app and browse for 10 minutes', 'time_spent', 'Swiggy', 'https://play-lh.googleusercontent.com/example4', 'https://play.google.com/store/apps/details?id=in.swiggy.android', 10.00, 8.00, 'INR', 'IN', TRUE),
(NULL, 'TASK005', 'Install Amazon Shopping', 'Download Amazon shopping app', 'install', 'Amazon Shopping', 'https://play-lh.googleusercontent.com/example5', 'https://play.google.com/store/apps/details?id=in.amazon.mShop.android.shopping', 20.00, 16.00, 'INR', 'IN', TRUE);
