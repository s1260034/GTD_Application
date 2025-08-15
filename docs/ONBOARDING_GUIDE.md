# 新規参画者向けオンボーディングガイド

## 🎯 このガイドについて

Focus Flow プロジェクトに新しく参画する開発者向けの包括的なオンボーディングガイドです。技術的な背景知識から実際の開発作業まで、段階的に学習できるよう構成されています。

## 📋 学習ロードマップ

### Phase 1: 基礎理解（1-2日）

#### 1.1 プロジェクト概要の理解
- [ ] `README.md` を読む
- [ ] `docs/SYSTEM_DESIGN.md` でシステム全体を把握
- [ ] GTD手法の基本概念を学習（`docs/TECHNICAL_GLOSSARY.md`）

#### 1.2 技術スタックの理解
- [ ] React 18 + TypeScript の基礎確認
- [ ] Supabase の概念理解
- [ ] Tailwind CSS の基本的な使い方

#### 1.3 開発環境構築
- [ ] `docs/SETUP.md` に従って環境構築
- [ ] ローカルでアプリケーションを起動
- [ ] 基本的な操作を試す

### Phase 2: アーキテクチャ理解（2-3日）

#### 2.1 フロントエンド設計
- [ ] `docs/FRONTEND_ARCHITECTURE.md` を読む
- [ ] Context API の使用方法を理解
- [ ] 主要コンポーネントの役割を把握

#### 2.2 データベース設計
- [ ] `docs/DATABASE_DESIGN.md` を読む
- [ ] テーブル構造とリレーションを理解
- [ ] RLS（Row Level Security）の概念を学習

#### 2.3 API設計
- [ ] `docs/API_DESIGN.md` を読む
- [ ] Edge Functions の仕組みを理解
- [ ] Stripe連携の流れを把握

### Phase 3: 実装理解（3-4日）

#### 3.1 コンポーネント設計
- [ ] `docs/COMPONENT_DESIGN.md` を読む
- [ ] 主要コンポーネントのコードを読む
- [ ] 状態管理パターンを理解

#### 3.2 データフロー
- [ ] `docs/DATA_FLOW.md` を読む
- [ ] 主要なユースケースの流れを追跡
- [ ] デバッガーでデータフローを確認

#### 3.3 実際のコード理解
- [ ] `src/contexts/` のコードを読む
- [ ] `src/components/` の主要コンポーネントを読む
- [ ] `src/hooks/` のカスタムフックを理解

### Phase 4: 開発参加（1週間〜）

#### 4.1 小さなタスクから開始
- [ ] バグ修正
- [ ] UI の微調整
- [ ] 新しいコンポーネントの追加

#### 4.2 機能開発
- [ ] 新機能の設計・実装
- [ ] テストの作成
- [ ] ドキュメントの更新

## 🛠 開発環境セットアップ詳細

### 必要なツール

#### 必須ツール
```bash
# Node.js 18以上
node --version  # v18.0.0以上

# npm
npm --version   # 8.0.0以上

# Git
git --version   # 2.0以上
```

#### 推奨ツール
```bash
# VS Code（推奨エディタ）
# 推奨拡張機能：
# - ES7+ React/Redux/React-Native snippets
# - TypeScript Importer
# - Tailwind CSS IntelliSense
# - Prettier - Code formatter
# - ESLint
```

### 環境変数設定

```bash
# .env ファイルを作成
cp .env.example .env

# 以下の値を設定
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 初回セットアップ

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd focus-flow

# 2. 依存関係インストール
npm install

# 3. 開発サーバー起動
npm run dev

# 4. ブラウザで確認
# http://localhost:5173 にアクセス
```

## 🎓 学習課題

### 初級課題（Phase 1-2）

#### 課題1: アプリケーション操作
1. アカウントを作成してログイン
2. インボックスにタスクを5個追加
3. 各タスクを処理ワークフローで分類
4. 各リスト（次のアクション、待ち項目等）を確認

#### 課題2: コード読解
1. `src/components/Inbox/InboxInput.tsx` を読んで、タスク追加の流れを理解
2. `src/contexts/TaskContext.tsx` の `addTask` 関数を追跡
3. データベースへの保存処理を確認

#### 課題3: 設計理解
1. なぜ Context API を使用しているか説明
2. RLS（Row Level Security）の利点を説明
3. GTDの6ステップ処理フローを図解

### 中級課題（Phase 3）

#### 課題4: バグ修正
1. 既存のバグを見つけて修正
2. テストケースを追加
3. プルリクエストを作成

#### 課題5: 小機能追加
1. タスクに「緊急度」フィールドを追加
2. UI に緊急度表示を追加
3. データベースマイグレーションを作成

#### 課題6: パフォーマンス改善
1. React DevTools でパフォーマンスを分析
2. 不要な再描画を特定
3. `React.memo` や `useMemo` で最適化

### 上級課題（Phase 4）

#### 課題7: 新機能設計・実装
1. 「タスクのタグ機能」を設計
2. データベーススキーマを設計
3. フロントエンド UI を実装
4. テストを作成

#### 課題8: アーキテクチャ改善
1. 現在のアーキテクチャの課題を特定
2. 改善案を提案
3. 段階的な移行計画を作成

## 🤝 チーム開発ルール

### Git ワークフロー

#### ブランチ戦略
```bash
# メインブランチ
main          # 本番環境
develop       # 開発環境

# 機能ブランチ
feature/task-tags        # 新機能
bugfix/inbox-input-bug   # バグ修正
hotfix/security-patch    # 緊急修正
```

#### コミットメッセージ
```bash
# 形式
<type>(<scope>): <subject>

# 例
feat(inbox): add task creation with time estimate
fix(auth): resolve login error handling
docs(api): update stripe webhook documentation
```

#### プルリクエスト
1. **作成前チェック**
   - [ ] ESLint エラーなし
   - [ ] TypeScript エラーなし
   - [ ] テスト通過
   - [ ] ビルド成功

2. **PR説明**
   - 変更内容の概要
   - 関連するIssue番号
   - テスト方法
   - スクリーンショット（UI変更の場合）

### コードレビュー

#### レビュー観点
- [ ] **機能性**: 要件を満たしているか
- [ ] **可読性**: コードが理解しやすいか
- [ ] **保守性**: 将来の変更に対応できるか
- [ ] **パフォーマンス**: 性能に問題はないか
- [ ] **セキュリティ**: セキュリティリスクはないか

#### レビューコメント例
```markdown
# 良いコメント例
## 提案
この部分は `useMemo` を使用することで、パフォーマンスが向上すると思います。

## 質問
この条件分岐の意図を教えてください。エッジケースの考慮でしょうか？

## 賞賛
エラーハンドリングが丁寧で、ユーザー体験が向上しますね！
```

## 🐛 デバッグ・トラブルシューティング

### よくある問題と解決方法

#### 1. 環境変数が読み込まれない
```bash
# 確認方法
console.log(import.meta.env.VITE_SUPABASE_URL)

# 解決方法
# - .env ファイルの存在確認
# - VITE_ プレフィックスの確認
# - 開発サーバーの再起動
```

#### 2. Supabase接続エラー
```bash
# 確認方法
# ブラウザの Network タブでAPI呼び出しを確認

# 解決方法
# - Supabase URL/Key の確認
# - RLS ポリシーの確認
# - 認証状態の確認
```

#### 3. TypeScript エラー
```bash
# 型エラーの確認
npm run build

# 解決方法
# - 型定義の確認
# - import/export の確認
# - tsconfig.json の設定確認
```

### デバッグツール

#### ブラウザ開発者ツール
- **Console**: エラーログ、デバッグ出力
- **Network**: API呼び出しの確認
- **Application**: ローカルストレージ、セッション確認

#### React Developer Tools
- コンポーネント階層の確認
- Props と State の監視
- パフォーマンスプロファイリング

#### Supabase Dashboard
- データベースの直接確認
- ログの確認
- RLS ポリシーのテスト

## 📖 コーディング規約

### TypeScript

#### 型定義
```typescript
// ✅ 良い例
interface TaskItemProps {
  task: Task
  onProcess?: () => void
  showControls?: boolean
}

// ❌ 悪い例
interface Props {
  data: any
  callback: Function
}
```

#### 関数定義
```typescript
// ✅ 良い例：明確な型定義
const addTask = async (task: Omit<Task, 'id' | 'created'>): Promise<Task> => {
  // 実装
}

// ❌ 悪い例：型が不明確
const addTask = async (task: any) => {
  // 実装
}
```

### React

#### コンポーネント定義
```typescript
// ✅ 良い例：関数コンポーネント + TypeScript
const TaskItem: React.FC<TaskItemProps> = ({ task, onProcess, showControls = true }) => {
  return (
    <div className="task-item">
      {/* JSX */}
    </div>
  )
}

export default TaskItem
```

#### Hooks の使用
```typescript
// ✅ 良い例：適切な依存配列
useEffect(() => {
  fetchTasks()
}, [user]) // user が変更された時のみ実行

// ❌ 悪い例：依存配列なし
useEffect(() => {
  fetchTasks()
}) // 毎回実行される
```

### CSS（Tailwind）

#### クラス名の順序
```html
<!-- ✅ 良い例：論理的な順序 -->
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">

<!-- ❌ 悪い例：順序がバラバラ -->
<div className="shadow-sm bg-white transition-shadow border-gray-200 flex rounded-lg p-4 hover:shadow-md border items-center justify-between">
```

## 🔍 コードレビューチェックリスト

### 機能性
- [ ] 要件を満たしているか
- [ ] エラーケースが適切に処理されているか
- [ ] エッジケースが考慮されているか

### コード品質
- [ ] TypeScript の型定義が適切か
- [ ] 関数・変数名が分かりやすいか
- [ ] コメントが必要な箇所に記載されているか
- [ ] 重複コードがないか

### パフォーマンス
- [ ] 不要な再描画が発生していないか
- [ ] 重い処理がメモ化されているか
- [ ] 適切な依存配列が設定されているか

### セキュリティ
- [ ] ユーザー入力が適切にバリデーションされているか
- [ ] 機密情報がログに出力されていないか
- [ ] 認証・認可が適切に実装されているか

### UI/UX
- [ ] レスポンシブデザインが実装されているか
- [ ] アクセシビリティが考慮されているか
- [ ] ローディング状態が適切に表示されるか
- [ ] エラー状態が分かりやすく表示されるか

## 🚀 初回タスク提案

### Week 1: 環境構築・理解

#### Day 1-2: セットアップ
- 開発環境構築
- アプリケーション動作確認
- ドキュメント読み込み

#### Day 3-4: コード理解
- 主要コンポーネントのコード読解
- データフローの追跡
- デバッガーでの動作確認

#### Day 5: 小さな修正
- タイポ修正
- スタイルの微調整
- ドキュメントの改善

### Week 2: 機能理解・小機能追加

#### Day 1-2: GTD処理フロー理解
- ProcessingWizard の動作確認
- 各ステップの実装を理解
- テストデータでの動作確認

#### Day 3-4: 小機能追加
- 新しいアイコンの追加
- 既存機能の改善
- エラーメッセージの改善

#### Day 5: テスト作成
- 既存機能のテスト追加
- テストの実行・確認

### Week 3以降: 本格的な開発参加

- 新機能の設計・実装
- パフォーマンス改善
- アーキテクチャ改善の提案

## 📚 推奨学習リソース

### React/TypeScript
- [React公式チュートリアル](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks完全ガイド](https://overreacted.io/a-complete-guide-to-useeffect/)

### Supabase
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [PostgreSQL チュートリアル](https://www.postgresql.org/docs/current/tutorial.html)
- [Row Level Security ガイド](https://supabase.com/docs/guides/auth/row-level-security)

### GTD手法
- 「Getting Things Done」デビッド・アレン著（書籍）
- [GTD公式サイト](https://gettingthingsdone.com/)
- [GTD入門記事](https://lifehacker.com/productivity-101-a-primer-to-the-getting-things-done-1551880955)

### Web開発一般
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [Can I Use](https://caniuse.com/)（ブラウザ対応確認）

## 🤔 よくある質問（FAQ）

### Q1: GTDを知らないのですが、大丈夫ですか？
**A**: 大丈夫です。技術的な実装が主な作業になります。GTDの基本概念は `docs/TECHNICAL_GLOSSARY.md` で学習できます。実際にアプリを使いながら理解を深めてください。

### Q2: React/TypeScript の経験が浅いのですが？
**A**: プロジェクトのコードは学習に適した構造になっています。小さなコンポーネントから読み始めて、徐々に複雑な部分に進んでください。分からない部分は遠慮なく質問してください。

### Q3: Supabase を使ったことがないのですが？
**A**: Supabaseは比較的新しい技術ですが、ドキュメントが充実しています。PostgreSQLの知識があれば理解しやすいです。まずは公式チュートリアルから始めることをお勧めします。

### Q4: どのタスクから始めれば良いですか？
**A**: まずは環境構築を完了し、アプリケーションを実際に動かしてみてください。その後、小さなバグ修正やUI改善から始めることをお勧めします。

### Q5: 質問はどこでできますか？
**A**: 
- 技術的な質問: GitHub Issues
- 緊急の質問: Slack/Discord（チーム内）
- 設計に関する質問: 設計レビューミーティング

## 🎯 成功指標

### 1週間後の目標
- [ ] アプリケーションの基本機能を理解
- [ ] 開発環境で問題なく作業できる
- [ ] 小さな修正を独力で実装できる

### 2週間後の目標
- [ ] GTD処理フローを完全に理解
- [ ] 新しいコンポーネントを作成できる
- [ ] データベース操作を理解

### 1ヶ月後の目標
- [ ] 新機能を設計・実装できる
- [ ] アーキテクチャの改善提案ができる
- [ ] 他のメンバーをサポートできる

## 📞 サポート・連絡先

### 技術的サポート
- **GitHub Issues**: バグ報告、機能要求
- **コードレビュー**: プルリクエストでのフィードバック
- **ペアプログラミング**: 複雑な機能の実装時

### ドキュメント改善
- 分かりにくい部分の指摘
- 追加すべき情報の提案
- 誤字・脱字の報告

---

**🎉 Welcome to Focus Flow!** 

このプロジェクトは、生産性向上とクリーンなコード設計の両方を学べる素晴らしい機会です。分からないことがあれば遠慮なく質問し、一緒に素晴らしいアプリケーションを作り上げましょう！