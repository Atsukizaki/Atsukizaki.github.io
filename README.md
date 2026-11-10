# Atsukizaki | University Portfolio

大学生活の活動・学習・制作を記録する、日本語中心のポートフォリオです。HTML / CSS / JavaScriptのみで動作し、ビルド、APIキー、バックエンド、有料サービスは不要です。Notionや非公開データとの自動連携はありません。

## 構成

```text
index.html              # Home / About / Projects / Activities / Skills / Contact
assets/style.css        # レスポンシブデザイン・アニメーション
assets/app.js           # JSON読み込み・カード描画・フィルタ・メニュー
assets/favicon.svg      # サイトアイコン
data/portfolio.json     # 公開するプロフィール・実績データ
.nojekyll               # Jekyll処理を使わない静的配信
README.md
```

## ローカルで確認

Python 3がある環境で、リポジトリのルートから実行します。

```sh
python3 -m http.server 8000
```

`http://localhost:8000` を開きます。終了は `Ctrl+C`。JSONをfetchするため、HTMLの直接ダブルクリック（file://）ではなくHTTPサーバーを使ってください。外部フォントや外部JavaScriptへの依存はありません。

## プロフィールを更新する

`data/portfolio.json` の `profile` を編集します。

- `intro`: Homeの短い自己紹介・専門分野
- `about`: Aboutの紹介文
- `education`: 大学・学部や大学で学んでいる内容
- `interests`: 専門分野・関心領域

現時点では確認済みの経歴・成果が提供されていないため、詳細は準備中、実績は空配列です。大学名、資格、語学力、受賞歴、数値などは本人が確認してから追加してください。表示名やContactリンクを変更する場合は `index.html` のタイトル・メタ情報・ヘッダー・フッター・GitHubリンクも更新します。

## プロジェクトを追加する

`projects` 配列に次の形式のオブジェクトを追加します。以下は**形式説明用の架空例であり、本人の実績ではありません**。そのまま公開せず、確認済みの内容に置き換えてください。

```json
{
  "title": "確認済みのプロジェクト名",
  "category": "AI開発",
  "description": "目的、自分の役割、取り組み、確認できる成果を記載します。",
  "tags": ["実際に使った技術"],
  "url": "https://github.com/OWNER/REPOSITORY"
}
```

`title`、`category`、`description` は文字列、`tags` は文字列の配列です。表示順は配列順です。フィルタは `AI開発`、`機械学習`、`ハッカソン` に対応し、それ以外のカテゴリは `その他` に含まれます。複数の実績はオブジェクト間をカンマで区切ります。

## 活動を追加する

`activities` 配列に追加します。新しい日付順で表示します。

```json
{
  "date": "2026-11-10",
  "category": "学習記録",
  "title": "確認済みの活動名",
  "description": "実際に行った内容と学んだことを記載します。",
  "url": ""
}
```

日付は実在する日付を `YYYY-MM-DD` で記載します。カテゴリは課外活動・イベント・学習記録など自由です。`url` は任意で、省略または空文字にするとリンクは表示されません。プロジェクト・活動ともHTTP/HTTPSの絶対URLのみ表示します。

## スキルを追加する

`skills` の該当カテゴリの `items` に文字列を追加します。

```json
{
  "category": "プログラミング",
  "items": ["技術名：実際に経験した内容と利用範囲"]
}
```

資格は正式名称と取得年月、語学は確認済みの試験名・スコア・受験年月などを記載すると伝わりやすくなります。裏付けのない熟練度やパーセント表示は使っていません。空の項目は準備中として表示します。

## データ更新時の確認

1. 公開してよい事実だけを入力し、個人情報や非公開情報を含めない。
2. JSONではダブルクォートを使い、コメントや末尾カンマを書かない。
3. `python3 -m json.tool data/portfolio.json` で構文を確認する。
4. ローカルでPC幅・スマートフォン幅、メニュー、フィルタ、外部リンクを確認する。
5. 新しいブランチで変更し、Pull Request経由でmainにマージする。

データ取得・形式検証に失敗した場合はエラーメッセージを表示します。JavaScript無効時もページの基本構成とGitHubリンクを利用できますが、JSONの内容は表示されません。JSONの文字列はHTMLとして解釈せずテキストとして描画します。

## GitHub Pagesで公開する

この初期実装は作業ブランチとPRで提供し、mainへのマージやPages設定の変更は行いません。

レビュー後にPRをmainへマージし、GitHubのリポジトリで以下を設定してください。

1. **Settings → Pages → Build and deployment** を開く。
2. **Source: Deploy from a branch** を選択する。
3. **Branch: main / (root)** を選び **Save**。
4. デプロイ完了後、`https://atsukizaki.github.io/` を確認する。

すでにGitHub Actionsなど別の公開方法を使っている場合は、その設定との整合を確認してください。独自ドメインは不要です。GitHub Pagesで公開する情報は誰でも閲覧できる前提で管理してください。

## アクセシビリティと動作

- 日本語のlang属性、本文スキップリンク、キーボードフォーカスを用意。
- メニューは開閉状態を通知し、Escapeで閉じることができます。
- 絞り込み結果の件数を読み上げに通知します。
- `prefers-reduced-motion` でアニメーション・スムーズスクロールを抑制します。
- スマートフォンでは1列、PCでは最大3列のカード配置です。
