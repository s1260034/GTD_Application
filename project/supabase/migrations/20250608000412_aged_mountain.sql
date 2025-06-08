/*
  # Subscription and billing tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `stripe_subscription_id` (text, unique)
      - `stripe_customer_id` (text)
      - `status` (text)
      - `plan_type` (text)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `usage_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tasks_created_this_month` (integer)
      - `projects_created_this_month` (integer)
      - `month_year` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'free',
  plan_type text NOT NULL DEFAULT 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage_limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks_created_this_month integer DEFAULT 0,
  projects_created_this_month integer DEFAULT 0,
  month_year text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for usage_limits
CREATE POLICY "Users can view own usage limits"
  ON usage_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON usage_limits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON usage_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_month_year ON usage_limits(month_year);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize subscription for new users
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS trigger AS $$
BEGIN
  -- Create free subscription
  INSERT INTO subscriptions (user_id, status, plan_type)
  VALUES (NEW.id, 'free', 'free');
  
  -- Create initial usage limits
  INSERT INTO usage_limits (user_id, month_year)
  VALUES (NEW.id, to_char(now(), 'YYYY-MM'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_subscription();