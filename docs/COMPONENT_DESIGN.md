# コンポーネント設計書

## 概要

Focus FlowのReactコンポーネントの詳細設計について説明します。各コンポーネントの責任、props、状態、相互作用を定義します。

## コンポーネント階層

```
App
├── AuthProvider
│   └── LanguageProvider
│       └── Router
│           ├── SuccessPage
│           ├── CancelPage
│           └── ProtectedRoute
│               └── SubscriptionProvider
│                   └── TaskProvider
│                       └── ProcessProvider
│                           ├── Sidebar
│                           ├── MobileNavbar
│                           ├── UserMenu
│                           ├── MainContent
│                           │   ├── UsageBanner
│                           │   └── Routes
│                           │       ├── InboxList
│                           │       ├── AllTasksList
│                           │       ├── NextActionsList
│                           │       ├── WaitingForList
│                           │       ├── ScheduledList
│                           │       ├── ProjectsList
│                           │       ├── SomedayList
│                           │       ├── ReferenceList
│                           │       ├── CompletedList
│                           │       └── DeletedList
│                           ├── ProcessingWizard
│                           └── PricingModal
```

## 主要コンポーネント設計

### 1. App.tsx

**責任**: アプリケーションのルートコンポーネント、プロバイダーの設定

**状態**:
```typescript
interface AppState {
  showPricing: boolean
}
```

**主要機能**:
- Context Providerの階層管理
- ルーティング設定
- グローバル状態の初期化

### 2. AuthForm.tsx

**責任**: ユーザー認証UI

**Props**: なし

**状態**:
```typescript
interface AuthFormState {
  mode: 'signin' | 'signup' | 'reset'
  email: string
  password: string
  displayName: string
  showPassword: boolean
  loading: boolean
  error: string | null
  message: string | null
}
```

**主要機能**:
- フォーム状態管理
- 認証エラーハンドリング
- ユーザーフレンドリーなエラーメッセージ

### 3. TaskItem.tsx

**責任**: 個別タスクの表示・操作

**Props**:
```typescript
interface TaskItemProps {
  task: Task
  onProcess?: () => void
  showControls?: boolean
}
```

**状態**:
```typescript
interface TaskItemState {
  isEditing: boolean
  editTitle: string
  isDropdownOpen: boolean
}
```

**主要機能**:
- タスク情報表示
- インライン編集
- ステータス変更ドロップダウン
- アクションボタン（完了、削除等）

### 4. ProcessingWizard.tsx

**責任**: GTD処理ワークフローのUI

**Props**: なし（ProcessContextから状態取得）

**状態**: ProcessContextで管理

**主要機能**:
- 6ステップのワークフロー表示
- 進捗インジケーター
- ステップ間ナビゲーション
- レスポンシブデザイン

### 5. InboxList.tsx

**責任**: インボックスの表示・管理

**Props**:
```typescript
interface InboxListProps {
  onUpgrade: () => void
}
```

**状態**: TaskContextから取得

**主要機能**:
- インボックスタスク一覧表示
- 新規タスク入力
- 処理ワークフローの開始

## 共通コンポーネント

### 1. SearchAndFilter.tsx

**責任**: 検索・フィルタリング機能

**Props**:
```typescript
interface SearchAndFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  showAdvanced?: boolean
}
```

**機能**:
- テキスト検索
- 複数条件フィルタリング
- Pro機能の制限表示

### 2. UsageBanner.tsx

**責任**: 使用量制限の表示・警告

**Props**:
```typescript
interface UsageBannerProps {
  onUpgrade: () => void
}
```

**表示条件**:
- 無料ユーザーのみ
- 使用量が80%以上
- 制限に達した場合

## ナビゲーションコンポーネント

### 1. Sidebar.tsx

**責任**: デスクトップ用サイドナビゲーション

**機能**:
- ナビゲーションメニュー
- タスク数カウント表示
- アクティブページハイライト
- 進捗インジケーター

### 2. MobileNavbar.tsx

**責任**: モバイル用ナビゲーション

**状態**:
```typescript
interface MobileNavbarState {
  isOpen: boolean
}
```

**機能**:
- ハンバーガーメニュー
- オーバーレイナビゲーション
- タッチフレンドリーUI

### 3. UserMenu.tsx

**責任**: ユーザーメニュー・プロファイル表示

**Props**:
```typescript
interface UserMenuProps {
  onUpgrade?: () => void
}
```

**機能**:
- ユーザー情報表示
- プラン状態表示
- サインアウト機能

## リストコンポーネント

### 共通設計パターン

すべてのリストコンポーネントは以下の共通パターンに従います：

**構造**:
```typescript
const ListComponent: React.FC = () => {
  // 1. Context からデータ取得
  const { getTasksByStatus } = useTaskContext()
  const tasks = getTasksByStatus('status')
  
  // 2. 空状態の処理
  if (tasks.length === 0) {
    return <EmptyState />
  }
  
  // 3. タスク一覧表示
  return (
    <div>
      <Header />
      <TaskList tasks={tasks} />
    </div>
  )
}
```

**共通Props**:
- `onUpgrade?: () => void` - アップグレード促進

### 特殊なリストコンポーネント

#### 1. ProjectsList.tsx

**追加機能**:
- プロジェクト分割モーダル
- 進捗表示
- 関連タスク表示

**状態**:
```typescript
interface ProjectsListState {
  selectedProject: Project | null
}
```

#### 2. ScheduledList.tsx

**追加機能**:
- カレンダービュー
- 日付別グループ化
- 新規タスク追加モーダル

**状態**:
```typescript
interface ScheduledListState {
  viewMode: 'list' | 'calendar'
  currentDate: Date
  selectedDate: Date | null
  showAddTask: boolean
  newTaskTitle: string
}
```

#### 3. WaitingForList.tsx

**追加機能**:
- 担当者編集
- インライン編集機能

**状態**:
```typescript
interface WaitingForListState {
  editingTaskId: string | null
  editingAssignee: string
}
```

## プロセスステップコンポーネント

### 共通設計

**Props**:
```typescript
interface StepProps {
  task: Task
}
```

**機能**:
- ステップ固有のUI表示
- 決定の収集
- 次ステップへの遷移

### 各ステップの詳細

#### Step1What.tsx
- **目的**: タスク内容の明確化
- **入力**: タイトル、説明の編集
- **出力**: 更新されたタスク情報

#### Step2ActionRequired.tsx
- **目的**: 行動の必要性判断
- **選択肢**: はい / 参考資料 / いつか/たぶん / 削除
- **出力**: 行動要否の決定

#### Step3MultiStep.tsx
- **目的**: 複数ステップの判断
- **制限**: プロジェクト作成制限チェック
- **出力**: プロジェクト化の決定

#### Step4TwoMinutes.tsx
- **目的**: 2分ルールの適用
- **入力**: 時間見積もり
- **出力**: 即座実行 or 延期の決定

#### Step5Delegate.tsx
- **目的**: 委任の判断
- **入力**: 委任先の指定
- **出力**: 委任の決定

#### Step6Schedule.tsx
- **目的**: スケジューリングの判断
- **入力**: 実行日の指定
- **出力**: スケジュール設定 or 次のアクション

## サブスクリプションコンポーネント

### 1. PricingModal.tsx

**責任**: プラン選択・アップグレードUI

**状態**:
```typescript
interface PricingModalState {
  loading: boolean
}
```

**機能**:
- プラン比較表示
- Stripe Checkout連携
- 現在のプラン状態表示

### 2. SuccessPage.tsx / CancelPage.tsx

**責任**: 決済結果ページ

**機能**:
- 決済結果の表示
- 適切なメッセージ表示
- アプリへの復帰ナビゲーション

## コンポーネント間通信

### 1. Props Down, Events Up パターン

```typescript
// 親コンポーネント
<ChildComponent 
  data={data}
  onAction={handleAction}
/>

// 子コンポーネント
const ChildComponent = ({ data, onAction }) => {
  return (
    <button onClick={() => onAction(data.id)}>
      {data.title}
    </button>
  )
}
```

### 2. Context経由の状態共有

```typescript
// Context使用
const { tasks, addTask } = useTaskContext()

// 状態更新
await addTask(newTask)
// → 自動的に全関連コンポーネントが更新
```

### 3. カスタムフック経由のロジック共有

```typescript
// 検索ロジックの共有
const filteredTasks = useTaskSearch(tasks, filters)
```

## エラーハンドリング設計

### 1. エラー境界（Error Boundary）

```typescript
// 将来実装予定
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // エラーログ送信
    // フォールバックUI表示
  }
}
```

### 2. 非同期エラーハンドリング

```typescript
const [error, setError] = useState<string | null>(null)

try {
  await apiCall()
} catch (error) {
  setError(getErrorMessage(error))
}
```

### 3. ユーザーフレンドリーエラー

```typescript
const getErrorMessage = (error: any): string => {
  // 技術的エラーを分かりやすい日本語に変換
  if (error.message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  // その他のエラーパターン...
}
```

## アクセシビリティ設計

### 1. キーボードナビゲーション

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}
```

### 2. スクリーンリーダー対応

```typescript
<button
  aria-label="タスクを完了としてマーク"
  title="完了"
  onClick={handleComplete}
>
  <CheckCircle className="w-4 h-4" />
</button>
```

### 3. フォーカス管理

```typescript
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus()
  }
}, [isOpen])
```

## パフォーマンス最適化

### 1. メモ化

```typescript
// 重い計算のキャッシュ
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// コンポーネントのメモ化
export default React.memo(TaskItem)
```

### 2. 仮想化（将来実装）

```typescript
// 大量データの効率的表示
import { FixedSizeList as List } from 'react-window'

const VirtualizedTaskList = ({ tasks }) => (
  <List
    height={600}
    itemCount={tasks.length}
    itemSize={80}
    itemData={tasks}
  >
    {TaskItemRenderer}
  </List>
)
```

### 3. 遅延読み込み

```typescript
// 重いコンポーネントの遅延読み込み
const ProcessingWizard = React.lazy(() => 
  import('./Process/ProcessingWizard')
)

// 使用時
<Suspense fallback={<Loading />}>
  <ProcessingWizard />
</Suspense>
```

## テスト設計

### 1. 単体テスト

```typescript
// TaskItem.test.tsx
describe('TaskItem', () => {
  it('should display task title', () => {
    render(<TaskItem task={mockTask} />)
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
  })
  
  it('should call onProcess when process button clicked', () => {
    const onProcess = jest.fn()
    render(<TaskItem task={mockTask} onProcess={onProcess} />)
    fireEvent.click(screen.getByRole('button', { name: /処理/ }))
    expect(onProcess).toHaveBeenCalled()
  })
})
```

### 2. 統合テスト

```typescript
// InboxList.integration.test.tsx
describe('InboxList Integration', () => {
  it('should add task and update list', async () => {
    render(
      <TaskProvider>
        <InboxList onUpgrade={jest.fn()} />
      </TaskProvider>
    )
    
    const input = screen.getByPlaceholderText(/インボックスに追加/)
    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.submit(input.closest('form'))
    
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument()
    })
  })
})
```

## スタイリング設計

### 1. Tailwind CSS クラス設計

#### 色彩システム
```typescript
const colorSystem = {
  primary: 'blue-500',
  secondary: 'indigo-600',
  success: 'green-500',
  warning: 'yellow-500',
  error: 'red-500',
  info: 'blue-400',
}

const statusColors = {
  inbox: 'gray',
  next: 'blue',
  waiting: 'orange',
  scheduled: 'purple',
  project: 'green',
  someday: 'teal',
  reference: 'indigo',
  completed: 'green',
  deleted: 'red',
}
```

#### スペーシングシステム
```typescript
const spacing = {
  xs: 'p-1',      // 4px
  sm: 'p-2',      // 8px
  md: 'p-3',      // 12px
  lg: 'p-4',      // 16px
  xl: 'p-6',      // 24px
  '2xl': 'p-8',   // 32px
}
```

### 2. レスポンシブデザイン

#### ブレークポイント戦略
```typescript
const breakpoints = {
  sm: '640px',   // モバイル（大）
  md: '768px',   // タブレット
  lg: '1024px',  // デスクトップ（小）
  xl: '1280px',  // デスクトップ（大）
}
```

#### モバイルファースト設計
```css
/* モバイル（デフォルト） */
.component {
  @apply p-2 text-sm;
}

/* タブレット以上 */
@screen md {
  .component {
    @apply p-4 text-base;
  }
}

/* デスクトップ以上 */
@screen lg {
  .component {
    @apply p-6 text-lg;
  }
}
```

## 状態管理設計

### 1. ローカル状態 vs グローバル状態

#### ローカル状態（useState）
- UI状態（モーダル開閉、フォーム入力）
- 一時的な状態
- 単一コンポーネント内の状態

#### グローバル状態（Context）
- ユーザー認証状態
- タスク・プロジェクトデータ
- サブスクリプション情報

### 2. 状態更新パターン

#### 楽観的更新
```typescript
const updateTask = async (id: string, updates: Partial<Task>) => {
  // 1. UI を即座に更新
  setTasks(prev => prev.map(task => 
    task.id === id ? { ...task, ...updates } : task
  ))
  
  try {
    // 2. サーバーに送信
    await supabase.from('tasks').update(updates).eq('id', id)
  } catch (error) {
    // 3. エラー時はロールバック
    setTasks(prev => prev.map(task => 
      task.id === id ? originalTask : task
    ))
    throw error
  }
}
```

## 国際化設計

### 1. 翻訳システム

```typescript
// LanguageContext
const translations = {
  'task.add': {
    en: 'Add Task',
    ja: 'タスクを追加'
  }
}

// 使用方法
const { t } = useLanguage()
const buttonText = t('task.add')
```

### 2. 日付・数値フォーマット

```typescript
// 地域に応じたフォーマット
const formatDate = (date: Date, locale: string = 'ja-JP') => {
  return date.toLocaleDateString(locale)
}

const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency
  }).format(amount)
}
```

## 将来の拡張設計

### 1. テーマシステム

```typescript
// ThemeContext
interface Theme {
  colors: ColorPalette
  spacing: SpacingScale
  typography: TypographyScale
}

const themes = {
  light: lightTheme,
  dark: darkTheme,
  auto: systemTheme,
}
```

### 2. プラグインシステム

```typescript
// プラグイン拡張ポイント
interface Plugin {
  name: string
  version: string
  components: Record<string, React.ComponentType>
  hooks: Record<string, Function>
}
```

### 3. マイクロフロントエンド対応

```typescript
// モジュール分割
const modules = {
  auth: () => import('./modules/auth'),
  tasks: () => import('./modules/tasks'),
  projects: () => import('./modules/projects'),
  subscription: () => import('./modules/subscription'),
}
```

## 品質保証

### 1. コンポーネント品質チェックリスト

- [ ] TypeScript型定義完備
- [ ] Props検証実装
- [ ] エラーハンドリング実装
- [ ] アクセシビリティ対応
- [ ] レスポンシブデザイン
- [ ] 単体テスト作成
- [ ] ドキュメント作成

### 2. パフォーマンスチェックリスト

- [ ] 不要な再描画防止
- [ ] 重い処理のメモ化
- [ ] 適切なキー設定
- [ ] バンドルサイズ最適化
- [ ] 画像最適化
- [ ] 遅延読み込み実装

### 3. セキュリティチェックリスト

- [ ] XSS対策実装
- [ ] 入力値検証
- [ ] 認証状態チェック
- [ ] 権限チェック
- [ ] 機密情報の適切な取り扱い