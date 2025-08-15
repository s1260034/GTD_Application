# 開発標準・ガイドライン

## 概要

Focus Flow プロジェクトの開発標準とコーディングガイドラインです。一貫性のある高品質なコードを維持するための規則と推奨事項を定義します。

## 📝 コーディング規約

### TypeScript 規約

#### 1. 型定義

**インターフェース命名**
```typescript
// ✅ 良い例：明確で説明的な名前
interface TaskItemProps {
  task: Task
  onProcess?: () => void
  showControls?: boolean
}

interface UserSubscriptionData {
  customerId: string
  subscriptionId?: string
  status: SubscriptionStatus
}

// ❌ 悪い例：曖昧な名前
interface Props {
  data: any
  callback: Function
}
```

**型の使い分け**
```typescript
// ✅ interface を優先（拡張可能）
interface Task {
  id: string
  title: string
  status: TaskStatus
}

// type は Union型や計算型で使用
type TaskStatus = 'inbox' | 'next' | 'waiting' | 'scheduled'
type TaskWithProject = Task & { project: Project }
```

**Utility Types の活用**
```typescript
// ✅ 既存の型から派生
type CreateTaskData = Omit<Task, 'id' | 'created'>
type UpdateTaskData = Partial<Pick<Task, 'title' | 'description' | 'status'>>

// ✅ 関数の戻り値型を推論
type AddTaskResult = ReturnType<typeof addTask>
```

#### 2. 関数定義

**非同期関数**
```typescript
// ✅ 良い例：明確な戻り値型
const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
  
  if (error) throw error
  return data || []
}

// ✅ エラーハンドリング付き
const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to update task:', error)
    throw new Error('タスクの更新に失敗しました')
  }
}
```

**イベントハンドラー**
```typescript
// ✅ 良い例：型安全なイベントハンドラー
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  // 処理
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}
```

### React 規約

#### 1. コンポーネント定義

**関数コンポーネント**
```typescript
// ✅ 良い例：React.FC を使用
const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onProcess, 
  showControls = true 
}) => {
  return (
    <div className="task-item">
      {/* JSX */}
    </div>
  )
}

export default TaskItem
```

**Props のデフォルト値**
```typescript
// ✅ 良い例：デストラクチャリングでデフォルト値
const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children 
}) => {
  // 実装
}
```

#### 2. Hooks の使用

**useState**
```typescript
// ✅ 良い例：明確な初期値と型
const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [tasks, setTasks] = useState<Task[]>([])
```

**useEffect**
```typescript
// ✅ 良い例：適切な依存配列
useEffect(() => {
  if (user) {
    fetchTasks()
  }
}, [user]) // user が変更された時のみ実行

// ✅ クリーンアップ関数
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handleTaskChange)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

**カスタムフック**
```typescript
// ✅ 良い例：再利用可能なロジック
const useTaskSearch = (tasks: Task[], filters: SearchFilters) => {
  return useMemo(() => {
    return tasks.filter(task => {
      // フィルタリングロジック
    })
  }, [tasks, filters])
}
```

#### 3. 条件付きレンダリング

```typescript
// ✅ 良い例：明確な条件分岐
{tasks.length === 0 ? (
  <EmptyState message="タスクがありません" />
) : (
  <TaskList tasks={tasks} />
)}

// ✅ 短絡評価の適切な使用
{error && <ErrorMessage message={error} />}
{loading && <LoadingSpinner />}
```

### CSS（Tailwind）規約

#### 1. クラス名の順序

**推奨順序**
1. レイアウト（`flex`, `grid`, `block`）
2. ポジション（`relative`, `absolute`）
3. サイズ（`w-`, `h-`, `max-w-`）
4. スペーシング（`p-`, `m-`, `space-`）
5. 色（`bg-`, `text-`, `border-`）
6. タイポグラフィ（`text-`, `font-`）
7. 装飾（`rounded-`, `shadow-`）
8. インタラクション（`hover:`, `focus:`）
9. アニメーション（`transition-`, `animate-`）

```html
<!-- ✅ 良い例 -->
<div className="flex items-center justify-between w-full p-4 bg-white text-gray-800 font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow">
```

#### 2. レスポンシブデザイン

```html
<!-- ✅ 良い例：モバイルファースト -->
<div className="p-2 text-sm md:p-4 md:text-base lg:p-6 lg:text-lg">

<!-- ✅ 条件付きクラス -->
<div className={`
  p-4 rounded-lg border
  ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
`}>
```

#### 3. カスタムスタイル

```typescript
// ✅ 良い例：Tailwind で表現できない場合のみカスタムCSS
const customStyles = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

// ❌ 悪い例：Tailwind で表現可能なスタイル
const badStyles = {
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '8px'
}
```

## 🏗 アーキテクチャ規約

### ファイル構成

#### ディレクトリ構造
```
src/
├── components/          # UIコンポーネント
│   ├── Auth/           # 認証関連
│   ├── Inbox/          # インボックス機能
│   ├── Lists/          # 各種リスト
│   ├── Navigation/     # ナビゲーション
│   ├── Process/        # GTD処理
│   ├── Subscription/   # サブスクリプション
│   └── common/         # 共通コンポーネント
├── contexts/           # React Context
├── hooks/              # カスタムフック
├── lib/                # ライブラリ設定
├── types/              # 型定義
└── utils/              # ユーティリティ関数
```

#### ファイル命名規則
```
# コンポーネント：PascalCase
TaskItem.tsx
ProcessingWizard.tsx

# フック：camelCase + use プレフィックス
useTaskSearch.ts
useSubscription.ts

# ユーティリティ：camelCase
dateUtils.ts
helpers.ts

# 型定義：camelCase
index.ts
taskTypes.ts

# 設定ファイル：kebab-case
stripe-config.ts
supabase-config.ts
```

### コンポーネント設計原則

#### 1. Single Responsibility Principle
```typescript
// ✅ 良い例：単一責任
const TaskTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="font-medium text-gray-800">{title}</h3>
)

const TaskStatus: React.FC<{ status: TaskStatus }> = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
    {getStatusLabel(status)}
  </span>
)

// ❌ 悪い例：複数の責任
const TaskEverything: React.FC<TaskProps> = ({ task }) => {
  // タイトル表示、ステータス表示、編集機能、削除機能...
  // 100行以上のコンポーネント
}
```

#### 2. Props Interface 設計

```typescript
// ✅ 良い例：明確で拡張可能
interface TaskItemProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  showControls?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

// ❌ 悪い例：曖昧で拡張困難
interface TaskItemProps {
  data: any
  callback: Function
  options: object
}
```

### Context 設計原則

#### 1. Context の分割

```typescript
// ✅ 良い例：責任別に分割
const AuthContext = createContext<AuthContextType>()
const TaskContext = createContext<TaskContextType>()
const SubscriptionContext = createContext<SubscriptionContextType>()

// ❌ 悪い例：全てを一つのContextに
const AppContext = createContext<{
  user: User
  tasks: Task[]
  subscription: Subscription
  // その他全ての状態...
}>()
```

#### 2. Context Provider の最適化

```typescript
// ✅ 良い例：メモ化で不要な再描画を防止
const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  
  const contextValue = useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
  }), [tasks])
  
  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}
```

## 🧪 テスト規約

### テストファイル命名

```
# コンポーネントテスト
TaskItem.test.tsx
ProcessingWizard.test.tsx

# フックテスト
useTaskSearch.test.ts

# ユーティリティテスト
dateUtils.test.ts
```

### テスト構造

```typescript
// ✅ 良い例：構造化されたテスト
describe('TaskItem', () => {
  describe('表示', () => {
    it('should display task title', () => {
      // テスト実装
    })
    
    it('should display task status', () => {
      // テスト実装
    })
  })
  
  describe('操作', () => {
    it('should call onEdit when edit button clicked', () => {
      // テスト実装
    })
    
    it('should call onDelete when delete button clicked', () => {
      // テスト実装
    })
  })
  
  describe('条件付き表示', () => {
    it('should hide controls when showControls is false', () => {
      // テスト実装
    })
  })
})
```

### モックの使用

```typescript
// ✅ 良い例：適切なモック
const mockTask: Task = {
  id: 'test-id',
  title: 'Test Task',
  status: 'inbox',
  created: new Date('2024-01-01'),
}

const mockOnProcess = jest.fn()

// ✅ Context のモック
const MockTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mockValue = {
    tasks: [mockTask],
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  }
  
  return (
    <TaskContext.Provider value={mockValue}>
      {children}
    </TaskContext.Provider>
  )
}
```

## 🗃 データベース規約

### マイグレーション

#### ファイル命名
```
# 形式：説明的な名前（番号なし）
create_tasks_table.sql
add_task_priority_column.sql
update_user_settings_schema.sql
```

#### マイグレーション構造
```sql
/*
  # タスクテーブルの作成
  
  1. 新しいテーブル
    - `tasks` テーブル
      - `id` (uuid, primary key)
      - `title` (varchar, required)
      - `status` (varchar, default 'inbox')
  
  2. セキュリティ
    - RLS を有効化
    - ユーザーは自分のタスクのみアクセス可能
*/

-- テーブル作成
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'inbox',
  created_at timestamptz DEFAULT now()
);

-- RLS 有効化
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can access own tasks"
  ON tasks FOR ALL TO public
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);
```

### クエリ規約

```typescript
// ✅ 良い例：型安全なクエリ
const { data, error } = await supabase
  .from('tasks')
  .select('id, title, status, created_at')
  .eq('user_id', userId)
  .eq('status', 'inbox')
  .order('created_at', { ascending: false })

// ✅ エラーハンドリング
if (error) {
  console.error('Database error:', error)
  throw new Error('タスクの取得に失敗しました')
}
```

## 🎨 UI/UX 規約

### デザインシステム

#### カラーパレット
```typescript
const colors = {
  // プライマリー
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // ステータス色
  status: {
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
}
```

#### スペーシング
```typescript
// 8px グリッドシステム
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
}
```

#### タイポグラフィ
```typescript
const typography = {
  // 見出し
  h1: 'text-2xl font-bold text-gray-800',
  h2: 'text-xl font-semibold text-gray-800',
  h3: 'text-lg font-medium text-gray-800',
  
  // 本文
  body: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // リンク
  link: 'text-blue-600 hover:text-blue-700 underline',
}
```

### アクセシビリティ

#### 必須要件
```typescript
// ✅ 良い例：適切な aria-label
<button
  aria-label="タスクを完了としてマーク"
  onClick={handleComplete}
>
  <CheckCircle className="w-4 h-4" />
</button>

// ✅ フォーカス管理
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus()
  }
}, [isOpen])

// ✅ キーボードナビゲーション
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}
```

#### カラーコントラスト
```css
/* ✅ 良い例：十分なコントラスト比 */
.text-primary { color: #1d4ed8; } /* 4.5:1 以上 */
.text-secondary { color: #6b7280; } /* 4.5:1 以上 */

/* ❌ 悪い例：コントラスト不足 */
.text-light { color: #d1d5db; } /* 3:1 未満 */
```

## 🔐 セキュリティ規約

### 認証・認可

```typescript
// ✅ 良い例：認証状態の確認
const ProtectedComponent: React.FC = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return <div>保護されたコンテンツ</div>
}

// ✅ 権限チェック
const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth()
  
  if (!isAdmin) {
    throw new Error('管理者権限が必要です')
  }
  
  return <div>管理者パネル</div>
}
```

### 入力値検証

```typescript
// ✅ 良い例：フロントエンド検証
const validateTaskInput = (title: string): string | null => {
  if (!title.trim()) {
    return 'タスクタイトルは必須です'
  }
  
  if (title.length > 255) {
    return 'タスクタイトルは255文字以内で入力してください'
  }
  
  return null
}

// ✅ サニタイゼーション
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}
```

### 機密情報の取り扱い

```typescript
// ✅ 良い例：環境変数の使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ❌ 悪い例：ハードコーディング
const supabaseUrl = 'https://abc123.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// ✅ ログ出力時の注意
console.log('User logged in:', { userId: user.id }) // OK
console.log('Auth token:', token) // ❌ 機密情報をログ出力しない
```

## 📊 パフォーマンス規約

### React パフォーマンス

#### メモ化
```typescript
// ✅ 良い例：適切なメモ化
const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
  const expensiveValue = useMemo(() => {
    return heavyCalculation(data)
  }, [data])
  
  const handleAction = useCallback((id: string) => {
    onAction(id)
  }, [onAction])
  
  return <div>{/* JSX */}</div>
})

// ✅ 依存配列の最適化
useEffect(() => {
  fetchData()
}, [userId, status]) // 必要な依存関係のみ
```

#### リスト最適化
```typescript
// ✅ 良い例：安定したキー
{tasks.map(task => (
  <TaskItem key={task.id} task={task} />
))}

// ❌ 悪い例：不安定なキー
{tasks.map((task, index) => (
  <TaskItem key={index} task={task} />
))}
```

### バンドル最適化

```typescript
// ✅ 良い例：動的インポート
const ProcessingWizard = React.lazy(() => 
  import('./Process/ProcessingWizard')
)

// ✅ 使用時
<Suspense fallback={<LoadingSpinner />}>
  <ProcessingWizard />
</Suspense>
```

## 🚨 エラーハンドリング規約

### エラーメッセージ

```typescript
// ✅ 良い例：ユーザーフレンドリーなメッセージ
const getErrorMessage = (error: any): string => {
  if (error.message?.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  
  if (error.message?.includes('User already registered')) {
    return 'このメールアドレスは既に登録されています。'
  }
  
  // デフォルトメッセージ
  return 'エラーが発生しました。しばらく時間をおいてから再度お試しください。'
}
```

### エラー境界

```typescript
// ✅ 良い例：エラー境界の実装（将来）
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // エラー報告サービスに送信
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

## 📖 ドキュメント規約

### コメント

```typescript
// ✅ 良い例：なぜそうするかを説明
/**
 * GTDの2分ルールを適用してタスクを処理する
 * 2分以内で完了できる場合は即座に完了状態にする
 */
const applyTwoMinuteRule = (task: Task, timeEstimate: number): TaskStatus => {
  // 2分 = 120秒で判定
  return timeEstimate <= 120 ? 'completed' : 'next'
}

// ❌ 悪い例：何をするかを説明（コードを見れば分かる）
/**
 * タスクのステータスを更新する
 */
const updateTaskStatus = (taskId: string, status: TaskStatus) => {
  // 実装
}
```

### JSDoc

```typescript
/**
 * タスクを指定されたステータスに移動する
 * 
 * @param taskId - 移動するタスクのID
 * @param status - 移動先のステータス
 * @param options - 追加オプション
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await moveTaskToStatus('task-123', 'next')
 * ```
 */
const moveTaskToStatus = async (
  taskId: string, 
  status: TaskStatus,
  options?: MoveOptions
): Promise<void> => {
  // 実装
}
```

## 🔄 Git 規約

### ブランチ命名

```bash
# 機能追加
feature/task-tags
feature/calendar-integration

# バグ修正
bugfix/inbox-input-validation
bugfix/auth-error-handling

# 緊急修正
hotfix/security-vulnerability
hotfix/payment-processing

# ドキュメント
docs/api-specification
docs/component-guide
```

### コミットメッセージ

```bash
# 形式
<type>(<scope>): <subject>

<body>

<footer>

# 例
feat(inbox): add task creation with time estimate

- Add time estimation field to task creation form
- Update TaskContext to handle time estimates
- Add validation for time estimate input

Closes #123
```

#### Type 一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（機能に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

## 📋 コードレビューガイドライン

### レビュー観点

#### 1. 機能性
- [ ] 要件を満たしているか
- [ ] エラーケースが適切に処理されているか
- [ ] エッジケースが考慮されているか

#### 2. 設計
- [ ] 適切な責任分離ができているか
- [ ] 再利用可能な設計になっているか
- [ ] 将来の拡張に対応できるか

#### 3. パフォーマンス
- [ ] 不要な再描画が発生していないか
- [ ] 重い処理がメモ化されているか
- [ ] バンドルサイズへの影響は適切か

#### 4. セキュリティ
- [ ] 入力値検証が実装されているか
- [ ] 認証・認可が適切か
- [ ] 機密情報の取り扱いが適切か

### レビューコメント例

```markdown
## 🎯 提案
この部分は `useMemo` を使用することで、パフォーマンスが向上すると思います。

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === 'inbox')
}, [tasks])
```

## ❓ 質問
この条件分岐の意図を教えてください。特定のエッジケースを考慮されているのでしょうか？

## 🐛 問題
この実装だと、ユーザーが大量のタスクを持っている場合にパフォーマンスの問題が発生する可能性があります。

## 👍 良い点
エラーハンドリングが丁寧で、ユーザーに分かりやすいメッセージが表示されますね！
```

## 🚀 リリース規約

### バージョニング

**Semantic Versioning**
```
MAJOR.MINOR.PATCH

例：1.2.3
- MAJOR: 破壊的変更
- MINOR: 新機能追加
- PATCH: バグ修正
```

### リリースノート

```markdown
# v1.2.0 - 2024-01-15

## 🎉 新機能
- タスクにタグ機能を追加
- カレンダービューを実装
- 高度な検索・フィルター機能（Pro限定）

## 🐛 バグ修正
- インボックス入力時の文字数制限を修正
- モバイルでのナビゲーション表示を改善

## 🔧 改善
- パフォーマンスの最適化
- エラーメッセージの改善

## 💔 破壊的変更
なし

## 📊 統計
- 新規コミット: 23
- 修正されたバグ: 8
- 新規テスト: 15
```

## 📈 品質メトリクス

### コード品質

#### 目標値
- **テストカバレッジ**: 80%以上
- **TypeScript strict**: 100%
- **ESLint エラー**: 0
- **循環的複雑度**: 10以下

#### 測定方法
```bash
# テストカバレッジ
npm run test:coverage

# TypeScript チェック
npm run type-check

# Linting
npm run lint

# ビルド確認
npm run build
```

### パフォーマンス

#### 目標値
- **Lighthouse Score**: 90以上
- **First Contentful Paint**: 1.5秒以下
- **Largest Contentful Paint**: 2.5秒以下
- **Cumulative Layout Shift**: 0.1以下

## 🎓 継続的学習

### 技術キャッチアップ

#### 定期的な学習項目
- React の新機能（年2回のメジャーアップデート）
- TypeScript の新機能（3ヶ月ごと）
- Supabase の新機能（月次）
- Web標準の更新（随時）

#### 学習方法
- 公式ドキュメントの定期確認
- 技術ブログ・記事の購読
- カンファレンス・勉強会への参加
- チーム内での知識共有

### コードレビューでの学習

#### レビュー時の学習ポイント
- 新しいパターンや手法の発見
- 他のメンバーのコーディングスタイル
- 設計思想の理解
- ベストプラクティスの共有

---

**📝 注意**: この規約は生きたドキュメントです。プロジェクトの成長に合わせて定期的に見直し、改善していきます。新しい発見や改善提案があれば、積極的に共有してください。