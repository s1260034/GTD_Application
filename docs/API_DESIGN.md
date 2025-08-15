# API設計書

## 概要

Focus FlowアプリケーションのAPI設計書です。Supabase Edge FunctionsとStripe連携のAPIエンドポイントについて詳細に説明します。

## 認証

すべてのAPIエンドポイントは、Supabase認証トークンを使用します。

```
Authorization: Bearer <supabase_jwt_token>
```

## Edge Functions

### 1. stripe-checkout

**エンドポイント**: `POST /functions/v1/stripe-checkout`

**目的**: Stripe Checkout セッションを作成し、ユーザーを決済ページにリダイレクトします。

#### リクエスト

```json
{
  "price_id": "price_1RXXflQ1bfh687PebpvIpq6e",
  "mode": "subscription",
  "success_url": "https://your-domain.com/subscription/success",
  "cancel_url": "https://your-domain.com/subscription/cancel"
}
```

**パラメータ**:
- `price_id` (string, required): Stripe価格ID
- `mode` (string, required): "subscription" または "payment"
- `success_url` (string, required): 決済成功時のリダイレクトURL
- `cancel_url` (string, required): 決済キャンセル時のリダイレクトURL

#### レスポンス

**成功時 (200)**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**エラー時 (400/401/500)**:
```json
{
  "error": "エラーメッセージ"
}
```

#### エラーコード

- `400`: 必須パラメータ不足、無効なパラメータ
- `401`: 認証失敗
- `404`: ユーザーが見つからない
- `500`: Stripe API エラー、データベースエラー

### 2. stripe-webhook

**エンドポイント**: `POST /functions/v1/stripe-webhook`

**目的**: Stripeからのwebhookイベントを処理し、サブスクリプション状態を同期します。

#### サポートするイベント

- `checkout.session.completed`: 決済完了
- `customer.subscription.created`: サブスクリプション作成
- `customer.subscription.updated`: サブスクリプション更新
- `customer.subscription.deleted`: サブスクリプション削除
- `invoice.payment_succeeded`: 支払い成功
- `invoice.payment_failed`: 支払い失敗

#### リクエスト

Stripeからのwebhookペイロード（署名検証あり）

#### レスポンス

**成功時 (200)**:
```json
{
  "received": true
}
```

**エラー時 (400/500)**:
```json
{
  "error": "エラーメッセージ"
}
```

## Supabase Database API

### テーブル操作

#### Tasks テーブル

**作成**:
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    user_id: user.id,
    title: 'タスクタイトル',
    status: 'inbox',
    // その他のフィールド
  })
```

**更新**:
```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId)
  .eq('user_id', user.id)
```

**取得**:
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
```

#### Projects テーブル

**作成**:
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    title: 'プロジェクトタイトル',
    status: 'active',
    progress: 0
  })
```

#### Usage Limits テーブル

**月次使用量の取得**:
```typescript
const currentMonth = new Date().toISOString().slice(0, 7)
const { data, error } = await supabase
  .from('usage_limits')
  .select('*')
  .eq('user_id', user.id)
  .eq('month_year', currentMonth)
  .maybeSingle()
```

## Row Level Security (RLS) ポリシー

### Tasks テーブル
- ユーザーは自分のタスクのみアクセス可能
- `uid() = user_id` 条件

### Projects テーブル
- ユーザーは自分のプロジェクトのみアクセス可能
- `uid() = user_id` 条件

### Stripe関連テーブル
- ユーザーは自分の顧客情報・サブスクリプション情報のみアクセス可能

## エラーハンドリング

### 共通エラーレスポンス形式

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {
    "field": "エラーの詳細"
  }
}
```

### よくあるエラー

1. **認証エラー**
   - `UNAUTHORIZED`: 認証トークンが無効
   - `USER_NOT_FOUND`: ユーザーが見つからない

2. **使用量制限エラー**
   - `TASK_LIMIT_EXCEEDED`: タスク作成上限に達した
   - `PROJECT_LIMIT_EXCEEDED`: プロジェクト作成上限に達した

3. **データベースエラー**
   - `DATABASE_ERROR`: データベース操作エラー
   - `CONSTRAINT_VIOLATION`: 制約違反

4. **Stripe関連エラー**
   - `STRIPE_ERROR`: Stripe API エラー
   - `PAYMENT_FAILED`: 決済失敗

## レート制限

- Supabase: デフォルトのレート制限に従う
- Stripe API: Stripeのレート制限に従う
- Edge Functions: 同時実行数制限あり

## セキュリティ考慮事項

1. **認証トークンの検証**: すべてのリクエストでSupabase JWTトークンを検証
2. **CORS設定**: 適切なオリジンからのリクエストのみ許可
3. **入力値検証**: すべての入力パラメータを検証
4. **SQLインジェクション対策**: Supabaseクライアントの使用により自動的に対策
5. **XSS対策**: フロントエンドでの適切なエスケープ処理