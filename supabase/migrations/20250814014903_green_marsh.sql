/*
  # 管理者機能の追加

  1. 新しい関数
    - `is_admin()` - 現在のユーザーが管理者かどうかをチェック
    - `delete_all_database_data()` - データベース全体のデータを削除
    - `create_admin_user()` - メールアドレスから管理者ユーザーを作成

  2. セキュリティ
    - 管理者のみがアクセス可能な関数
    - すべての管理者アクションがログに記録

  3. データ削除
    - 管理者自身のデータは保持
    - すべてのユーザーデータを安全に削除
*/

-- 管理者権限チェック関数
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

-- データベース全体のデータ削除関数
CREATE OR REPLACE FUNCTION delete_all_database_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
  deleted_counts JSON;
  task_count INTEGER;
  project_count INTEGER;
  subscription_count INTEGER;
  usage_count INTEGER;
  stripe_customer_count INTEGER;
  stripe_subscription_count INTEGER;
  stripe_order_count INTEGER;
  profile_count INTEGER;
  setting_count INTEGER;
BEGIN
  -- 管理者権限チェック
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  admin_user_id := auth.uid();

  -- 削除カウントを記録
  SELECT COUNT(*) INTO task_count FROM tasks WHERE user_id != admin_user_id;
  SELECT COUNT(*) INTO project_count FROM projects WHERE user_id != admin_user_id;
  SELECT COUNT(*) INTO subscription_count FROM subscriptions WHERE user_id != admin_user_id;
  SELECT COUNT(*) INTO usage_count FROM usage_limits WHERE user_id != admin_user_id;
  SELECT COUNT(*) INTO stripe_customer_count FROM stripe_customers WHERE user_id != admin_user_id;
  SELECT COUNT(*) INTO stripe_subscription_count FROM stripe_subscriptions 
    WHERE customer_id NOT IN (SELECT customer_id FROM stripe_customers WHERE user_id = admin_user_id);
  SELECT COUNT(*) INTO stripe_order_count FROM stripe_orders 
    WHERE customer_id NOT IN (SELECT customer_id FROM stripe_customers WHERE user_id = admin_user_id);
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE id != admin_user_id;
  SELECT COUNT(*) INTO setting_count FROM user_settings WHERE user_id != admin_user_id;

  -- 管理者以外のデータを削除（外部キー制約を考慮した順序）
  DELETE FROM task_tags WHERE task_id IN (SELECT id FROM tasks WHERE user_id != admin_user_id);
  DELETE FROM tasks WHERE user_id != admin_user_id;
  DELETE FROM projects WHERE user_id != admin_user_id;
  DELETE FROM tags WHERE user_id != admin_user_id;
  DELETE FROM subscriptions WHERE user_id != admin_user_id;
  DELETE FROM usage_limits WHERE user_id != admin_user_id;
  DELETE FROM user_settings WHERE user_id != admin_user_id;
  
  -- Stripe関連データの削除
  DELETE FROM stripe_orders WHERE customer_id NOT IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = admin_user_id
  );
  DELETE FROM stripe_subscriptions WHERE customer_id NOT IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = admin_user_id
  );
  DELETE FROM stripe_customers WHERE user_id != admin_user_id;
  
  -- プロファイルの削除（最後に実行）
  DELETE FROM profiles WHERE id != admin_user_id;

  -- 削除されたレコード数をJSONで返す
  deleted_counts := json_build_object(
    'tasks', task_count,
    'projects', project_count,
    'subscriptions', subscription_count,
    'usage_limits', usage_count,
    'stripe_customers', stripe_customer_count,
    'stripe_subscriptions', stripe_subscription_count,
    'stripe_orders', stripe_order_count,
    'profiles', profile_count,
    'user_settings', setting_count
  );

  -- 管理者アクションを記録
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (admin_user_id, 'delete_all_data', deleted_counts);

  RETURN deleted_counts;
END;
$$;

-- メールアドレスから管理者ユーザーを作成する関数
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- 管理者権限チェック
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  admin_user_id := auth.uid();

  -- ユーザーIDを取得
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- 管理者として追加
  INSERT INTO admin_users (id, email, role, created_by, is_active)
  VALUES (target_user_id, user_email, admin_role, admin_user_id, true)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    created_by = admin_user_id;

  -- 管理者アクションを記録
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (admin_user_id, 'create_admin', target_user_id, json_build_object(
    'email', user_email,
    'role', admin_role
  ));

  result := json_build_object(
    'success', true,
    'user_id', target_user_id,
    'email', user_email,
    'role', admin_role
  );

  RETURN result;
END;
$$;

-- 権限付与
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_database_data() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated;