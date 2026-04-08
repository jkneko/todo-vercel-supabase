# todo-vercel-supabase

Next.js + Supabase で作った、Vercel 配置テスト向けの最小 Todo アプリです。

## このサンプルの目的

- Next.js を Vercel に本番配置できるか確認する
- Supabase Auth / Database / RLS の疎通を確認する
- 既存の怪しい実装をそのまま本番に出さず、安全寄りの別実装でテストする

## 構成

- Next.js (App Router, TypeScript)
- Supabase Auth (Magic Link)
- Supabase Postgres
- Row Level Security (RLS)
- Vercel デプロイ想定

## セキュリティ方針

- `service_role` キーは使っていません
- クライアントからは `anon key` のみ使用します
- Todo は `auth.uid()` ベースでユーザー単位に分離します
- RLS を前提に CRUD します

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成します。

```bash
cp .env.example .env.local
```

設定する値:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Supabase 側の設定

Supabase SQL Editor で `supabase-schema.sql` を実行してください。

これで以下が作成されます。

- `public.todos` テーブル
- index
- RLS policy
- insert 時に `user_id` を `auth.uid()` で補完する trigger

### 4. Auth の URL 設定

Supabase Dashboard の Authentication 設定で、最低限以下を追加します。

#### ローカル開発時

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

#### Vercel 本番時

- Site URL: `https://YOUR_DOMAIN`
- Redirect URL: `https://YOUR_DOMAIN/auth/callback`

Vercel のプレビューURLでもログイン確認したい場合は、そのURLも追加してください。

## ローカル起動

```bash
npm run dev
```

`http://localhost:3000` を開いて、Magic Link でログイン後に Todo CRUD を試せます。

## Vercel デプロイ手順

### 1. GitHub に push

```bash
git init
git add .
git commit -m "Initial todo demo"
```

その後 GitHub に push。

### 2. Vercel にリポジトリ連携

- Vercel で import project
- フレームワークは Next.js のままで OK
- Build Command / Output はデフォルトで OK

### 3. Vercel の環境変数

Project Settings > Environment Variables に以下を設定:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Supabase Auth URL を本番ドメインに更新

- Site URL
- Redirect URL (`/auth/callback`)

## 動作確認チェックリスト

- [ ] Magic Link が届く
- [ ] ログインできる
- [ ] Todo を追加できる
- [ ] 完了状態を切り替えられる
- [ ] 削除できる
- [ ] 別ユーザーでは他人の Todo が見えない
- [ ] Vercel 本番URLでも同じ動きをする

## 注意点

- このサンプルは UI を最小化しています
- メール認証は Supabase のメール設定に依存します
- 本格運用では監査ログ、レート制限、監視、migration 管理などを追加したほうが良いです

## ディレクトリ

- `src/app/page.tsx` : 画面本体
- `src/app/auth/callback/route.ts` : Magic Link コールバック
- `src/components/*` : Auth / Todo UI
- `src/lib/supabase/*` : browser/server/middleware client
- `supabase-schema.sql` : テーブル + RLS 作成 SQL

## 次にやると良いこと

この検証アプリが動いたら、既存サービスとの差分を見て以下を点検すると移植しやすいです。

- 認証方式の差分
- `service_role` の誤用有無
- RLS の設計
- 環境変数の分離
- client / server component の責務分離
