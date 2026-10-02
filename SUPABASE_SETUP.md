# 富士宮まるごと v4 — Supabase接続手順

この版は、Supabase未接続でも `data.js` の内蔵データで動きます。接続すると公開中の施設をSupabaseから読み込み、`admin.html` から追加・修正・削除できます。

## 1. Supabaseプロジェクトを作成
Supabaseで新しいプロジェクトを作成します。

## 2. テーブルと権限を作成
Supabaseの **SQL Editor** を開き、このフォルダの `schema.sql` 全文を実行します。

続けて `seed.sql` 全文を実行します。これで現在の内蔵施設データが `places` テーブルへ入ります。

## 3. 最初の管理者ユーザーを作成
Supabase Dashboard の **Authentication > Users** から、管理者用のメールアドレスとパスワードでユーザーを1人作成します。

その後 SQL Editor で次を実行します。メールアドレスは実際の管理者メールへ変更してください。

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'YOUR-ADMIN-EMAIL@example.com'
on conflict (user_id) do update set email = excluded.email;
```

## 4. GitHub Pages側にSupabase接続情報を設定
Supabase Dashboard の **Project Settings > API** で以下を確認します。

- Project URL
- Publishable key または anon public key

`config.js` を開き、次の2ヶ所へ貼り付けます。

```js
window.FM_CONFIG = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'ここにPublishable/anon key'
};
```

**service_role key は絶対にGitHubへ置かないでください。**

## 5. GitHubへアップロード
リポジトリ直下へv4のファイルをすべてアップロードします。既存の `index.html` `styles.css` `app.js` `data.js` は上書きします。

特に追加される重要ファイル:

- `config.js`
- `supabase-client.js`
- `admin.html`
- `admin.css`
- `admin.js`

`schema.sql` / `seed.sql` / `SUPABASE_SETUP.md` はブラウザ実行には不要ですが、管理用にリポジトリへ置いて構いません。

## 6. 動作確認
公開アプリ:

`https://pet-salon-manager.github.io/fujinomiya-super-app/`

管理者画面:

`https://pet-salon-manager.github.io/fujinomiya-super-app/admin.html`

管理画面で保存した公開データは、アプリを再読み込みすると反映されます。非公開にしたデータは一般画面には出ません。
