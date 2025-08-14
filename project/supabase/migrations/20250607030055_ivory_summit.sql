-- 便利な関数の定義

-- タスクの自動移動関数（今日の予定タスクを次のアクションに移動）
CREATE OR REPLACE FUNCTION move_todays_scheduled_tasks()
RETURNS INTEGER AS $$
DECLARE
    moved_count INTEGER;
BEGIN
    UPDATE tasks 
    SET 
        status = 'next',
        updated_at = NOW()
    WHERE 
        status = 'scheduled' 
        AND scheduled_date = CURRENT_DATE
        AND deleted_at IS NULL;
    
    GET DIAGNOSTICS moved_count = ROW_COUNT;
    RETURN moved_count;
END;
$$ LANGUAGE plpgsql;

-- 定期タスクの生成関数
CREATE OR REPLACE FUNCTION generate_recurring_tasks()
RETURNS INTEGER AS $$
DECLARE
    rec RECORD;
    new_task_id UUID;
    generated_count INTEGER := 0;
BEGIN
    FOR rec IN 
        SELECT rt.*, t.title, t.description, t.time_estimate, t.energy_level, t.context, t.priority
        FROM recurring_tasks rt
        JOIN tasks t ON rt.template_task_id = t.id
        WHERE rt.is_active = true 
        AND rt.next_due_date <= CURRENT_DATE
    LOOP
        -- 新しいタスクを作成
        INSERT INTO tasks (
            user_id, title, description, status, priority, 
            time_estimate, energy_level, context, due_date
        ) VALUES (
            rec.user_id, rec.title, rec.description, 'scheduled', rec.priority,
            rec.time_estimate, rec.energy_level, rec.context, rec.next_due_date
        ) RETURNING id INTO new_task_id;
        
        -- 次回実行日を更新
        UPDATE recurring_tasks 
        SET next_due_date = CASE 
            WHEN recurrence_pattern = 'daily' THEN next_due_date + (recurrence_interval || ' days')::INTERVAL
            WHEN recurrence_pattern = 'weekly' THEN next_due_date + (recurrence_interval || ' weeks')::INTERVAL
            WHEN recurrence_pattern = 'monthly' THEN next_due_date + (recurrence_interval || ' months')::INTERVAL
            WHEN recurrence_pattern = 'yearly' THEN next_due_date + (recurrence_interval || ' years')::INTERVAL
            ELSE next_due_date + INTERVAL '1 day'
        END
        WHERE id = rec.id;
        
        generated_count := generated_count + 1;
    END LOOP;
    
    RETURN generated_count;
END;
$$ LANGUAGE plpgsql;

-- プロジェクト進捗の自動計算関数
CREATE OR REPLACE FUNCTION update_project_progress(project_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO total_tasks, completed_tasks
    FROM tasks 
    WHERE project_id = project_uuid AND deleted_at IS NULL;
    
    IF total_tasks = 0 THEN
        new_progress := 0;
    ELSE
        new_progress := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
    END IF;
    
    UPDATE projects 
    SET 
        progress = new_progress,
        updated_at = NOW(),
        completed_at = CASE 
            WHEN new_progress = 100 AND completed_at IS NULL THEN NOW()
            WHEN new_progress < 100 THEN NULL
            ELSE completed_at
        END
    WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- ユーザー統計の更新関数
CREATE OR REPLACE FUNCTION update_user_statistics(user_uuid UUID, stat_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    tasks_completed_count INTEGER;
    tasks_created_count INTEGER;
    projects_completed_count INTEGER;
    inbox_processed_count INTEGER;
BEGIN
    -- その日に完了したタスク数
    SELECT COUNT(*) INTO tasks_completed_count
    FROM tasks 
    WHERE user_id = user_uuid 
    AND DATE(completed_at) = stat_date;
    
    -- その日に作成されたタスク数
    SELECT COUNT(*) INTO tasks_created_count
    FROM tasks 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = stat_date;
    
    -- その日に完了したプロジェクト数
    SELECT COUNT(*) INTO projects_completed_count
    FROM projects 
    WHERE user_id = user_uuid 
    AND DATE(completed_at) = stat_date;
    
    -- その日に処理されたインボックスアイテム数
    SELECT COUNT(*) INTO inbox_processed_count
    FROM processing_history 
    WHERE user_id = user_uuid 
    AND DATE(processed_at) = stat_date;
    
    -- 統計を挿入または更新
    INSERT INTO user_statistics (
        user_id, date, tasks_completed, tasks_created, 
        projects_completed, inbox_items_processed
    ) VALUES (
        user_uuid, stat_date, tasks_completed_count, tasks_created_count,
        projects_completed_count, inbox_processed_count
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        tasks_completed = EXCLUDED.tasks_completed,
        tasks_created = EXCLUDED.tasks_created,
        projects_completed = EXCLUDED.projects_completed,
        inbox_items_processed = EXCLUDED.inbox_items_processed,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- タスク削除時のクリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_deleted_tasks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 30日以上前に削除されたタスクを完全削除
    DELETE FROM tasks 
    WHERE status = 'deleted' 
    AND deleted_at < CURRENT_DATE - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;