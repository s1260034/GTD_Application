-- サンプルデータ挿入用SQL
-- 開発・テスト用のサンプルデータ

-- サンプルユーザー
INSERT INTO users (id, email, password_hash, display_name, timezone, language) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'user@example.com', '$2b$10$example_hash', '田中太郎', 'Asia/Tokyo', 'ja'),
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '$2b$10$example_hash', '管理者', 'Asia/Tokyo', 'ja');

-- サンプルプロジェクト
INSERT INTO projects (id, user_id, title, description, status, progress) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'ウェブサイトリニューアル', 'コーポレートサイトの全面リニューアルプロジェクト', 'active', 30),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '新商品企画', '来年度の新商品企画と開発', 'active', 10);

-- サンプルタスク
INSERT INTO tasks (id, user_id, project_id, title, description, status, priority, time_estimate, energy_level, context, due_date) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', NULL, 'メールの返信', '重要なメールに返信する', 'inbox', 2, 15, 'low', '@computer', NULL),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NULL, '会議資料の準備', '明日の会議用の資料を準備', 'next', 3, 60, 'medium', '@office', '2024-01-15'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'デザインレビュー', 'ウェブサイトのデザイン案をレビュー', 'scheduled', 4, 120, 'high', '@office', '2024-01-16'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, '田中さんからの返事待ち', '企画書の確認依頼', 'waiting', 2, NULL, NULL, NULL, '2024-01-20');

-- サンプルタグ
INSERT INTO tags (id, user_id, name, color) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '緊急', '#EF4444'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '重要', '#F59E0B'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '会議', '#3B82F6'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'レビュー', '#8B5CF6');

-- タスク-タグ関連
INSERT INTO task_tags (task_id, tag_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440000'),
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003');

-- ユーザー設定
INSERT INTO user_settings (user_id, theme, default_context, work_hours_start, work_hours_end, weekly_review_day) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'light', '@office', '09:00', '18:00', 0);

-- 定期タスク
INSERT INTO recurring_tasks (id, user_id, template_task_id, recurrence_pattern, recurrence_interval, days_of_week, next_due_date) VALUES
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'weekly', 1, ARRAY[1], '2024-01-22');