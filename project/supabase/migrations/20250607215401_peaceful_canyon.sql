/*
  # Fix user signup trigger

  1. New Functions
    - `handle_new_user()` - Automatically creates a profile when a new user signs up
  
  2. New Triggers
    - Trigger on `auth.users` table to call `handle_new_user()` function
  
  3. Security
    - Ensures every new user gets a profile record automatically
    - Uses the user's metadata for initial profile setup
*/

-- Create the handle_new_user function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, timezone, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'Asia/Tokyo',
    'ja'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Also create user_settings record for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the user_settings trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created_settings'
  ) THEN
    CREATE TRIGGER on_auth_user_created_settings
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();
  END IF;
END $$;