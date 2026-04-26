-- Qyantra - Complete PostgreSQL Schema (Supabase Compatible)
-- Run this script in the Supabase SQL Editor

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  upi_id TEXT NULL,
  phone TEXT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT NULL,
  email_verification_token_expires TIMESTAMP WITH TIME ZONE NULL,
  password_reset_token TEXT NULL,
  password_reset_token_expires TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users (email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users (password_reset_token);

-- ============================================
-- PRODUCT RECOMMENDATION SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure missing columns exist in categories if table was created earlier
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='description') THEN
    ALTER TABLE categories ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='icon') THEN
    ALTER TABLE categories ADD COLUMN icon TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  description TEXT,
  amazon_link TEXT,
  flipkart_link TEXT,
  quality_score INT DEFAULT 5 CHECK (quality_score >= 1 AND quality_score <= 10),
  popularity_score INT DEFAULT 5 CHECK (popularity_score >= 1 AND popularity_score <= 10),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products (user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

CREATE TABLE IF NOT EXISTS qr_campaigns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_code TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  scan_count INT DEFAULT 0,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qr_campaigns_user_id ON qr_campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_qr_campaigns_campaign_code ON qr_campaigns (campaign_code);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_id BIGINT REFERENCES qr_campaigns(id) ON DELETE SET NULL,
  session_data JSONB DEFAULT '{}',
  recommended_products JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_campaign_id ON chat_sessions (campaign_id);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  campaign_id BIGINT REFERENCES qr_campaigns(id) ON DELETE SET NULL,
  click_type TEXT CHECK (click_type IN ('amazon', 'flipkart', 'other')) NOT NULL,
  affiliate_link TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON affiliate_clicks (user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_id ON affiliate_clicks (product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_campaign_id ON affiliate_clicks (campaign_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks (created_at);

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  affiliate_click_id BIGINT REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  commission DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
  conversion_date TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_user_id ON affiliate_conversions (user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_product_id ON affiliate_conversions (product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON affiliate_conversions (status);

-- ============================================
-- DAILY TASKS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS cpa_networks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  api_secret TEXT,
  user_id TEXT,
  country_filter TEXT DEFAULT 'IN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cpa_networks_name ON cpa_networks (name);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  network_id BIGINT REFERENCES cpa_networks(id) ON DELETE SET NULL,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT CHECK (action_type IN ('install', 'signup', 'time_spent', 'other')) NOT NULL,
  app_name TEXT,
  app_icon_url TEXT,
  task_url TEXT NOT NULL,
  network_payout DECIMAL(10, 2) NOT NULL,
  user_payout DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  country TEXT DEFAULT 'IN',
  requirements TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_network_id ON tasks (network_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_id ON tasks (task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_action_type ON tasks (action_type);
CREATE INDEX IF NOT EXISTS idx_tasks_country ON tasks (country);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks (is_active);

CREATE TABLE IF NOT EXISTS task_completions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified', 'rejected', 'pending_verification')),
  network_payout DECIMAL(10, 2) NOT NULL,
  user_payout DECIMAL(10, 2) NOT NULL,
  completion_proof TEXT,
  network_response JSONB,
  proof_hash TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  verified_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, task_id)
);

-- Ensure proof_hash column exists if table was created earlier
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='task_completions' AND column_name='proof_hash') THEN
    ALTER TABLE task_completions ADD COLUMN proof_hash TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions (user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions (task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON task_completions (status);
CREATE INDEX IF NOT EXISTS idx_task_completions_proof_hash ON task_completions (proof_hash);
CREATE INDEX IF NOT EXISTS idx_task_completions_completed_at ON task_completions (completed_at);

CREATE TABLE IF NOT EXISTS user_earnings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_earnings DECIMAL(10, 2) DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, date)
);

-- Ensure missing columns exist in user_earnings if table was created earlier
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_earnings' AND column_name='amount') THEN
    ALTER TABLE user_earnings ADD COLUMN amount DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_earnings_user_id ON user_earnings (user_id);
CREATE INDEX IF NOT EXISTS idx_user_earnings_date ON user_earnings (date);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  upi_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_reference TEXT,
  payment_date DATE NOT NULL,
  error_message TEXT,
  completion_id BIGINT,
  description TEXT,
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure missing columns exist in payments if table was created earlier
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='completion_id') THEN
    ALTER TABLE payments ADD COLUMN completion_id BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='description') THEN
    ALTER TABLE payments ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='payment_date') THEN
    ALTER TABLE payments ADD COLUMN payment_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments (payment_date);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);

-- ============================================
-- BLOG SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT NULL,
  author TEXT DEFAULT 'Qyantra Team',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  reading_time INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);

CREATE OR REPLACE FUNCTION increment_blog_views(post_slug TEXT)
RETURNS void AS $$
  UPDATE blog_posts SET views = views + 1 WHERE slug = post_slug;
$$ LANGUAGE SQL;

-- ============================================
-- PUSH NOTIFICATIONS & SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions (user_id);

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

-- ============================================
-- SECTIONS & CUSTOM LAYOUTS
-- ============================================

CREATE TABLE IF NOT EXISTS sections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS section_products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_id BIGINT REFERENCES sections(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(section_id, product_id)
);

-- ============================================
-- ADDITIONAL REPAIRS (MISSING COLUMNS)
-- ============================================

DO $$ 
BEGIN 
  -- Users repairs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_banned') THEN
    ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='ban_reason') THEN
    ALTER TABLE users ADD COLUMN ban_reason TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code') THEN
    ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referred_by') THEN
    ALTER TABLE users ADD COLUMN referred_by BIGINT REFERENCES users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_earnings') THEN
    ALTER TABLE users ADD COLUMN referral_earnings DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Tasks repairs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='has_detail_page') THEN
    ALTER TABLE tasks ADD COLUMN has_detail_page BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='how_to_steps') THEN
    ALTER TABLE tasks ADD COLUMN how_to_steps JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='copy_prompts') THEN
    ALTER TABLE tasks ADD COLUMN copy_prompts JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='sort_order') THEN
    ALTER TABLE tasks ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='max_completions') THEN
    ALTER TABLE tasks ADD COLUMN max_completions INTEGER DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='requires_proof') THEN
    ALTER TABLE tasks ADD COLUMN requires_proof BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='proof_instructions') THEN
    ALTER TABLE tasks ADD COLUMN proof_instructions TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='country_code') THEN
    ALTER TABLE tasks ADD COLUMN country_code TEXT DEFAULT 'IN';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='reward') THEN
    ALTER TABLE tasks ADD COLUMN reward DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- CLICK TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS task_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_clicks_task_id ON task_clicks (task_id);
CREATE INDEX IF NOT EXISTS idx_task_clicks_user_id ON task_clicks (user_id);

-- ============================================
-- DEFAULT CATEGORIES DATA
-- ============================================

INSERT INTO categories (name, description, icon) VALUES
  ('Daily-use items', 'Everyday essentials for home and office', 'home'),
  ('Electronics', 'Gadgets, devices, and tech accessories', 'smartphone'),
  ('Kitchen', 'Cooking and kitchen equipment', 'utensils'),
  ('Fashion', 'Clothing and accessories', 'shirt'),
  ('Health & Beauty', 'Personal care and wellness products', 'heart'),
  ('Sports & Fitness', 'Exercise and sports equipment', 'dumbbell')
ON CONFLICT (name) DO NOTHING;
