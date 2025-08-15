# セットアップガイド

## 1. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabaseの設定値を取得する方法

1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. 左サイドバーの「Settings」→「API」をクリック
4. 「Project URL」と「anon public」キーをコピー

## 2. データベースの初期化

Supabaseダッシュボードで以下の手順を実行してください：

1. 左サイドバーの「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase/migrations/20250710020000_initial_setup.sql`の内容をコピー&ペースト
4. 「Run」ボタンをクリックして実行

## 3. 認証設定

### メール認証の無効化（開発用）

1. Supabaseダッシュボードの「Authentication」→「Settings」
2. 「Enable email confirmations」をOFFに設定
3. 「Save」をクリック

### 許可されたリダイレクトURL

1. 「Authentication」→「URL Configuration」
2. 「Site URL」に本番環境のURLを設定
3. 「Redirect URLs」に以下を追加：
   - `http://localhost:5173/**` (開発環境)
   - `https://your-domain.com/**` (本番環境)

## 4. Stripe連携（オプション）

### Stripeアカウントの設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)でアカウント作成
2. 「Products」で商品を作成
3. 価格IDを`src/stripe-config.ts`に設定

### Webhookの設定

1. Stripe Dashboardの「Developers」→「Webhooks」
2. 「Add endpoint」をクリック
3. エンドポイントURL: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
4. 以下のイベントを選択：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Supabase Edge Functionsのデプロイ

```bash
# Supabase CLIをインストール
npm install -g supabase

# プロジェクトにリンク
supabase link --project-ref your-project-id

# Edge Functionsをデプロイ
supabase functions deploy stripe-webhook
supabase functions deploy stripe-checkout
```

### 環境変数の設定（Supabase）

Supabaseダッシュボードの「Settings」→「Edge Functions」で以下を設定：

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを確認してください。

## 6. 本番環境へのデプロイ

### Netlifyでのデプロイ

1. GitHubリポジトリをNetlifyに接続
2. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 環境変数を設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## トラブルシューティング

### よくある問題

1. **「Database error saving new user」エラー**
   - データベースマイグレーションが正しく実行されているか確認
   - RLSポリシーが正しく設定されているか確認

2. **「Invalid login credentials」エラー**
   - メール認証が無効になっているか確認
   - 正しいメールアドレスとパスワードを使用しているか確認

3. **Stripe決済が動作しない**
   - Stripe Webhookが正しく設定されているか確認
   - Edge Functionsが正しくデプロイされているか確認
   - 環境変数が正しく設定されているか確認

### ログの確認方法

- **Supabaseログ**: ダッシュボードの「Logs」セクション
- **Netlifyログ**: デプロイメントログとFunction logs
- **ブラウザ**: Developer Toolsのコンソール

## サポート

問題が解決しない場合は、以下の情報を含めてIssueを作成してください：

- エラーメッセージの詳細
- 実行した手順
- 環境情報（OS、ブラウザ、Node.jsバージョンなど）
- 関連するログ