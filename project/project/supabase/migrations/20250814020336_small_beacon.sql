/*
  # Create delete_user_data function

  1. New Functions
    - `delete_user_data(target_user_id uuid)`
      - Safely deletes all user-related data in correct order
      - Handles foreign key constraints properly
      - Only allows users to delete their own data or admin users

  2. Security
    - Function checks user permissions before deletion
    - Respects foreign key constraints by deleting in proper order
    - Returns success/failure status

  3. Tables affected (in deletion order)
    - task_tags (junction table)
    - tasks (has foreign keys to projects and users)
    - tags (user-specific tags)
    - projects (user projects)
    - usage_limits (user usage tracking)
    - stripe_subscriptions (user subscriptions)
    - stripe_customers (user payment info)
    - user_settings (user preferences)
    - profiles (user profile data)
*/

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  is_admin boolean := false;
  result json;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = current_user_id 
    AND is_active = true
  ) INTO is_admin;
  
  -- Only allow users to delete their own data or admin users
  IF current_user_id != target_user_id AND NOT is_admin THEN
    RAISE EXCEPTION 'Access denied: Can only delete your own data';
  END IF;
  
  -- Verify the target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Delete user data in correct order to respect foreign key constraints
  
  -- 1. Delete task_tags (junction table)
  DELETE FROM task_tags 
  WHERE task_id IN (
    SELECT id FROM tasks WHERE user_id = target_user_id
  );
  
  -- 2. Delete tasks
  DELETE FROM tasks WHERE user_id = target_user_id;
  
  -- 3. Delete tags
  DELETE FROM tags WHERE user_id = target_user_id;
  
  -- 4. Delete projects
  DELETE FROM projects WHERE user_id = target_user_id;
  
  -- 5. Delete usage limits
  DELETE FROM usage_limits WHERE user_id = target_user_id;
  
  -- 6. Delete stripe subscriptions
  DELETE FROM stripe_subscriptions 
  WHERE customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = target_user_id
  );
  
  -- 7. Delete stripe customers
  DELETE FROM stripe_customers WHERE user_id = target_user_id;
  
  -- 8. Delete user settings
  DELETE FROM user_settings WHERE user_id = target_user_id;
  
  -- 9. Delete profile (this should be last due to foreign key references)
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'User data deleted successfully',
    'user_id', target_user_id
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;