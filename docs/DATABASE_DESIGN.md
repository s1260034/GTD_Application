# データベース設計書（詳細版）

## 概要

Focus Flow GTDタスク管理アプリケーションのPostgreSQLデータベース設計について詳細に説明します。

## 設計原則

### 1. 正規化
- 第3正規形（3NF）まで正規化
- データの重複を最小化
- 更新異常の防止

### 2. セキュリティ
- Row Level Security (RLS) による多テナント対応
- 最小権限の原則
- 監査ログの記録

### 3. パフォーマンス
- 適切なインデックス設計
- クエリ最適化
- 効率的なデータアクセスパターン

### 4. 拡張性
- 将来の機能追加に対応
- スケーラブルな設計
- マイグレーション対応

## テーブル設計詳細

### 1. users テーブル（Supabase Auth管理）

**目的**: ユーザー認証情報の管理

```sql
-- Supabase Authが自動管理
-- 直接操作は行わない
```

**関連テーブル**: `profiles`, `tasks`, `projects`

### 2. profiles テーブル

**目的**: ユーザープロファイル情報の管理

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name varchar(100),
  timezone varchar(50) DEFAULT 'Asia/Tokyo',
  language varchar(10) DEFAULT 'ja',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**設計決定**:
- `id`: users.idと同じUUIDを使用（1:1関係）
- `display_name`: 表示名（NULL許可）
- `timezone`: タイムゾーン設定
- `language`: 言語設定（将来の国際化対応）

**インデックス**:
```sql
CREATE INDEX idx_profiles_user_id ON profiles(id);
```

**RLSポリシー**:
```sql
-- ユーザーは自分のプロファイルのみアクセス可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO public USING (uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO public USING (uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO public WITH CHECK (uid() = id);
```

### 3. tasks テーブル

**目的**: GTDタスクの管理

```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL,
  description text,
  status varchar(20) NOT NULL DEFAULT 'inbox',
  priority integer DEFAULT 0,
  time_estimate integer, -- 分単位
  energy_level varchar(10),
  context varchar(50),
  assigned_to varchar(100),
  due_date date,
  scheduled_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  deleted_at timestamptz,
  
  CONSTRAINT tasks_status_check CHECK (
    status IN ('inbox', 'next', 'waiting', 'scheduled', 'project', 'someday', 'completed', 'deleted', 'reference')
  ),
  CONSTRAINT tasks_priority_check CHECK (priority >= 0 AND priority <= 5),
  CONSTRAINT tasks_energy_level_check CHECK (
    energy_level IN ('low', 'medium', 'high')
  )
);
```

**設計決定**:
- `status`: GTDの各ステータスを文字列で管理
- `priority`: 0-5の数値（0=なし、5=最重要）
- `time_estimate`: 分単位の時間見積もり
- `energy_level`: 実行に必要なエネルギーレベル
- `context`: GTDのコンテキスト（@home, @office等）
- `due_date` vs `scheduled_date`: 期限と実行予定日を分離
- 論理削除: `deleted_at`で削除フラグ管理

**インデックス**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### 4. projects テーブル

**目的**: GTDプロジェクトの管理

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  status varchar(20) DEFAULT 'active',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  archived_at timestamptz,
  
  CONSTRAINT projects_status_check CHECK (
    status IN ('active', 'completed', 'archived')
  ),
  CONSTRAINT projects_progress_check CHECK (progress >= 0 AND progress <= 100)
);
```

**設計決定**:
- `progress`: 0-100の進捗率
- `status`: アクティブ、完了、アーカイブ
- 論理削除: `archived_at`でアーカイブ管理

### 5. tags テーブル

**目的**: タスクの分類用タグ管理

```sql
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(50) NOT NULL,
  color varchar(7) DEFAULT '#6B7280', -- HEXカラーコード
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, name) -- ユーザー内でタグ名は一意
);
```

### 6. task_tags テーブル（多対多関係）

**目的**: タスクとタグの関連付け

```sql
CREATE TABLE task_tags (
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

### 7. usage_limits テーブル

**目的**: 月次使用量制限の管理

```sql
CREATE TABLE usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tasks_created_this_month integer DEFAULT 0,
  projects_created_this_month integer DEFAULT 0,
  month_year text NOT NULL, -- 'YYYY-MM' 形式
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, month_year)
);
```

**設計決定**:
- `month_year`: 年月を文字列で管理（インデックス効率化）
- 月次リセット: 新月になったら新レコード作成

### 8. user_settings テーブル

**目的**: ユーザー個別設定の管理

```sql
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme varchar(10) DEFAULT 'light',
  default_context varchar(50),
  work_hours_start time DEFAULT '09:00',
  work_hours_end time DEFAULT '17:00',
  notification_email boolean DEFAULT true,
  notification_push boolean DEFAULT true,
  auto_move_today_tasks boolean DEFAULT true,
  weekly_review_day integer DEFAULT 0, -- 0=日曜日
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT user_settings_theme_check CHECK (
    theme IN ('light', 'dark', 'auto')
  ),
  CONSTRAINT user_settings_weekly_review_day_check CHECK (
    weekly_review_day >= 0 AND weekly_review_day <= 6
  )
);
```

## Stripe連携テーブル

### 1. stripe_customers テーブル

**目的**: SupabaseユーザーとStripe顧客の関連付け

```sql
CREATE TABLE stripe_customers (
  id bigint PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES users(id),
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

### 2. stripe_subscriptions テーブル

**目的**: Stripeサブスクリプション情報の管理

```sql
CREATE TYPE stripe_subscription_status AS ENUM (
  'not_started', 'incomplete', 'incomplete_expired', 'trialing',
  'active', 'past_due', 'canceled', 'unpaid', 'paused'
);

CREATE TABLE stripe_subscriptions (
  id bigint PRIMARY KEY,
  customer_id text NOT NULL UNIQUE,
  subscription_id text UNIQUE,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

### 3. stripe_orders テーブル

**目的**: 一回限りの決済記録

```sql
CREATE TYPE stripe_order_status AS ENUM ('pending', 'completed', 'canceled');

CREATE TABLE stripe_orders (
  id bigint PRIMARY KEY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

## ビュー設計

### 1. task_statistics ビュー

**目的**: ユーザー別タスク統計の提供

```sql
CREATE VIEW task_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'inbox') as inbox_count,
  COUNT(*) FILTER (WHERE status = 'next') as next_count,
  COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'someday') as someday_count,
  COUNT(*) FILTER (WHERE status = 'reference') as reference_count,
  COUNT(*) FILTER (WHERE status = 'deleted') as deleted_count
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY user_id;
```

### 2. todays_tasks ビュー

**目的**: 今日実行すべきタスクの抽出

```sql
CREATE VIEW todays_tasks AS
SELECT 
  t.*,
  p.title as project_title
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE 
  t.deleted_at IS NULL
  AND (
    (t.status = 'scheduled' AND t.scheduled_date = CURRENT_DATE)
    OR (t.status = 'next')
    OR (t.due_date = CURRENT_DATE AND t.status != 'completed')
  )
ORDER BY 
  CASE 
    WHEN t.due_date = CURRENT_DATE THEN 1
    WHEN t.status = 'scheduled' THEN 2
    WHEN t.status = 'next' THEN 3
    ELSE 4
  END,
  t.priority DESC,
  t.created_at ASC;
```

### 3. overdue_tasks ビュー

**目的**: 期限切れタスクの抽出

```sql
CREATE VIEW overdue_tasks AS
SELECT 
  t.*,
  p.title as project_title,
  CURRENT_DATE - t.due_date as days_overdue
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE 
  t.deleted_at IS NULL
  AND t.status NOT IN ('completed', 'deleted')
  AND t.due_date < CURRENT_DATE
ORDER BY days_overdue DESC, t.priority DESC;
```

### 4. project_progress ビュー

**目的**: プロジェクト進捗の自動計算

```sql
CREATE VIEW project_progress AS
SELECT 
  p.*,
  COALESCE(task_stats.total_tasks, 0) as total_tasks,
  COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
  CASE 
    WHEN COALESCE(task_stats.total_tasks, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(task_stats.completed_tasks, 0)::numeric / task_stats.total_tasks) * 100, 2)
  END as calculated_progress
FROM projects p
LEFT JOIN (
  SELECT 
    project_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
  FROM tasks 
  WHERE deleted_at IS NULL AND project_id IS NOT NULL
  GROUP BY project_id
) task_stats ON p.id = task_stats.project_id
WHERE p.archived_at IS NULL;
```

### 5. weekly_review ビュー

**目的**: 週次レビュー用データの提供

```sql
CREATE VIEW weekly_review AS
SELECT 
  user_id,
  date_trunc('week', created_at) as week_start,
  COUNT(*) as tasks_created,
  COUNT(*) FILTER (WHERE status = 'completed') as tasks_completed,
  SUM(COALESCE(time_estimate, 0)) as time_spent_minutes
FROM tasks
WHERE 
  deleted_at IS NULL
  AND created_at >= date_trunc('week', CURRENT_DATE - interval '4 weeks')
GROUP BY user_id, date_trunc('week', created_at)
ORDER BY week_start DESC;
```

### 6. tasks_by_context ビュー

**目的**: コンテキスト別タスク分析

```sql
CREATE VIEW tasks_by_context AS
SELECT 
  user_id,
  COALESCE(context, 'コンテキストなし') as context,
  COUNT(*) as task_count,
  COUNT(*) FILTER (WHERE status = 'next') as next_actions,
  AVG(time_estimate) as avg_time_estimate
FROM tasks
WHERE deleted_at IS NULL AND status NOT IN ('completed', 'deleted')
GROUP BY user_id, context
ORDER BY task_count DESC;
```

### 7. stripe_user_subscriptions ビュー

**目的**: ユーザーのサブスクリプション情報の統合表示

```sql
CREATE VIEW stripe_user_subscriptions AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.deleted_at IS NULL AND ss.deleted_at IS NULL;
```

## 関数設計

### 1. update_updated_at_column()

**目的**: updated_atカラムの自動更新

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

**適用テーブル**:
```sql
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. handle_new_user()

**目的**: 新規ユーザー登録時の初期設定

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- プロファイル作成
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  -- 初期設定作成
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

### 3. initialize_user_subscription()

**目的**: 新規ユーザーのサブスクリプション初期化

```sql
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- 使用量制限の初期化
  INSERT INTO usage_limits (user_id, month_year)
  VALUES (NEW.id, current_month)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### 4. handle_new_user_settings()

**目的**: プロファイル作成時の設定初期化

```sql
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザー設定の初期化
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 使用量制限の初期化
  INSERT INTO usage_limits (user_id, month_year)
  VALUES (NEW.id, to_char(now(), 'YYYY-MM'))
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';
```

## 管理者機能テーブル

### 1. admin_users テーブル

**目的**: 管理者ユーザーの管理

```sql
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  is_active boolean DEFAULT true,
  
  CONSTRAINT admin_users_role_check CHECK (
    role IN ('admin', 'super_admin')
  )
);
```

### 2. admin_actions テーブル

**目的**: 管理者操作の監査ログ

```sql
CREATE TABLE admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id),
  action_type text NOT NULL,
  target_user_id uuid REFERENCES users(id),
  details jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT admin_actions_action_type_check CHECK (
    action_type IN ('delete_all_data', 'delete_user_data', 'create_admin', 'deactivate_admin')
  )
);
```

## インデックス戦略

### 1. 主要クエリパターン

#### ユーザー別タスク取得
```sql
-- 最も頻繁なクエリ
SELECT * FROM tasks WHERE user_id = ? AND status = ? AND deleted_at IS NULL;

-- 対応インデックス
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status) WHERE deleted_at IS NULL;
```

#### 日付範囲検索
```sql
-- 予定済みタスクの日付検索
SELECT * FROM tasks WHERE user_id = ? AND scheduled_date BETWEEN ? AND ?;

-- 対応インデックス
CREATE INDEX idx_tasks_user_scheduled ON tasks(user_id, scheduled_date) WHERE deleted_at IS NULL;
```

#### プロジェクト関連タスク
```sql
-- プロジェクトのタスク取得
SELECT * FROM tasks WHERE project_id = ? AND deleted_at IS NULL;

-- 対応インデックス（既存のidx_tasks_project_idで対応）
```

### 2. 複合インデックス設計

#### 優先度付きインデックス
```sql
-- 高頻度クエリ用の複合インデックス
CREATE INDEX idx_tasks_user_status_priority ON tasks(user_id, status, priority DESC) 
WHERE deleted_at IS NULL;
```

#### 日付ソート用インデックス
```sql
-- 作成日順ソート用
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC) 
WHERE deleted_at IS NULL;
```

## データ整合性

### 1. 制約設計

#### 外部キー制約
- `CASCADE`: 親削除時に子も削除（users → profiles）
- `SET NULL`: 親削除時に子をNULLに（projects → tasks）
- `RESTRICT`: 子が存在する場合は親削除を禁止

#### チェック制約
- 列挙値の制限（status, priority等）
- 数値範囲の制限（progress: 0-100）
- 日付の論理チェック

### 2. トリガー設計

#### 自動更新トリガー
```sql
-- updated_at の自動更新
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 初期化トリガー
```sql
-- 新規ユーザーの初期設定
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_settings();
```

## パフォーマンス最適化

### 1. クエリ最適化

#### N+1問題の回避
```sql
-- 悪い例：N+1クエリ
SELECT * FROM tasks WHERE user_id = ?;
-- 各タスクに対して
SELECT * FROM projects WHERE id = task.project_id;

-- 良い例：JOINを使用
SELECT t.*, p.title as project_title
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.user_id = ?;
```

#### 部分インデックス
```sql
-- 削除されていないタスクのみのインデックス
CREATE INDEX idx_tasks_active ON tasks(user_id, status) 
WHERE deleted_at IS NULL;
```

### 2. 統計情報の最適化

#### 定期的な統計更新
```sql
-- 統計情報の手動更新（必要に応じて）
ANALYZE tasks;
ANALYZE projects;
```

## データ保持ポリシー

### 1. 論理削除

#### 削除済みデータの保持期間
- **タスク**: 30日間（その後物理削除）
- **プロジェクト**: 90日間（その後物理削除）
- **ユーザーデータ**: 法的要件に従い1年間

#### 自動クリーンアップ
```sql
-- 古い削除済みタスクの物理削除（月次実行）
DELETE FROM tasks 
WHERE deleted_at < now() - interval '30 days';
```

### 2. アーカイブ戦略

#### 長期保存データ
- **完了済みタスク**: 1年間保持
- **統計データ**: 永続保持
- **監査ログ**: 3年間保持

## セキュリティ設計

### 1. Row Level Security (RLS)

#### 基本ポリシーパターン
```sql
-- 読み取り権限
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT TO public USING (uid() = user_id);

-- 更新権限
CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE TO public USING (uid() = user_id);

-- 挿入権限
CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT TO public WITH CHECK (uid() = user_id);
```

#### 管理者ポリシー
```sql
-- 管理者は全データアクセス可能
CREATE POLICY "Admins can access all data" ON table_name
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = uid() AND is_active = true
    )
  );
```

### 2. 機密データ保護

#### 暗号化対象
- パスワード（Supabase Auth管理）
- 決済情報（Stripe管理）
- 個人識別情報

#### アクセス制御
- 最小権限の原則
- 定期的な権限レビュー
- 監査ログの記録

## 監視・メンテナンス

### 1. パフォーマンス監視

#### 監視対象
- スロークエリの検出
- インデックス使用率
- テーブルサイズの増加
- 接続数の監視

#### アラート設定
- クエリ実行時間 > 5秒
- 接続数 > 80%
- ディスク使用率 > 80%

### 2. 定期メンテナンス

#### 日次タスク
- バックアップ確認
- エラーログ確認
- パフォーマンス監視

#### 週次タスク
- 統計情報更新
- インデックス最適化確認
- 容量使用量確認

#### 月次タスク
- 古いデータのクリーンアップ
- パフォーマンス分析
- セキュリティ監査

## 災害復旧

### 1. バックアップ戦略

#### 自動バックアップ
- **頻度**: 日次
- **保持期間**: 30日間
- **場所**: 地理的分散

#### ポイントインタイムリカバリ
- **対象**: 過去7日間
- **粒度**: 秒単位
- **RTO**: 4時間以内

### 2. 復旧手順

#### データ復旧
1. 影響範囲の特定
2. 復旧ポイントの決定
3. バックアップからの復元
4. データ整合性の確認
5. アプリケーション再開

## 将来の拡張

### 1. スケーラビリティ

#### 水平分割（シャーディング）
```sql
-- ユーザーIDベースの分割
CREATE TABLE tasks_shard_1 (LIKE tasks INCLUDING ALL);
CREATE TABLE tasks_shard_2 (LIKE tasks INCLUDING ALL);
```

#### 読み取り専用レプリカ
- 検索・レポート用
- 読み取り負荷の分散

### 2. 新機能対応

#### チーム機能
```sql
-- 将来実装予定
CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name varchar(255) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id),
  user_id uuid REFERENCES users(id),
  role varchar(20) DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);
```

#### 通知機能
```sql
-- 将来実装予定
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

## データマイグレーション

### 1. マイグレーション戦略

#### 命名規則
- `YYYYMMDDHHMMSS_description.sql`
- 説明的なファイル名
- 実行順序の保証

#### マイグレーション内容
- スキーマ変更
- データ変換
- インデックス追加
- 制約追加

### 2. ロールバック戦略

#### 安全なマイグレーション
```sql
-- 新しいカラム追加（安全）
ALTER TABLE tasks ADD COLUMN new_field text;

-- カラム削除（危険 - 段階的実行）
-- 1. アプリケーションでの使用停止
-- 2. 数日後にカラム削除
ALTER TABLE tasks DROP COLUMN old_field;
```

## 品質保証

### 1. データ品質チェック

#### 整合性チェック
```sql
-- 孤立したタスクの検出
SELECT * FROM tasks t
WHERE t.project_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = t.project_id);

-- 無効なステータスの検出
SELECT * FROM tasks
WHERE status NOT IN ('inbox', 'next', 'waiting', 'scheduled', 'project', 'someday', 'completed', 'deleted', 'reference');
```

#### 定期チェック
- 外部キー制約違反
- NULL制約違反
- チェック制約違反

### 2. パフォーマンステスト

#### 負荷テスト
- 大量データでのクエリ性能
- 同時接続数の限界
- インデックス効果の測定

#### ベンチマーク
- 主要クエリの実行時間
- データ挿入・更新性能
- バックアップ・復旧時間