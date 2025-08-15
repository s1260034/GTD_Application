# フロントエンドアーキテクチャ設計書

## 概要

Focus FlowのReactフロントエンドアーキテクチャについて詳細に説明します。

## 技術スタック

- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Tailwind CSS**: スタイリング
- **React Router DOM**: ルーティング
- **Lucide React**: アイコン
- **Supabase JS**: バックエンド連携

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Auth/           # 認証関連
│   │   ├── AuthForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Inbox/          # インボックス機能
│   │   ├── InboxList.tsx
│   │   └── InboxInput.tsx
│   ├── Lists/          # 各種リスト表示
│   │   ├── AllTasksList.tsx
│   │   ├── NextActionsList.tsx
│   │   ├── WaitingForList.tsx
│   │   ├── ScheduledList.tsx
│   │   ├── ProjectsList.tsx
│   │   ├── SomedayList.tsx
│   │   ├── ReferenceList.tsx
│   │   ├── CompletedList.tsx
│   │   └── DeletedList.tsx
│   ├── Navigation/     # ナビゲーション
│   │   ├── Sidebar.tsx
│   │   ├── MobileNavbar.tsx
│   │   └── UserMenu.tsx
│   ├── Process/        # GTD処理ウィザード
│   │   ├── ProcessingWizard.tsx
│   │   └── steps/
│   │       ├── Step1What.tsx
│   │       ├── Step2ActionRequired.tsx
│   │       ├── Step3MultiStep.tsx
│   │       ├── Step4TwoMinutes.tsx
│   │       ├── Step5Delegate.tsx
│   │       └── Step6Schedule.tsx
│   ├── Subscription/   # サブスクリプション管理
│   │   ├── PricingModal.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── CancelPage.tsx
│   │   └── UsageBanner.tsx
│   └── common/         # 共通コンポーネント
│       ├── TaskItem.tsx
│       └── SearchAndFilter.tsx
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   ├── TaskContext.tsx
│   ├── ProcessContext.tsx
│   ├── SubscriptionContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # カスタムフック
│   └── useTaskSearch.ts
├── lib/                # ライブラリ設定
│   └── supabase.ts
├── types/              # TypeScript型定義
│   └── index.ts
├── utils/              # ユーティリティ関数
│   ├── dateUtils.ts
│   └── helpers.ts
└── stripe-config.ts    # Stripe設定
```

## 状態管理アーキテクチャ

### Context構成

1. **AuthContext**
   - **責任**: ユーザー認証状態の管理
   - **状態**: `user`, `session`, `loading`
   - **アクション**: `signIn`, `signUp`, `signOut`, `resetPassword`

2. **TaskContext**
   - **責任**: タスクとプロジェクトの状態管理
   - **状態**: `tasks[]`, `projects[]`, `loading`
   - **アクション**: CRUD操作、ステータス変更、検索

3. **ProcessContext**
   - **責任**: GTD処理ウィザードの状態管理
   - **状態**: `currentProcessing`, `currentStep`
   - **アクション**: `startProcessing`, `completeStep`, `cancelProcessing`

4. **SubscriptionContext**
   - **責任**: サブスクリプションと使用量制限の管理
   - **状態**: `subscription`, `usageLimits`, `isPro`
   - **アクション**: `createCheckoutSession`, `refreshSubscription`

5. **LanguageContext**
   - **責任**: 多言語対応（現在は日本語のみ）
   - **状態**: `language`, 翻訳関数
   - **アクション**: `setLanguage`, `t()`

## コンポーネント設計パターン

### 1. Container/Presentational パターン

**Container Components** (ロジック担当):
- `InboxList`, `NextActionsList`, `ProjectsList`
- Context からデータを取得
- ビジネスロジックを処理

**Presentational Components** (表示担当):
- `TaskItem`, `SearchAndFilter`
- propsでデータを受け取り
- UIの描画のみ担当

### 2. Compound Component パターン

**ProcessingWizard**:
- メインコンポーネントが全体の状態を管理
- 各ステップコンポーネントが個別の処理を担当

### 3. Render Props / Custom Hooks パターン

**useTaskSearch**:
- 検索・フィルタリングロジックを再利用可能な形で提供
- 複数のコンポーネントで利用

## データフロー

### 1. タスク作成フロー

```
InboxInput → TaskContext.addTask() → Supabase.insert() → 状態更新 → UI再描画
```

### 2. GTD処理フロー

```
TaskItem.onProcess() → ProcessContext.startProcessing() → ProcessingWizard表示 → 
各ステップでの決定 → TaskContext.updateTask() → 状態更新
```

### 3. サブスクリプションフロー

```
PricingModal → SubscriptionContext.createCheckoutSession() → 
stripe-checkout Function → Stripe Checkout → webhook → 
stripe-webhook Function → データベース更新
```

## ルーティング設計

### 保護されたルート

すべてのメインアプリケーションルートは `ProtectedRoute` でラップされ、認証が必要です。

```typescript
<Route path="/*" element={
  <ProtectedRoute>
    <MainApp />
  </ProtectedRoute>
} />
```

### パブリックルート

- `/subscription/success`: 決済成功ページ
- `/subscription/cancel`: 決済キャンセルページ

### メインアプリケーションルート

- `/`: インボックス
- `/search`: タスク検索
- `/next`: 次のアクション
- `/waiting`: 待ち項目
- `/scheduled`: 予定済み
- `/projects`: プロジェクト
- `/someday`: いつか/たぶん
- `/reference`: 参考資料
- `/completed`: 完了済み
- `/deleted`: ゴミ箱

## レスポンシブデザイン

### ブレークポイント

- **Mobile**: `< 768px`
- **Desktop**: `≥ 768px`

### モバイル対応

- `MobileNavbar`: モバイル専用ナビゲーション
- `Sidebar`: デスクトップ専用サイドバー
- タッチフレンドリーなUI要素

## パフォーマンス最適化

### 1. コンポーネント最適化

- `React.memo()` で不要な再描画を防止
- `useMemo()` で重い計算をキャッシュ
- `useCallback()` で関数の再生成を防止

### 2. 状態管理最適化

- Context の分割により不要な再描画を最小化
- ローカル状態とグローバル状態の適切な使い分け

### 3. バンドル最適化

- Vite による高速ビルド
- Tree shaking による不要コードの除去
- 動的インポートによるコード分割（必要に応じて）

## エラーハンドリング

### 1. エラー境界

```typescript
// 将来的に実装予定
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. 非同期エラー処理

```typescript
try {
  await addTask(newTask)
} catch (error) {
  setError(getErrorMessage(error))
}
```

### 3. ユーザーフレンドリーなエラーメッセージ

- 技術的なエラーを分かりやすい日本語に変換
- 解決方法の提示
- 適切なUI表示（バナー、モーダル等）

## アクセシビリティ

### 1. キーボードナビゲーション

- すべてのインタラクティブ要素にフォーカス可能
- Escキーでモーダルを閉じる
- Enterキーでフォーム送信

### 2. スクリーンリーダー対応

- 適切な `aria-label` 属性
- セマンティックなHTML要素の使用
- フォーカス管理

### 3. カラーコントラスト

- WCAG 2.1 AA基準に準拠
- 十分なコントラスト比の確保

## テスト戦略

### 1. 単体テスト

- ユーティリティ関数のテスト
- カスタムフックのテスト
- コンポーネントの単体テスト

### 2. 統合テスト

- Context とコンポーネントの連携テスト
- API呼び出しのモックテスト

### 3. E2Eテスト

- 主要なユーザーフローのテスト
- GTD処理ワークフローのテスト

## セキュリティ考慮事項

### 1. XSS対策

- ユーザー入力の適切なエスケープ
- `dangerouslySetInnerHTML` の使用禁止

### 2. 認証トークン管理

- トークンの安全な保存
- 自動リフレッシュ機能

### 3. 入力値検証

- フロントエンドでの基本的な検証
- バックエンドでの厳密な検証

## 将来の拡張性

### 1. 国際化 (i18n)

- `LanguageContext` の拡張
- 翻訳ファイルの追加

### 2. テーマシステム

- `ThemeContext` の活用
- ダークモード対応

### 3. オフライン対応

- Service Worker の実装
- ローカルストレージの活用

### 4. リアルタイム機能

- Supabase Realtime の活用
- 複数デバイス間の同期