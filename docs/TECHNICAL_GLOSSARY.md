# 技術用語集・概念説明

## 概要

Focus Flow プロジェクトに新規参画する開発者向けの技術用語集と概念説明です。このドキュメントを読むことで、プロジェクトで使用される技術や専門用語を理解できます。

## 🎯 GTD（Getting Things Done）関連用語

### GTD基本概念

**GTD（Getting Things Done）**
- デビッド・アレン氏が提唱した生産性向上手法
- 「頭の中を空にして、信頼できるシステムで管理する」ことが核心
- 5つのステップ：収集→明確化→整理→レビュー→実行

**Mind Like Water**
- GTDの理想状態を表す概念
- 水のように、外部からの刺激に対して適切に反応し、すぐに平静に戻る状態
- アプリのサブタイトルとして使用

### GTDワークフロー

**インボックス（Inbox）**
- 思いついたこと、やるべきことを一時的に記録する場所
- 「頭の中にあることを全て外に出す」ための受け皿
- 定期的に処理（明確化）する必要がある

**処理（Processing/Clarifying）**
- インボックスのアイテムを6つのステップで分類する作業
- 「それは何か？」から始まる決定フロー
- 各アイテムを適切な場所に振り分ける

**6ステップ処理フロー**
1. **それは何か？** - アイテムの内容を明確にする
2. **行動が必要か？** - アクションを起こすべきかを判断
3. **複数ステップか？** - プロジェクトかタスクかを判断
4. **2分以内でできるか？** - すぐやるか後でやるかを判断
5. **自分でやるべきか？** - 委任できるかを判断
6. **特定の日にやるべきか？** - スケジュールするかを判断

### GTDリスト

**次のアクション（Next Actions）**
- 今すぐ実行できる具体的なタスク
- 「電話をかける」「メールを送る」など明確な行動
- GTDの中核となるリスト

**待ち項目（Waiting For）**
- 他の人に委任したタスクや、外部からの返答待ちのアイテム
- 定期的にフォローアップが必要
- 担当者と期限を記録

**予定済み（Scheduled）**
- 特定の日に実行する必要があるタスク
- カレンダーに入れるべきアイテム
- 日付が重要な意味を持つもの

**プロジェクト（Projects）**
- 複数のステップが必要な成果
- 「〜を完了する」という形で表現される
- 次のアクションを常に持つ必要がある

**いつか/たぶん（Someday/Maybe）**
- 将来やりたいかもしれないアイデア
- 今は行動しないが、定期的にレビューする
- 夢や願望も含む

**参考資料（Reference）**
- 将来参照する可能性がある情報
- 行動は不要だが保管しておきたいもの
- 連絡先、手順書、アイデアメモなど

## 🛠 技術スタック用語

### フロントエンド技術

**React 18**
- Facebookが開発したJavaScriptライブラリ
- コンポーネントベースのUI構築
- 仮想DOM、Hooks、Concurrent Featuresが特徴

**TypeScript**
- Microsoftが開発したJavaScriptの上位互換言語
- 静的型付けによりバグを事前に発見
- 大規模開発での保守性向上

**Vite**
- 次世代フロントエンドビルドツール
- 高速な開発サーバー起動
- ES Modulesベースの高速ビルド

**Tailwind CSS**
- ユーティリティファーストのCSSフレームワーク
- クラス名でスタイルを直接指定
- レスポンシブデザインが簡単

**React Router DOM**
- React用のクライアントサイドルーティングライブラリ
- SPA（Single Page Application）でのページ遷移を管理
- ブラウザの履歴APIを活用

**Lucide React**
- 美しいSVGアイコンライブラリ
- React用に最適化されたアイコンコンポーネント
- 軽量で一貫したデザイン

### バックエンド技術

**Supabase**
- オープンソースのFirebase代替
- PostgreSQL + 認証 + リアルタイム + ストレージを統合
- 「Backend as a Service」の一種

**PostgreSQL**
- オープンソースのリレーショナルデータベース
- ACID特性、トランザクション、複雑なクエリに対応
- JSON型、配列型などの高度なデータ型をサポート

**Row Level Security (RLS)**
- PostgreSQLの機能
- テーブルの行レベルでアクセス制御
- マルチテナントアプリケーションに最適

**Edge Functions**
- Supabaseのサーバーレス関数実行環境
- Deno runtimeで動作
- Stripe webhookなどの外部API連携に使用

**JWT（JSON Web Token）**
- 認証情報を安全に伝送するためのトークン形式
- ヘッダー、ペイロード、署名の3部構成
- Supabase Authで自動生成・検証

### 決済・サブスクリプション

**Stripe**
- オンライン決済処理サービス
- サブスクリプション、一回限り決済に対応
- 世界中で利用される信頼性の高いプラットフォーム

**Webhook**
- 外部サービスからのイベント通知機能
- HTTPリクエストでリアルタイムにデータを受信
- Stripeの決済完了通知などに使用

**Checkout Session**
- Stripeが提供する決済ページ
- セキュアな決済フォームを簡単に実装
- PCI DSS準拠で安全

## 🏗 アーキテクチャパターン用語

### React設計パターン

**Context API**
- Reactの状態管理機能
- プロップドリリング（props の多層渡し）を回避
- グローバル状態の管理に使用

**Custom Hooks**
- ロジックを再利用可能な形で抽出
- `use`で始まる関数名
- 状態とロジックをコンポーネントから分離

**Compound Components**
- 複数のコンポーネントが連携して動作するパターン
- `ProcessingWizard`と各ステップコンポーネントが例
- 柔軟性と再利用性を両立

**Render Props**
- コンポーネント間でロジックを共有するパターン
- 関数をpropsとして渡す
- Higher-Order Componentsの代替

### 状態管理パターン

**楽観的更新（Optimistic Updates）**
- サーバーレスポンスを待たずにUIを先に更新
- ユーザー体験の向上
- エラー時はロールバックが必要

**悲観的更新（Pessimistic Updates）**
- サーバーレスポンス後にUIを更新
- データ整合性を重視
- レスポンスが遅い場合はローディング表示

**Single Source of Truth**
- データの信頼できる唯一の情報源
- 状態の重複を避ける設計原則
- Contextで一元管理

## 🔐 セキュリティ用語

**認証（Authentication）**
- ユーザーが本人であることを確認するプロセス
- メール/パスワード、OAuth、多要素認証など
- 「あなたは誰ですか？」の質問

**認可（Authorization）**
- 認証されたユーザーが特定のリソースにアクセスできるかを判断
- 権限管理、ロールベースアクセス制御
- 「あなたは何ができますか？」の質問

**CORS（Cross-Origin Resource Sharing）**
- 異なるドメイン間でのリソース共有を制御
- ブラウザのセキュリティ機能
- APIアクセス時に適切な設定が必要

**XSS（Cross-Site Scripting）**
- 悪意のあるスクリプトをWebページに注入する攻撃
- Reactは標準でエスケープ処理を行う
- `dangerouslySetInnerHTML`の使用は避ける

**SQL Injection**
- SQLクエリに悪意のあるコードを注入する攻撃
- Supabaseクライアントの使用で自動的に防御
- 生のSQLクエリは避ける

## 📊 データベース用語

**ACID特性**
- **Atomicity（原子性）**: トランザクションは全て成功するか全て失敗
- **Consistency（一貫性）**: データベースの整合性を保つ
- **Isolation（分離性）**: 同時実行されるトランザクションが互いに影響しない
- **Durability（永続性）**: コミットされたデータは永続的に保存

**インデックス（Index）**
- データベースの検索性能を向上させるデータ構造
- B-tree、Hash、GINなどの種類がある
- 適切な設計でクエリ速度が大幅に向上

**外部キー制約（Foreign Key Constraint）**
- テーブル間の関連性を保証する制約
- 参照整合性を維持
- CASCADE、SET NULL、RESTRICTなどのオプション

**トリガー（Trigger）**
- データベースイベント（INSERT、UPDATE、DELETE）に応じて自動実行される関数
- `updated_at`の自動更新などに使用
- ビジネスロジックの一部をデータベース層で実装

**ビュー（View）**
- 複数のテーブルを結合した仮想的なテーブル
- 複雑なクエリを簡単に再利用
- セキュリティ層としても機能

**マイグレーション（Migration）**
- データベーススキーマの変更を管理する仕組み
- バージョン管理されたスキーマ変更
- 本番環境への安全な適用

## 🚀 デプロイメント用語

**CI/CD（Continuous Integration/Continuous Deployment）**
- **CI**: コードの継続的統合・テスト
- **CD**: 継続的デプロイメント
- GitHub Actions、Netlifyで自動化

**CDN（Content Delivery Network）**
- 世界中に分散されたサーバーネットワーク
- 静的ファイルを高速配信
- Netlifyが自動的に提供

**Edge Computing**
- ユーザーに近い場所でコードを実行
- レイテンシの削減
- Supabase Edge Functionsで活用

**Serverless**
- サーバー管理が不要なアーキテクチャ
- 使用量に応じた課金
- スケーラビリティが高い

## 🔄 開発プロセス用語

**アジャイル開発**
- 短期間での反復開発手法
- ユーザーフィードバックを重視
- 変化に柔軟に対応

**スクラム**
- アジャイル開発の具体的な手法
- スプリント、デイリースタンドアップ、レトロスペクティブ
- チーム協働を重視

**MVP（Minimum Viable Product）**
- 最小限の機能で価値を提供する製品
- 早期リリースでユーザーフィードバックを収集
- 段階的な機能追加

**技術的負債（Technical Debt）**
- 短期的な解決策により将来的に発生するコスト
- リファクタリングで解消
- 計画的な管理が重要

## 📱 フロントエンド用語

**SPA（Single Page Application）**
- 単一のHTMLページで動作するWebアプリケーション
- ページ遷移時にページ全体を再読み込みしない
- React Router DOMで実現

**コンポーネント（Component）**
- UIの再利用可能な部品
- props（プロパティ）でデータを受け取る
- 関数コンポーネントとクラスコンポーネントがある

**Hooks**
- React 16.8で導入された機能
- 関数コンポーネントで状態やライフサイクルを扱う
- `useState`、`useEffect`、`useContext`など

**仮想DOM（Virtual DOM）**
- 実際のDOMの軽量なJavaScript表現
- 差分計算により効率的な更新
- Reactの高速描画の仕組み

**JSX（JavaScript XML）**
- JavaScriptの中にHTML風の記法を書ける拡張構文
- Reactコンポーネントの記述に使用
- Babelでトランスパイルされる

**Props**
- 親コンポーネントから子コンポーネントに渡すデータ
- 読み取り専用（イミュータブル）
- コンポーネント間の通信手段

**State**
- コンポーネント内で管理される可変データ
- `useState`フックで管理
- 状態が変更されると再描画が発生

## 🗄 バックエンド用語

**BaaS（Backend as a Service）**
- バックエンド機能をクラウドサービスとして提供
- Supabaseはこの分類
- 開発速度の向上とインフラ管理の簡素化

**ORM（Object-Relational Mapping）**
- オブジェクトとリレーショナルデータベースのマッピング
- SQLを直接書かずにデータベース操作
- Supabaseクライアントが簡易的なORM機能を提供

**API（Application Programming Interface）**
- アプリケーション間の通信インターフェース
- REST API、GraphQL APIなどの種類
- Supabase REST APIを使用

**REST（Representational State Transfer）**
- WebAPIの設計原則
- HTTP メソッド（GET、POST、PUT、DELETE）を使用
- ステートレスな通信

**JSON（JavaScript Object Notation）**
- データ交換フォーマット
- 軽量で人間が読みやすい
- Web APIの標準的なデータ形式

## 🔒 セキュリティ用語

**HTTPS/TLS**
- HTTP通信を暗号化するプロトコル
- 中間者攻撃を防ぐ
- 現代のWebアプリケーションでは必須

**環境変数（Environment Variables）**
- アプリケーションの設定値を外部から注入
- APIキーなどの機密情報を安全に管理
- `.env`ファイルで管理

**OWASP Top 10**
- Webアプリケーションの主要なセキュリティリスク
- セキュリティ対策の指針
- 定期的に更新される

## 💳 決済・サブスクリプション用語

**SaaS（Software as a Service）**
- クラウド経由でソフトウェアを提供するモデル
- サブスクリプション課金が一般的
- Focus Flowもこのモデル

**MRR（Monthly Recurring Revenue）**
- 月次経常収益
- サブスクリプションビジネスの重要指標
- 成長率の測定に使用

**Churn Rate（解約率）**
- 一定期間内にサービスを解約した顧客の割合
- 顧客維持の重要指標
- 低い方が良い

**PCI DSS**
- 決済カード業界のセキュリティ基準
- Stripeが準拠しているため、直接対応は不要
- 決済情報の安全な取り扱い

## 🔧 開発ツール用語

**Git**
- 分散型バージョン管理システム
- ソースコードの変更履歴を管理
- ブランチ、マージ、プルリクエストなどの概念

**npm（Node Package Manager）**
- Node.jsのパッケージ管理ツール
- 依存関係の管理
- `package.json`で設定

**ESLint**
- JavaScriptの静的解析ツール
- コード品質の向上
- 一貫したコーディングスタイルの維持

**Prettier**
- コードフォーマッター
- 自動的にコードを整形
- チーム内でのコードスタイル統一

## 📈 パフォーマンス用語

**レンダリング最適化**
- Reactコンポーネントの描画性能向上
- `React.memo`、`useMemo`、`useCallback`を使用
- 不要な再描画を防ぐ

**バンドルサイズ**
- ビルド後のJavaScriptファイルサイズ
- 小さいほどページロードが高速
- Tree shakingで不要コードを除去

**Code Splitting**
- アプリケーションを複数のバンドルに分割
- 必要な部分のみを読み込み
- 初期ロード時間の短縮

**Lazy Loading**
- 必要になったタイミングでリソースを読み込み
- 初期ロード時間の短縮
- `React.lazy()`で実現

## 🧪 テスト用語

**単体テスト（Unit Test）**
- 個別の関数やコンポーネントをテスト
- 最も基本的なテスト
- Jest、Vitestで実行

**統合テスト（Integration Test）**
- 複数のコンポーネントやシステムの連携をテスト
- APIとの通信テストなど
- より実際の使用に近い

**E2E テスト（End-to-End Test）**
- ユーザーの操作フローを最初から最後までテスト
- ブラウザを自動操作
- Playwright、Cypressなどのツール

**モック（Mock）**
- テスト時に外部依存関係を偽装
- APIレスポンスの模擬
- テストの独立性を保つ

## 🌐 Web技術用語

**レスポンシブデザイン**
- 画面サイズに応じてレイアウトが変化
- モバイル、タブレット、デスクトップに対応
- CSS Media Queriesで実現

**PWA（Progressive Web App）**
- Webアプリをネイティブアプリのように動作させる技術
- オフライン対応、プッシュ通知など
- 将来的な実装候補

**SEO（Search Engine Optimization）**
- 検索エンジン最適化
- SPAでは特別な対応が必要
- メタタグ、構造化データなど

## 📊 データ分析用語

**KPI（Key Performance Indicator）**
- 重要業績評価指標
- ビジネス目標の達成度を測定
- DAU、MAU、コンバージョン率など

**DAU/MAU（Daily/Monthly Active Users）**
- 日次/月次アクティブユーザー数
- サービスの健全性を示す指標
- エンゲージメントの測定

**コンバージョン率**
- 目標行動を完了したユーザーの割合
- 無料ユーザーから有料ユーザーへの転換率など
- ビジネス成長の重要指標

## 🔄 DevOps用語

**Infrastructure as Code (IaC)**
- インフラ設定をコードで管理
- 再現可能で一貫した環境構築
- Terraformなどのツール

**Blue-Green Deployment**
- 2つの本番環境を用意する デプロイ手法
- ダウンタイムなしでのデプロイ
- 問題時の即座なロールバック

**Canary Deployment**
- 新バージョンを一部のユーザーにのみ提供
- 段階的なリリース
- リスクの最小化

## 🎨 UI/UX用語

**ユーザビリティ**
- システムの使いやすさ
- 学習しやすさ、効率性、満足度
- ユーザーテストで評価

**アクセシビリティ**
- 障害のある方も含めて誰でも使えるデザイン
- WCAG（Web Content Accessibility Guidelines）準拠
- スクリーンリーダー対応など

**マイクロインタラクション**
- 小さなアニメーションや視覚的フィードバック
- ユーザー体験の向上
- ボタンのホバー効果、ローディングアニメーションなど

## 📚 学習リソース

### 公式ドキュメント
- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Stripe公式ドキュメント](https://stripe.com/docs)

### GTD関連
- 「Getting Things Done」デビッド・アレン著
- [GTD公式サイト](https://gettingthingsdone.com/)

### 技術記事・チュートリアル
- [React Hooks完全ガイド](https://overreacted.io/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Supabase チュートリアル](https://supabase.com/docs/guides/getting-started)

---

**💡 ヒント**: 分からない用語があれば、まずは公式ドキュメントを確認し、それでも不明な場合はチームメンバーに質問しましょう。技術は日々進歩するため、継続的な学習が重要です。