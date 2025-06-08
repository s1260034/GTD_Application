-- GTD Task Management Database Schema
-- PostgreSQL用のスキーマ設計

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    language VARCHAR(10) DEFAULT 'ja',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- プロジェクトテーブル
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- タスクテーブル
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'inbox' CHECK (
        status IN ('inbox', 'next', 'waiting', 'scheduled', 'project', 'someday', 'completed', 'deleted', 'reference')
    ),
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
    time_estimate INTEGER, -- 分単位
    energy_level VARCHAR(10) CHECK (energy_level IN ('low', 'medium', 'high')),
    context VARCHAR(50), -- @home, @office, @computer, @phone など
    assigned_to VARCHAR(100), -- 委任先の人
    due_date DATE,
    scheduled_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- タグテーブル
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280', -- HEXカラーコード
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- タスク-タグ関連テーブル
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 添付ファイルテーブル
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT attachment_belongs_to_task_or_project CHECK (
        (task_id IS NOT NULL AND project_id IS NULL) OR 
        (task_id IS NULL AND project_id IS NOT NULL)
    )
);

-- コメント/ノートテーブル
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT comment_belongs_to_task_or_project CHECK (
        (task_id IS NOT NULL AND project_id IS NULL) OR 
        (task_id IS NULL AND project_id IS NOT NULL)
    )
);

-- 処理履歴テーブル（GTDワークフローの追跡）
CREATE TABLE processing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL CHECK (step_number >= 1 AND step_number <= 6),
    step_name VARCHAR(50) NOT NULL,
    decision TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 定期タスクテーブル
CREATE TABLE recurring_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    recurrence_pattern VARCHAR(20) NOT NULL CHECK (
        recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')
    ),
    recurrence_interval INTEGER DEFAULT 1,
    days_of_week INTEGER[], -- 0=日曜日, 1=月曜日, ... 6=土曜日
    day_of_month INTEGER,
    month_of_year INTEGER,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 設定テーブル
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    default_context VARCHAR(50),
    work_hours_start TIME DEFAULT '09:00',
    work_hours_end TIME DEFAULT '17:00',
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    auto_move_today_tasks BOOLEAN DEFAULT true,
    weekly_review_day INTEGER DEFAULT 0 CHECK (weekly_review_day >= 0 AND weekly_review_day <= 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 統計テーブル（パフォーマンス追跡用）
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    inbox_items_processed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- インデックス作成
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_processing_history_task_id ON processing_history(task_id);
CREATE INDEX idx_user_statistics_user_date ON user_statistics(user_id, date);

-- RLS (Row Level Security) ポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tags" ON tags
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own task_tags" ON task_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_tags.task_id 
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own attachments" ON attachments
    FOR ALL USING (
        (task_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = attachments.task_id 
            AND tasks.user_id = auth.uid()
        )) OR
        (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = attachments.project_id 
            AND projects.user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can view own comments" ON comments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own processing_history" ON processing_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recurring_tasks" ON recurring_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON user_statistics
    FOR ALL USING (auth.uid() = user_id);

-- トリガー関数（更新日時の自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時トリガーの作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at BEFORE UPDATE ON recurring_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();