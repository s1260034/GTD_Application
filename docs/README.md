# Focus Flow - 設計ドキュメント

## 📋 ドキュメント一覧

このディレクトリには、Focus Flow GTDタスク管理アプリケーションの設計・運用に関する包括的なドキュメントが含まれています。

## 🏗️ 設計書類

### [システム設計書](./SYSTEM_DESIGN.md)
- システム全体の要件・アーキテクチャ
- 非機能要件とパフォーマンス目標
- セキュリティ・コンプライアンス要件
- 将来のロードマップ

### [API設計書](./API_DESIGN.md)
- Supabase Edge Functions仕様
- Stripe連携API詳細
- エラーハンドリング
- 認証・認可方式

### [フロントエンドアーキテクチャ](./FRONTEND_ARCHITECTURE.md)
- Reactアプリケーション構造
- コンポーネント設計パターン
- 状態管理アーキテクチャ
- パフォーマンス最適化

### [データフロー図](./DATA_FLOW.md)
- 主要ユースケースのシーケンス図
- GTD処理ワークフロー
- サブスクリプション管理フロー
- エラーハンドリングフロー

### [デプロイメントアーキテクチャ](./DEPLOYMENT_ARCHITECTURE.md)
- インフラ構成図
- CI/CDパイプライン
- 監視・ログ戦略
- 災害復旧計画

## 🔧 運用書類

### [セットアップガイド](./SETUP.md)
- 開発環境構築手順
- 本番環境デプロイ手順
- 環境変数設定
- トラブルシューティング

### [データベース設計書](../database/README.md)
- テーブル設計詳細
- インデックス・制約
- RLSポリシー
- ビュー・関数

## 👥 新規参画者向け

### [技術用語集](./TECHNICAL_GLOSSARY.md)
- GTD関連用語
- 技術スタック用語
- アーキテクチャパターン用語
- セキュリティ・パフォーマンス用語

### [オンボーディングガイド](./ONBOARDING_GUIDE.md)
- 段階的学習ロードマップ
- 実践的な課題
- 開発環境セットアップ詳細
- よくある質問と回答

### [開発標準・ガイドライン](./DEVELOPMENT_STANDARDS.md)
- コーディング規約
- アーキテクチャ規約
- テスト規約
- Git・レビュー規約

## 📊 ドキュメント構成図

```
docs/
├── README.md                    # このファイル
├── TECHNICAL_GLOSSARY.md        # 技術用語集
├── ONBOARDING_GUIDE.md          # 新規参画者ガイド
├── DEVELOPMENT_STANDARDS.md     # 開発標準
├── SYSTEM_DESIGN.md            # システム全体設計
├── API_DESIGN.md               # API仕様書
├── FRONTEND_ARCHITECTURE.md    # フロントエンド設計
├── DATA_FLOW.md                # データフロー・シーケンス
├── DEPLOYMENT_ARCHITECTURE.md  # デプロイメント設計
├── COMPONENT_DESIGN.md         # コンポーネント設計
├── DATABASE_DESIGN.md          # データベース設計詳細
└── SETUP.md                    # セットアップガイド
```

## 🎯 ドキュメントの使い方

### 開発者向け
1. **新規参加**: `ONBOARDING_GUIDE.md` → `TECHNICAL_GLOSSARY.md` → `SETUP.md` → `SYSTEM_DESIGN.md`
2. **API開発**: `API_DESIGN.md` → `DATA_FLOW.md`
3. **UI開発**: `FRONTEND_ARCHITECTURE.md` → `SYSTEM_DESIGN.md`
4. **コーディング**: `DEVELOPMENT_STANDARDS.md` → `COMPONENT_DESIGN.md`

### 運用担当者向け
1. **デプロイ**: `DEPLOYMENT_ARCHITECTURE.md` → `SETUP.md`
2. **監視**: `DEPLOYMENT_ARCHITECTURE.md` → `SYSTEM_DESIGN.md`
3. **障害対応**: `DEPLOYMENT_ARCHITECTURE.md` → `DATA_FLOW.md`

### プロジェクトマネージャー向け
1. **全体把握**: `SYSTEM_DESIGN.md` → `README.md`
2. **進捗管理**: 各設計書の実装状況確認
3. **リスク管理**: セキュリティ・可用性要件確認

### 新規参画者向け
1. **初日**: `ONBOARDING_GUIDE.md` → `TECHNICAL_GLOSSARY.md`
2. **1週目**: `SETUP.md` → `SYSTEM_DESIGN.md` → `FRONTEND_ARCHITECTURE.md`
3. **2週目**: `COMPONENT_DESIGN.md` → `DEVELOPMENT_STANDARDS.md`
4. **継続**: 各専門分野の設計書を参照

## 🔄 ドキュメント更新ルール

### 更新タイミング
- **機能追加時**: 関連する設計書を更新
- **アーキテクチャ変更時**: 該当する設計書を更新
- **月次レビュー**: 全ドキュメントの整合性確認

### 更新手順
1. 変更内容の設計書への反映
2. 関連ドキュメントの整合性確認
3. プルリクエストでのレビュー
4. マージ後の通知

### バージョン管理
- Gitでのバージョン管理
- 重要な変更時はタグ付け
- 変更履歴の記録

## 📞 サポート・問い合わせ

### 技術的な質問
- GitHub Issues での質問
- 設計レビューの依頼

### ドキュメント改善
- 不明な点の指摘
- 追加すべき内容の提案
- 誤字・脱字の報告

---

**最終更新**: 2025年1月
**バージョン**: 1.0.0
**メンテナー**: Focus Flow開発チーム