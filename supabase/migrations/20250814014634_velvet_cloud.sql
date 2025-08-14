/*
  # Fix admin panel access

  1. New Functions
    - `is_admin()` - Check if current user is an admin
    - `delete_all_database_data()` - Delete all user data except admins
    - `create_admin_user()` - Create new admin user by email
  
  2. Security
    - Only admins can access admin functions
    - Admin actions are logged
    - Super admins can manage other admins
*/

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$;

-- Function to delete all database data (except admin users)
CREATE OR REPLACE FUNCTION delete_all_database_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID := auth.uid();
  deleted_counts JSON;
  task_count INTEGER;
  project_count INTEGER;
  subscription_count INTEGER;
  usage_count INTEGER;
  stripe_customer_count INTEGER;
  stripe_subscription_count INTEGER;
  stripe_order_count INTEGER;
  profile_count INTEGER;
  settings_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Count records before deletion
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO project_count FROM projects;
  SELECT COUNT(*) INTO subscription_count FROM subscriptions;
  SELECT COUNT(*) INTO usage_count FROM usage_limits;
  SELECT COUNT(*) INTO stripe_customer_count FROM stripe_customers;
  SELECT COUNT(*) INTO stripe_subscription_count FROM stripe_subscriptions;
  SELECT COUNT(*) INTO stripe_order_count FROM stripe_orders;
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  SELECT COUNT(*) INTO settings_count FROM user_settings WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);

  -- Delete all data (except admin users and their data)
  DELETE FROM task_tags WHERE task_id IN (
    SELECT t.id FROM tasks t 
    JOIN profiles p ON t.user_id = p.id 
    WHERE p.id NOT IN (SELECT id FROM admin_users WHERE is_active = true)
  );
  
  DELETE FROM tasks WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  DELETE FROM projects WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  DELETE FROM tags WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  DELETE FROM subscriptions WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  DELETE FROM usage_limits WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  DELETE FROM user_settings WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  
  -- Delete Stripe data for non-admin users
  DELETE FROM stripe_orders WHERE customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true)
  );
  
  DELETE FROM stripe_subscriptions WHERE customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true)
  );
  
  DELETE FROM stripe_customers WHERE user_id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
  
  -- Delete profiles (this will cascade to auth.users)
  DELETE FROM profiles WHERE id NOT IN (SELECT id FROM admin_users WHERE is_active = true);

  -- Log the admin action
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
    admin_id,
    'delete_all_data',
    json_build_object(
      'deleted_counts', json_build_object(
        'tasks', task_count,
        'projects', project_count,
        'subscriptions', subscription_count,
        'usage_limits', usage_count,
        'stripe_customers', stripe_customer_count,
        'stripe_subscriptions', stripe_subscription_count,
        'stripe_orders', stripe_order_count,
        'profiles', profile_count,
        'user_settings', settings_count
      )
    )
  );

  -- Return deletion summary
  SELECT json_build_object(
    'deleted_counts', json_build_object(
      'tasks', task_count,
      'projects', project_count,
      'subscriptions', subscription_count,
      'usage_limits', usage_count,
      'stripe_customers', stripe_customer_count,
      'stripe_subscriptions', stripe_subscription_count,
      'stripe_orders', stripe_order_count,
      'profiles', profile_count,
      'user_settings', settings_count
    )
  ) INTO deleted_counts;

  RETURN deleted_counts;
END;
$$;

-- Function to create admin user by email
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  admin_id UUID := auth.uid();
  result JSON;
BEGIN
  -- Check if current user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Check if user is already an admin
  IF EXISTS (SELECT 1 FROM admin_users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User % is already an admin', user_email;
  END IF;

  -- Create admin user
  INSERT INTO admin_users (id, email, role, created_by, is_active)
  VALUES (target_user_id, user_email, admin_role, admin_id, true);

  -- Log the action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    admin_id,
    'create_admin',
    target_user_id,
    json_build_object(
      'email', user_email,
      'role', admin_role
    )
  );

  SELECT json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'user_id', target_user_id,
    'email', user_email,
    'role', admin_role
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_database_data() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated;