# Finance Manager

支店ごとの売上・経費の集計データを管理するフルスタック Web アプリケーションです。

## 技術スタック

- **フレームワーク**: [React Router v7](https://reactrouter.com/) (SSR)
- **ランタイム**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **データベース**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/)
- **ビルドツール**: [Vite](https://vite.dev/)
- **言語**: TypeScript

## 機能

- 📊 支店別の売上・経費データの集計管理
- 📈 四半期/半期ごとの集計（累計・期間別）

## プロジェクト構成

```
finance-manager/
├── app/                    # React Router アプリケーション
│   ├── routes/             # ルートコンポーネント
│   │   ├── dashboard/      # ダッシュボード (/)
│   │   └── branches/       # 支店管理 (/branches)
│   ├── layouts/            # レイアウトコンポーネント
│   ├── constants/          # 定数定義
│   └── utils/              # ユーティリティ関数
├── db/                     # データベース関連
│   ├── schema.ts           # Drizzle スキーマ定義
│   └── seed.sql            # シードデータ
├── drizzle/                # マイグレーションファイル
├── workers/                # Cloudflare Workers エントリーポイント
│   └── app.ts
├── wrangler.jsonc          # Wrangler 設定
└── drizzle.config.ts       # Drizzle Kit 設定
```

## データモデル

| テーブル            | 説明                                   |
| ------------------- | -------------------------------------- |
| `branches`          | 支店情報（名前、集計タイプ、集計間隔） |
| `categories`        | カテゴリ（売上/経費）                  |
| `branch_categories` | 支店とカテゴリの関連                   |
| `aggregations`      | 集計データ（年、月、金額）             |

## セットアップ

### 前提条件

- Node.js 20+
- pnpm
- Cloudflare アカウント

### インストール

```bash
pnpm install
```

### D1 データベースの作成

```bash
# D1 データベースを作成（初回のみ）
npx wrangler d1 create aggregation-manager-d1
```

作成後、`wrangler.jsonc` の `database_id` を更新してください。

### マイグレーション

```bash
# ローカル環境へのマイグレーション
pnpm db:migrate:local

# 本番環境へのマイグレーション
pnpm db:migrate:remote
```

### シードデータの投入

```bash
# ローカル環境へのシードデータ投入
pnpm db:seed:local

# 本番環境へのシードデータ投入
pnpm db:seed:remote
```

## 開発

### 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは `http://localhost:5173` で利用可能になります。

### 型生成

Cloudflare バインディングの型を生成します：

```bash
pnpm cf-typegen
```

### 型チェック

```bash
pnpm typecheck
```

## データベース操作

### マイグレーションファイルの生成

スキーマ変更後、マイグレーションファイルを生成します：

```bash
pnpm db:generate
```

### マイグレーションの適用

```bash
# ローカル
pnpm db:migrate:local

# 本番
pnpm db:migrate:remote
```

## ビルド & デプロイ

### プロダクションビルド

```bash
pnpm build
```

### ローカルプレビュー

```bash
pnpm preview
```

### デプロイ

```bash
# ビルド & デプロイ
pnpm deploy
```

### プレビュー URL へのデプロイ

```bash
# バージョンのアップロード
npx wrangler versions upload

# 本番への昇格
npx wrangler versions deploy
```

## 利用可能なスクリプト

| コマンド                 | 説明                              |
| ------------------------ | --------------------------------- |
| `pnpm dev`               | 開発サーバーを起動                |
| `pnpm build`             | プロダクションビルド              |
| `pnpm preview`           | ビルド後のローカルプレビュー      |
| `pnpm deploy`            | Cloudflare Workers へデプロイ     |
| `pnpm typecheck`         | 型チェック                        |
| `pnpm cf-typegen`        | Cloudflare バインディングの型生成 |
| `pnpm db:generate`       | マイグレーションファイル生成      |
| `pnpm db:migrate:local`  | ローカル DB マイグレーション      |
| `pnpm db:migrate:remote` | 本番 DB マイグレーション          |
| `pnpm db:seed:local`     | ローカル DB シードデータ投入      |
| `pnpm db:seed:remote`    | 本番 DB シードデータ投入          |

## 参考リンク

- [React Router v7 ドキュメント](https://reactrouter.com/)
- [Cloudflare Workers + React Router ガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [Tailwind CSS v4 ドキュメント](https://tailwindcss.com/)
