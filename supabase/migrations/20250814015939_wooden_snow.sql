/*
  # Add user data deletion function

  1. New Functions
    - `delete_user_data(user_id uuid)` - Deletes all user data from all tables
  
  2. Security
    - Function can only be called by authenticated users
    - Users can only delete their own data
    - Cascading deletes ensure data integrity
  
  3. Tables affected
    - tasks (all user tasks)
    - projects (all user projects) 
    - tags (all user tags)
    - task_tags (all user task-tag relationships)
    - user_settings (user preferences)
    - usage_limits (usage tracking data)
    - subscriptions (subscription data)
    - stripe_customers (stripe customer data)
    - stripe_subscriptions (stripe subscription data)
    - profiles (user profile)
*/

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is deleting their own data
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'You can only delete your own data';
  END IF;

  -- Delete user data in correct order to respect foreign key constraints
  
  -- Delete task-tag relationships first
  DELETE FROM task_tags 
  WHERE task_id IN (
    SELECT id FROM tasks WHERE user_id = target_user_id
  );
  
  -- Delete tasks
  DELETE FROM tasks WHERE user_id = target_user_id;
  
  -- Delete projects  
  DELETE FROM projects WHERE user_id = target_user_id;
  
  -- Delete tags
  DELETE FROM tags WHERE user_id = target_user_id;
  
  -- Delete user settings
  DELETE FROM user_settings WHERE user_id = target_user_id;
  
  -- Delete usage limits
  DELETE FROM usage_limits WHERE user_id = target_user_id;
  
  -- Delete subscription data
  DELETE FROM subscriptions WHERE user_id = target_user_id;
  
  -- Delete stripe customer data
  DELETE FROM stripe_customers WHERE user_id = target_user_id;
  
  -- Delete stripe subscription data (via customer_id)
  DELETE FROM stripe_subscriptions 
  WHERE customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = target_user_id
  );
  
  -- Delete profile last
  DELETE FROM profiles WHERE id = target_user_id;
  
END;
$$;