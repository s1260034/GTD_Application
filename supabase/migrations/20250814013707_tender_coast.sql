/*
  # 管理者アカウントシステム

  1. 新しいテーブル
    - `admin_users` - 管理者ユーザー管理
    - `admin_actions` - 管理者アクション履歴

  2. セキュリティ
    - 管理者専用のRLSポリシー
    - データ削除権限の制限

  3. 機能
    - 全データベースデータの削除機能
    - 管理者アクションの監査ログ
*/

-- 管理者ユーザーテーブル
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- 管理者アクション履歴テーブル
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('delete_all_data', 'delete_user_data', 'create_admin', 'deactivate_admin')),
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "Only admins can view admin users" ON admin_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Only super admins can modify admin users" ON admin_users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

CREATE POLICY "Only admins can view admin actions" ON admin_actions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Only admins can insert admin actions" ON admin_actions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

-- 管理者チェック関数
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 全データ削除関数（管理者専用）
CREATE OR REPLACE FUNCTION delete_all_database_data()
RETURNS JSONB AS $$
DECLARE
    admin_id UUID := auth.uid();
    deleted_counts JSONB := '{}';
    table_count INTEGER;
BEGIN
    -- 管理者権限チェック
    IF NOT is_admin(admin_id) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- 削除前のカウント記録と削除実行
    
    -- task_tags（外部キー制約のため最初に削除）
    SELECT COUNT(*) INTO table_count FROM task_tags;
    deleted_counts := jsonb_set(deleted_counts, '{task_tags}', to_jsonb(table_count));
    DELETE FROM task_tags;
    
    -- tasks
    SELECT COUNT(*) INTO table_count FROM tasks;
    deleted_counts := jsonb_set(deleted_counts, '{tasks}', to_jsonb(table_count));
    DELETE FROM tasks;
    
    -- projects
    SELECT COUNT(*) INTO table_count FROM projects;
    deleted_counts := jsonb_set(deleted_counts, '{projects}', to_jsonb(table_count));
    DELETE FROM projects;
    
    -- tags
    SELECT COUNT(*) INTO table_count FROM tags;
    deleted_counts := jsonb_set(deleted_counts, '{tags}', to_jsonb(table_count));
    DELETE FROM tags;
    
    -- usage_limits
    SELECT COUNT(*) INTO table_count FROM usage_limits;
    deleted_counts := jsonb_set(deleted_counts, '{usage_limits}', to_jsonb(table_count));
    DELETE FROM usage_limits;
    
    -- subscriptions
    SELECT COUNT(*) INTO table_count FROM subscriptions;
    deleted_counts := jsonb_set(deleted_counts, '{subscriptions}', to_jsonb(table_count));
    DELETE FROM subscriptions;
    
    -- user_settings
    SELECT COUNT(*) INTO table_count FROM user_settings;
    deleted_counts := jsonb_set(deleted_counts, '{user_settings}', to_jsonb(table_count));
    DELETE FROM user_settings;
    
    -- stripe_orders
    SELECT COUNT(*) INTO table_count FROM stripe_orders;
    deleted_counts := jsonb_set(deleted_counts, '{stripe_orders}', to_jsonb(table_count));
    DELETE FROM stripe_orders;
    
    -- stripe_subscriptions
    SELECT COUNT(*) INTO table_count FROM stripe_subscriptions;
    deleted_counts := jsonb_set(deleted_counts, '{stripe_subscriptions}', to_jsonb(table_count));
    DELETE FROM stripe_subscriptions;
    
    -- stripe_customers
    SELECT COUNT(*) INTO table_count FROM stripe_customers;
    deleted_counts := jsonb_set(deleted_counts, '{stripe_customers}', to_jsonb(table_count));
    DELETE FROM stripe_customers;
    
    -- profiles（管理者以外）
    SELECT COUNT(*) INTO table_count FROM profiles WHERE id NOT IN (SELECT id FROM admin_users WHERE is_active = true);
    deleted_counts := jsonb_set(deleted_counts, '{profiles}', to_jsonb(table_count));
    DELETE FROM profiles WHERE id NOT IN (SELECT id FROM admin_users WHERE is_active = true);

    -- 管理者アクション記録
    INSERT INTO admin_actions (admin_id, action_type, details)
    VALUES (admin_id, 'delete_all_data', jsonb_build_object('deleted_counts', deleted_counts));

    RETURN jsonb_build_object(
        'success', true,
        'message', 'All database data deleted successfully',
        'deleted_counts', deleted_counts,
        'executed_by', admin_id,
        'executed_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 特定ユーザーのデータ削除関数
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    admin_id UUID := auth.uid();
    deleted_counts JSONB := '{}';
    table_count INTEGER;
BEGIN
    -- 管理者権限チェック
    IF NOT is_admin(admin_id) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- 管理者自身のデータは削除不可
    IF target_user_id IN (SELECT id FROM admin_users WHERE is_active = true) THEN
        RAISE EXCEPTION 'Cannot delete admin user data';
    END IF;

    -- 削除前のカウント記録と削除実行
    
    -- task_tags
    SELECT COUNT(*) INTO table_count FROM task_tags tt 
    JOIN tasks t ON tt.task_id = t.id 
    WHERE t.user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{task_tags}', to_jsonb(table_count));
    DELETE FROM task_tags WHERE task_id IN (SELECT id FROM tasks WHERE user_id = target_user_id);
    
    -- tasks
    SELECT COUNT(*) INTO table_count FROM tasks WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{tasks}', to_jsonb(table_count));
    DELETE FROM tasks WHERE user_id = target_user_id;
    
    -- projects
    SELECT COUNT(*) INTO table_count FROM projects WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{projects}', to_jsonb(table_count));
    DELETE FROM projects WHERE user_id = target_user_id;
    
    -- tags
    SELECT COUNT(*) INTO table_count FROM tags WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{tags}', to_jsonb(table_count));
    DELETE FROM tags WHERE user_id = target_user_id;
    
    -- usage_limits
    SELECT COUNT(*) INTO table_count FROM usage_limits WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{usage_limits}', to_jsonb(table_count));
    DELETE FROM usage_limits WHERE user_id = target_user_id;
    
    -- subscriptions
    SELECT COUNT(*) INTO table_count FROM subscriptions WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{subscriptions}', to_jsonb(table_count));
    DELETE FROM subscriptions WHERE user_id = target_user_id;
    
    -- user_settings
    SELECT COUNT(*) INTO table_count FROM user_settings WHERE user_id = target_user_id;
    deleted_counts := jsonb_set(deleted_counts, '{user_settings}', to_jsonb(table_count));
    DELETE FROM user_settings WHERE user_id = target_user_id;
    
    -- stripe関連データ
    DELETE FROM stripe_subscriptions WHERE customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = target_user_id);
    DELETE FROM stripe_orders WHERE customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = target_user_id);
    DELETE FROM stripe_customers WHERE user_id = target_user_id;
    
    -- profiles
    DELETE FROM profiles WHERE id = target_user_id;

    -- 管理者アクション記録
    INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
    VALUES (admin_id, 'delete_user_data', target_user_id, jsonb_build_object('deleted_counts', deleted_counts));

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User data deleted successfully',
        'deleted_counts', deleted_counts,
        'target_user_id', target_user_id,
        'executed_by', admin_id,
        'executed_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者作成関数
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS JSONB AS $$
DECLARE
    admin_id UUID := auth.uid();
    target_user_id UUID;
BEGIN
    -- 管理者権限チェック（super_adminのみ新しい管理者を作成可能）
    IF NOT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = admin_id AND role = 'super_admin' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Super admin privileges required';
    END IF;

    -- ユーザーIDを取得
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- 管理者として追加
    INSERT INTO admin_users (id, email, role, created_by)
    VALUES (target_user_id, user_email, admin_role, admin_id)
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = true,
        created_by = EXCLUDED.created_by;

    -- 管理者アクション記録
    INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
    VALUES (admin_id, 'create_admin', target_user_id, jsonb_build_object('role', admin_role, 'email', user_email));

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Admin user created successfully',
        'user_id', target_user_id,
        'email', user_email,
        'role', admin_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);