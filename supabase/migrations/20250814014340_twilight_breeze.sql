/*
  # 管理者作成機能の追加

  1. 新しい関数
    - `is_admin()` - 現在のユーザーが管理者かチェック
    - `create_admin_user()` - メールアドレスで管理者を作成
    - `delete_all_database_data()` - 全データ削除（管理者のみ）

  2. セキュリティ
    - 管理者のみが実行可能な関数
    - 管理者アクションの履歴記録
*/

-- 現在のユーザーが管理者かチェックする関数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メールアドレスで管理者ユーザーを作成する関数
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS JSON AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  -- 管理者権限チェック
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- メールアドレスからユーザーIDを取得
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- 既に管理者かチェック
  IF EXISTS (SELECT 1 FROM admin_users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User % is already an admin', user_email;
  END IF;

  -- 管理者として追加
  INSERT INTO admin_users (id, email, role, created_by, is_active)
  VALUES (target_user_id, user_email, admin_role, auth.uid(), true);

  -- アクション履歴に記録
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    auth.uid(), 
    'create_admin', 
    target_user_id,
    json_build_object('email', user_email, 'role', admin_role)
  );

  result := json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'user_id', target_user_id,
    'email', user_email,
    'role', admin_role
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 全データベースデータを削除する関数
CREATE OR REPLACE FUNCTION delete_all_database_data()
RETURNS JSON AS $$
DECLARE
  deleted_counts JSON;
  admin_count INTEGER;
BEGIN
  -- 管理者権限チェック
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- 管理者の数をチェック（最低1人は残す）
  SELECT COUNT(*) INTO admin_count FROM admin_users WHERE is_active = true;
  
  IF admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot delete all data: At least one admin must remain active';
  END IF;

  -- データ削除（外部キー制約の順序に注意）
  WITH deletion_results AS (
    SELECT 
      (SELECT COUNT(*) FROM task_tags) as task_tags_count,
      (SELECT COUNT(*) FROM tasks WHERE user_id != auth.uid()) as tasks_count,
      (SELECT COUNT(*) FROM projects WHERE user_id != auth.uid()) as projects_count,
      (SELECT COUNT(*) FROM tags WHERE user_id != auth.uid()) as tags_count,
      (SELECT COUNT(*) FROM usage_limits WHERE user_id != auth.uid()) as usage_limits_count,
      (SELECT COUNT(*) FROM subscriptions WHERE user_id != auth.uid()) as subscriptions_count,
      (SELECT COUNT(*) FROM user_settings WHERE user_id != auth.uid()) as user_settings_count,
      (SELECT COUNT(*) FROM profiles WHERE id != auth.uid()) as profiles_count,
      (SELECT COUNT(*) FROM stripe_orders) as stripe_orders_count,
      (SELECT COUNT(*) FROM stripe_subscriptions) as stripe_subscriptions_count,
      (SELECT COUNT(*) FROM stripe_customers WHERE user_id != auth.uid()) as stripe_customers_count
  )
  SELECT json_build_object(
    'task_tags', task_tags_count,
    'tasks', tasks_count,
    'projects', projects_count,
    'tags', tags_count,
    'usage_limits', usage_limits_count,
    'subscriptions', subscriptions_count,
    'user_settings', user_settings_count,
    'profiles', profiles_count,
    'stripe_orders', stripe_orders_count,
    'stripe_subscriptions', stripe_subscriptions_count,
    'stripe_customers', stripe_customers_count
  ) INTO deleted_counts FROM deletion_results;

  -- 実際の削除実行（管理者自身のデータは保持）
  DELETE FROM task_tags WHERE task_id IN (
    SELECT id FROM tasks WHERE user_id != auth.uid()
  );
  
  DELETE FROM tasks WHERE user_id != auth.uid();
  DELETE FROM projects WHERE user_id != auth.uid();
  DELETE FROM tags WHERE user_id != auth.uid();
  DELETE FROM usage_limits WHERE user_id != auth.uid();
  DELETE FROM subscriptions WHERE user_id != auth.uid();
  DELETE FROM user_settings WHERE user_id != auth.uid();
  DELETE FROM stripe_orders;
  DELETE FROM stripe_subscriptions;
  DELETE FROM stripe_customers WHERE user_id != auth.uid();
  DELETE FROM profiles WHERE id != auth.uid();

  -- 管理者以外のユーザーを削除
  DELETE FROM auth.users WHERE id != auth.uid() AND id NOT IN (
    SELECT id FROM admin_users WHERE is_active = true
  );

  -- アクション履歴に記録
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
    auth.uid(), 
    'delete_all_data',
    json_build_object('deleted_counts', deleted_counts, 'timestamp', NOW())
  );

  RETURN json_build_object(
    'success', true,
    'message', 'All database data deleted successfully',
    'deleted_counts', deleted_counts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 権限付与
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_database_data() TO authenticated;