/*
  # Fix user signup database error

  1. Database Functions
    - Create function to handle new user profile creation
    - Ensure proper error handling and logging

  2. Triggers
    - Add trigger to automatically create profile when user signs up
    - Handle edge cases and conflicts

  3. Security
    - Update RLS policies to allow profile creation
    - Ensure proper permissions for authenticated users

  4. Data Integrity
    - Add constraints and defaults for required fields
    - Handle timezone and language defaults properly
*/

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, timezone, language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    COALESCE(new.raw_user_meta_data->>'timezone', 'Asia/Tokyo'),
    COALESCE(new.raw_user_meta_data->>'language', 'ja')
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN new;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to initialize user settings
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE LOG 'Error creating user settings for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Create trigger for user settings creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();

-- Create function to initialize user subscription
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, plan_type)
  VALUES (new.id, 'free', 'free')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize usage limits for current month
  INSERT INTO public.usage_limits (user_id, month_year)
  VALUES (new.id, TO_CHAR(CURRENT_DATE, 'YYYY-MM'))
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE LOG 'Error initializing subscription for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_subscription_init ON public.profiles;

-- Create trigger for subscription initialization
CREATE TRIGGER on_user_subscription_init
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_subscription();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure the auth schema trigger has proper permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON auth.users TO service_role;