# データフロー図・シーケンス図

## 概要

Focus Flowアプリケーションにおける主要なユースケースのデータフローとシーケンスを詳細に説明します。

## 1. ユーザー認証フロー

### サインアップシーケンス

```mermaid
sequenceDiagram
    participant U as User
    participant AF as AuthForm
    participant AC as AuthContext
    participant SB as Supabase Auth
    participant DB as Database

    U->>AF: メール・パスワード入力
    AF->>AC: signUp(email, password, displayName)
    AC->>SB: supabase.auth.signUp()
    SB->>DB: users テーブルに挿入
    SB-->>AC: ユーザー作成完了
    AC->>DB: profiles テーブルに挿入
    AC-->>AF: 成功レスポンス
    AF-->>U: 確認メール送信メッセージ表示
```

### サインインシーケンス

```mermaid
sequenceDiagram
    participant U as User
    participant AF as AuthForm
    participant AC as AuthContext
    participant SB as Supabase Auth
    participant App as App

    U->>AF: メール・パスワード入力
    AF->>AC: signIn(email, password)
    AC->>SB: supabase.auth.signInWithPassword()
    SB-->>AC: セッション情報
    AC-->>AF: 認証成功
    AF-->>App: メインアプリにリダイレクト
```

## 2. タスク管理フロー

### タスク作成フロー

```mermaid
sequenceDiagram
    participant U as User
    participant II as InboxInput
    participant TC as TaskContext
    participant SC as SubscriptionContext
    participant DB as Database

    U->>II: タスクタイトル入力
    II->>SC: canCreateTask チェック
    SC-->>II: 使用量制限確認
    
    alt 制限内の場合
        II->>TC: addTask(taskData)
        TC->>DB: tasks テーブルに挿入
        DB-->>TC: 挿入成功
        TC->>SC: incrementTaskUsage()
        SC->>DB: usage_limits テーブル更新
        TC-->>II: タスク作成完了
        II-->>U: UI更新（新しいタスク表示）
    else 制限超過の場合
        II-->>U: エラーメッセージ表示
    end
```

### タスク更新フロー

```mermaid
sequenceDiagram
    participant U as User
    participant TI as TaskItem
    participant TC as TaskContext
    participant DB as Database

    U->>TI: タスク編集・ステータス変更
    TI->>TC: updateTask(id, updates)
    TC->>DB: tasks テーブル更新
    DB-->>TC: 更新成功
    TC-->>TI: ローカル状態更新
    TI-->>U: UI更新
```

## 3. GTD処理ワークフロー

### インボックス処理シーケンス

```mermaid
sequenceDiagram
    participant U as User
    participant IL as InboxList
    participant PW as ProcessingWizard
    participant PC as ProcessContext
    participant TC as TaskContext

    U->>IL: タスクの「処理」ボタンクリック
    IL->>PC: startProcessing(task)
    PC-->>PW: ウィザード表示（ステップ1）
    
    loop 各ステップ
        U->>PW: 選択肢を選択
        PW->>PC: completeStep(step, decision)
        PC->>PC: 次のステップを決定
        
        alt 最終ステップの場合
            PC->>TC: updateTask() または addProject()
            TC->>DB: データベース更新
            PC-->>PW: ウィザード終了
        else 次のステップがある場合
            PC-->>PW: 次のステップ表示
        end
    end
```

### GTD決定フロー

```
ステップ1: それは何か？
    ↓
ステップ2: 行動が必要か？
    ├─ No → 参考資料 / いつか/たぶん / 削除
    └─ Yes
        ↓
ステップ3: 複数ステップか？
    ├─ Yes → プロジェクト作成
    └─ No
        ↓
ステップ4: 2分以内でできるか？
    ├─ Yes → 即座に完了
    └─ No
        ↓
ステップ5: 委任できるか？
    ├─ Yes → 待ち項目
    └─ No
        ↓
ステップ6: 特定の日に実行？
    ├─ Yes → 予定済み
    └─ No → 次のアクション
```

## 4. サブスクリプション管理フロー

### アップグレードシーケンス

```mermaid
sequenceDiagram
    participant U as User
    participant PM as PricingModal
    participant SC as SubscriptionContext
    participant EF as Edge Function
    participant ST as Stripe
    participant WH as Webhook
    participant DB as Database

    U->>PM: "アップグレード"ボタンクリック
    PM->>SC: createCheckoutSession(priceId)
    SC->>EF: stripe-checkout Function呼び出し
    EF->>ST: Checkout Session作成
    ST-->>EF: セッションURL
    EF-->>SC: チェックアウトURL
    SC-->>PM: リダイレクト
    PM-->>U: Stripeチェックアウトページ

    U->>ST: 決済情報入力・送信
    ST->>WH: webhook送信
    WH->>DB: サブスクリプション情報更新
    ST-->>U: 成功ページにリダイレクト
    
    U->>SC: refreshSubscription()
    SC->>DB: 最新のサブスクリプション情報取得
    SC-->>U: UI更新（Pro機能有効化）
```

## 5. 検索・フィルタリングフロー

### 検索実行フロー

```mermaid
sequenceDiagram
    participant U as User
    participant ATL as AllTasksList
    participant SAF as SearchAndFilter
    participant UTS as useTaskSearch
    participant TC as TaskContext

    U->>SAF: 検索条件入力
    SAF->>ATL: onFiltersChange(filters)
    ATL->>UTS: useTaskSearch(tasks, filters)
    UTS->>TC: tasks配列取得
    UTS->>UTS: フィルタリング処理
    UTS-->>ATL: 絞り込み結果
    ATL-->>U: 検索結果表示
```

## 6. エラーハンドリングフロー

### エラー処理パターン

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant Ctx as Context
    participant API as Supabase/Stripe

    C->>API: API呼び出し
    API-->>C: エラーレスポンス
    C->>C: getErrorMessage(error)
    C->>C: setError(userFriendlyMessage)
    C-->>U: エラーメッセージ表示
    
    alt 使用量制限エラーの場合
        C-->>U: アップグレードボタン表示
    else 認証エラーの場合
        C->>Ctx: signOut()
        Ctx-->>U: ログイン画面にリダイレクト
    end
```

## 7. リアルタイム更新フロー（将来実装）

### Supabase Realtime連携

```mermaid
sequenceDiagram
    participant U1 as User1
    participant U2 as User2
    participant TC1 as TaskContext1
    participant TC2 as TaskContext2
    participant RT as Supabase Realtime
    participant DB as Database

    U1->>TC1: タスク更新
    TC1->>DB: データベース更新
    DB->>RT: 変更通知
    RT->>TC2: リアルタイム更新
    TC2-->>U2: UI自動更新
```

## 8. オフライン対応フロー（将来実装）

### オフライン同期

```mermaid
sequenceDiagram
    participant U as User
    participant App as App
    participant LS as LocalStorage
    participant SW as ServiceWorker
    participant DB as Database

    Note over App: オフライン状態
    U->>App: タスク作成
    App->>LS: ローカル保存
    App-->>U: UI更新

    Note over App: オンライン復帰
    App->>SW: 同期開始
    SW->>DB: 保留中の変更を送信
    DB-->>SW: 同期完了
    SW-->>App: 状態更新
    App-->>U: 最新状態表示
```

## データ整合性の保証

### 1. 楽観的更新

- UI を即座に更新
- バックエンドエラー時にロールバック

### 2. 競合解決

- タイムスタンプベースの競合解決
- ユーザーへの競合通知

### 3. トランザクション管理

- 関連データの一貫性保証
- 部分的失敗時のロールバック

## パフォーマンス監視

### 1. メトリクス

- ページロード時間
- API レスポンス時間
- エラー率
- ユーザーエンゲージメント

### 2. 監視ツール

- Supabase Analytics
- ブラウザ Performance API
- カスタムメトリクス収集

## セキュリティデータフロー

### 1. 認証トークンフロー

```
ログイン → JWT取得 → ローカル保存 → API呼び出し時にヘッダーに付与 → 
サーバーサイド検証 → RLSポリシー適用 → データアクセス制御
```

### 2. 権限チェックフロー

```
ユーザーアクション → フロントエンド権限チェック → API呼び出し → 
バックエンド権限チェック → RLSポリシー → データベースアクセス
```