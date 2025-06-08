# GTD Task Management Database Design

## 概要

このデータベース設計は、Getting Things Done (GTD) 手法に基づいたタスク管理アプリケーション用に設計されています。

## 主要テーブル

### 1. users (ユーザー)
- ユーザーアカウント情報
- 認証情報とプロファイル設定

### 2. projects (プロジェクト)
- 複数のタスクからなるプロジェクト
- 進捗追跡機能

### 3. tasks (タスク)
- GTDの各ステータス（inbox, next, waiting, scheduled, etc.）
- 優先度、時間見積もり、エネルギーレベル
- コンテキスト（@home, @office, etc.）

### 4. tags (タグ)
- タスクの分類用タグ
- カラーコード付き

### 5. attachments (添付ファイル)
- タスクやプロジェクトに関連するファイル

### 6. comments (コメント/ノート)
- タスクやプロジェクトへのメモ

### 7. processing_history (処理履歴)
- GTDワークフローの各ステップの記録

### 8. recurring_tasks (定期タスク)
- 繰り返しタスクの設定

### 9. user_settings (ユーザー設定)
- 個人設定とカスタマイズ

### 10. user_statistics (統計)
- パフォーマンス追跡とレポート用

## 主要機能

### GTDワークフロー対応
- 6ステップの処理フローを完全サポート
- 各ステップの決定履歴を記録

### セキュリティ
- Row Level Security (RLS) による多テナント対応
- ユーザーは自分のデータのみアクセス可能

### パフォーマンス
- 適切なインデックス設定
- 効率的なクエリのためのビュー

### 自動化
- 今日の予定タスクの自動移動
- 定期タスクの自動生成
- プロジェクト進捗の自動計算

## ビュー

### task_statistics
- ユーザー別タスク統計

### todays_tasks
- 今日実行すべきタスク

### overdue_tasks
- 期限切れタスク

### project_progress
- プロジェクト進捗状況

### weekly_review
- 週次レビュー用データ

### tasks_by_context
- コンテキスト別タスク分析

## 関数

### move_todays_scheduled_tasks()
- 今日の予定タスクを次のアクションに自動移動

### generate_recurring_tasks()
- 定期タスクの自動生成

### update_project_progress()
- プロジェクト進捗の自動計算

### update_user_statistics()
- ユーザー統計の更新

### cleanup_deleted_tasks()
- 古い削除済みタスクのクリーンアップ

## 使用方法

1. `schema.sql` でテーブル構造を作成
2. `views.sql` でビューを作成
3. `functions.sql` で関数を作成
4. `sample_data.sql` でサンプルデータを挿入（開発用）

## 定期実行推奨

以下の関数を定期的に実行することを推奨します：

```sql
-- 毎日実行
SELECT move_todays_scheduled_tasks();
SELECT generate_recurring_tasks();

-- 毎週実行
SELECT cleanup_deleted_tasks();

-- 毎日実行（統計更新）
SELECT update_user_statistics(user_id) FROM users;
```

## 拡張性

このスキーマは以下の機能拡張に対応できます：

- チーム機能（共有プロジェクト）
- 通知システム
- カレンダー連携
- レポート機能
- API連携
- モバイルアプリ対応

## 注意事項

- PostgreSQL 12以上を推奨
- UUIDを主キーとして使用
- タイムゾーン対応
- 論理削除（soft delete）を採用