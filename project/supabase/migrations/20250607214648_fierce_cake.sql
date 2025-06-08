-- 認証対応版のビューを再作成

-- タスク統計ビュー
CREATE OR REPLACE VIEW task_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'inbox' THEN 1 END) as inbox_count,
    COUNT(CASE WHEN status = 'next' THEN 1 END) as next_count,
    COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting_count,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'someday' THEN 1 END) as someday_count,
    COUNT(CASE WHEN status = 'reference' THEN 1 END) as reference_count,
    COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_count
FROM tasks
WHERE deleted_at IS NULL
GROUP BY user_id;

-- 今日のタスクビュー
CREATE OR REPLACE VIEW todays_tasks AS
SELECT 
    t.*,
    p.title as project_title
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE 
    t.deleted_at IS NULL
    AND (
        t.due_date = CURRENT_DATE
        OR t.scheduled_date = CURRENT_DATE
        OR (t.status = 'next' AND t.due_date IS NULL)
    );

-- 期限切れタスクビュー
CREATE OR REPLACE VIEW overdue_tasks AS
SELECT 
    t.*,
    p.title as project_title,
    CURRENT_DATE - t.due_date as days_overdue
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE 
    t.deleted_at IS NULL
    AND t.status NOT IN ('completed', 'deleted')
    AND t.due_date < CURRENT_DATE;

-- プロジェクト進捗ビュー
CREATE OR REPLACE VIEW project_progress AS
SELECT 
    p.*,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    CASE 
        WHEN COUNT(t.id) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / COUNT(t.id)) * 100)
    END as calculated_progress
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id AND t.deleted_at IS NULL
WHERE p.status = 'active'
GROUP BY p.id, p.title, p.description, p.status, p.progress, p.created_at, p.updated_at, p.completed_at, p.archived_at, p.user_id;

-- 週次レビュー用ビュー
CREATE OR REPLACE VIEW weekly_review AS
SELECT 
    user_id,
    DATE_TRUNC('week', created_at) as week_start,
    COUNT(*) as tasks_created,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed,
    SUM(CASE WHEN status = 'completed' AND time_estimate IS NOT NULL THEN time_estimate ELSE 0 END) as time_spent_minutes
FROM tasks
WHERE created_at >= CURRENT_DATE - INTERVAL '4 weeks'
GROUP BY user_id, DATE_TRUNC('week', created_at)
ORDER BY user_id, week_start DESC;

-- コンテキスト別タスクビュー
CREATE OR REPLACE VIEW tasks_by_context AS
SELECT 
    user_id,
    COALESCE(context, 'その他') as context,
    COUNT(*) as task_count,
    COUNT(CASE WHEN status = 'next' THEN 1 END) as next_actions,
    AVG(time_estimate) as avg_time_estimate
FROM tasks
WHERE deleted_at IS NULL AND status NOT IN ('completed', 'deleted')
GROUP BY user_id, context
ORDER BY user_id, task_count DESC;