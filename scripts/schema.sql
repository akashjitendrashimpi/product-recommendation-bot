-- QrBot - Complete MySQL Schema
-- Run this script in phpMyAdmin or MySQL command line
-- This replaces all previous schema files

-- Create database (if needed)
-- CREATE DATABASE IF NOT EXISTS qrbot;
-- USE qrbot;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- PBKDF2 hash (salt:hash format, ~193 chars)
  display_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  upi_id VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255) NULL,
  email_verification_token_expires TIMESTAMP NULL,
  password_reset_token VARCHAR(255) NULL,
  password_reset_token_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_email_verification_token (email_verification_token),
  INDEX idx_password_reset_token (password_reset_token)
);

-- ============================================
-- PRODUCT RECOMMENDATION SYSTEM (System A)
-- ============================================

-- Categories for product categorization
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (admin-managed)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  description TEXT,
  amazon_link TEXT,
  flipkart_link TEXT,
  quality_score INT DEFAULT 5 CHECK (quality_score >= 1 AND quality_score <= 10),
  popularity_score INT DEFAULT 5 CHECK (popularity_score >= 1 AND popularity_score <= 10),
  user_id INT COMMENT 'Admin user who created this product',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category)
);

-- QR Campaigns table (admin-managed)
CREATE TABLE IF NOT EXISTS qr_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_code VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  scan_count INT DEFAULT 0,
  user_id INT COMMENT 'Admin user who created this campaign',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_campaign_code (campaign_code)
);

-- Chat sessions to track user interactions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT,
  session_data JSON DEFAULT '{}',
  recommended_products JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES qr_campaigns(id) ON DELETE SET NULL,
  INDEX idx_campaign_id (campaign_id)
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'If user is logged in',
  product_id INT NOT NULL,
  campaign_id INT NULL,
  click_type ENUM('amazon', 'flipkart', 'other') NOT NULL,
  affiliate_link TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES qr_campaigns(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_created_at (created_at)
);

-- Affiliate conversions (purchases)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  affiliate_click_id INT NOT NULL,
  user_id INT NULL,
  product_id INT NOT NULL,
  amount DECIMAL(10, 2),
  commission DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'paid') DEFAULT 'pending',
  conversion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_click_id) REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status)
);

-- ============================================
-- DAILY TASKS SYSTEM (System B)
-- ============================================

-- CPA Network API credentials (admin configuration)
CREATE TABLE IF NOT EXISTS cpa_networks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  user_id VARCHAR(255),
  country_filter VARCHAR(10) DEFAULT 'IN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Tasks table (sync from CPA networks or manual)
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  network_id INT,
  task_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  action_type ENUM('install', 'signup', 'time_spent', 'other') NOT NULL,
  app_name VARCHAR(255),
  app_icon_url TEXT,
  task_url TEXT NOT NULL,
  network_payout DECIMAL(10, 2) NOT NULL COMMENT 'What network pays us',
  user_payout DECIMAL(10, 2) NOT NULL COMMENT 'What we show/pay to user',
  currency VARCHAR(10) DEFAULT 'INR',
  country VARCHAR(10) DEFAULT 'IN',
  requirements TEXT COMMENT 'Any special requirements',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (network_id) REFERENCES cpa_networks(id) ON DELETE SET NULL,
  INDEX idx_network_id (network_id),
  INDEX idx_task_id (task_id),
  INDEX idx_action_type (action_type),
  INDEX idx_country (country),
  INDEX idx_is_active (is_active)
);

-- User task completions tracking
CREATE TABLE IF NOT EXISTS task_completions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  status ENUM('pending', 'completed', 'verified', 'rejected') DEFAULT 'pending',
  network_payout DECIMAL(10, 2) NOT NULL,
  user_payout DECIMAL(10, 2) NOT NULL,
  completion_proof TEXT COMMENT 'Screenshot or verification data',
  network_response JSON COMMENT 'Response from CPA network',
  completed_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_task (user_id, task_id) COMMENT 'Prevent duplicate completions',
  INDEX idx_user_id (user_id),
  INDEX idx_task_id (task_id),
  INDEX idx_status (status),
  INDEX idx_completed_at (completed_at)
);

-- User earnings tracking (aggregated)
CREATE TABLE IF NOT EXISTS user_earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  daily_earnings DECIMAL(10, 2) DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date)
);

-- Payment records (UPI payouts)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  upi_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  payment_reference VARCHAR(255) COMMENT 'UPI transaction ID',
  payment_date DATE NOT NULL COMMENT 'Date for which payment is made',
  error_message TEXT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date)
);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default categories
INSERT IGNORE INTO categories (name, description, icon) VALUES
  ('Daily-use items', 'Everyday essentials for home and office', 'home'),
  ('Electronics', 'Gadgets, devices, and tech accessories', 'smartphone'),
  ('Kitchen', 'Cooking and kitchen equipment', 'utensils'),
  ('Fashion', 'Clothing and accessories', 'shirt'),
  ('Health & Beauty', 'Personal care and wellness products', 'heart'),
  ('Sports & Fitness', 'Exercise and sports equipment', 'dumbbell');
