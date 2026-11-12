# 山崎温生のページ

Figmaをもとにした、日本語のポートフォリオです。HTML / CSS / JavaScriptのみで動作します。公開先は既存の `https://atsukizaki.github.io/` を維持します。mainへのマージと公開はレビュー後に行ってください。

## プレビュー

Node.jsをインストールした環境で、このフォルダーから実行します。

```sh
node scripts/preview.cjs
```

`http://127.0.0.1:8000` をブラウザーで開きます。終了はCtrl+Cです。記録をJSONから読み込むため、HTMLのダブルクリックではなくHTTPサーバーを使用してください。

## ページ構成

- `index.html`：トップ。横長の自己紹介カードと、勉強記録・活動記録へのカード。
- `about.html`：Figmaの自己紹介文、年代別の経歴、ソフトテニス・ピアノの紹介。
- `study.html`：分野別の学習記録。
- `activities.html`：楕円形の導線、実績一覧、ブログ。
- `assets/style.css`：配色・余白・レスポンシブ設定。
- `assets/app.js`：データ取得・検証、記録の表示、絞り込み、モバイルメニュー。
- `assets/figma-ellipse.svg`：Figmaから取得した662×350の楕円形。CSSマスクで指定色を適用。
- `data/portfolio.json`：学習記録・実績・ブログ。
- `scripts/generate-pages.cjs`：共通ヘッダー・フッターとページ本文の生成元。

HTMLは生成済みのためGitHub Pagesでビルドは不要です。`.nojekyll` を維持し、公開設定やドメインを変更していません。ページ・自己紹介文を編集する場合は `scripts/generate-pages.cjs` を編集して `node scripts/generate-pages.cjs` を実行し、生成HTMLもコミットしてください。Figma上の手動改行は、端末幅に応じて折り返すよう整理しています。大学2年という記載はFigma原文どおりです。

## 記録の追加

`data/portfolio.json` の該当配列に、確認済みの内容だけを追加します。現在はすべて空で、架空の実績は含みません。

| 配列 | 表示先 | 使用できるカテゴリ |
| --- | --- | --- |
| `studies` | 勉強記録 | AI、プログラミング、統計学、経営学、会計学、その他 |
| `achievements` | 実績一覧 | スポーツ、音楽、イベント、開発活動、その他 |
| `posts` | ブログ | スポーツ、音楽、イベント、開発活動、その他 |

各レコードには `title`（見出し）、`category`（上記のカテゴリ）、`date`（実在する日付をYYYY-MM-DD形式）、`description`（本文）を文字列で指定します。`url` は任意です。HTTP/HTTPSのURLだけをリンクとして表示し、外部リンクは新しいタブで開きます。本文の改行はJSON文字列の `\n` で指定できます。新しい日付順に表示し、カテゴリで絞り込めます。

追加形式（説明用のプレースホルダー。本人の実績ではありません）：

```text
{
  "title": "確認済みの記録タイトル",
  "category": "上記の対応カテゴリ",
  "date": "実際の日付（YYYY-MM-DD）",
  "description": "確認済みの本文",
  "url": ""
}
```

JSONはダブルクォートを使い、末尾カンマやコメントを含めないでください。データ取得・検証に失敗した場合は空の実績と区別してエラーを表示します。JavaScriptが無効でも、自己紹介・経歴とページ間の移動は利用できます。

## デザインと確認

背景 `#F7F5F0`、文字・メイン色 `#172A43`、カード `#FFFFFF`、補助文字 `#657184`、境界線 `#DFE3E8`。本文16〜17px、主要見出し最大48px。PCの2列をスマートフォンでは1列に変更します。日本語システムフォントを使用し、外部フォントやCDNへ依存しません。動きはホバーとスクロールに限定し、動きを減らす端末設定に対応します。

チェック：`node --check assets/app.js`、`node --test tests/records.test.cjs`。ブラウザーでは4ページ、モバイルメニュー、記録の絞り込み、楕円形のページ内移動を確認してください。

## 変更・公開の手順

作業ブランチ `feat/figma-portfolio-redesign` からmain向けPRでレビューします。この作業ではmainへマージせず、Pagesの設定や公開ブランチも変更しません。

自動表示テストを再実行する場合は、プレビューサーバーを起動したうえで `npm install --no-save --package-lock=false playwright` と `node tests/browser.cjs` を実行します。Windows上のChrome/Edgeを自動検出します。別のブラウザーパスは `CHROME_PATH` 環境変数で指定でき、それ以外では `npx playwright install chromium` が必要です。テスト用レコードはHTTP応答の差し替えだけに使用し、公開JSONには保存しません。スクリーンショットはGit管理外の `.qa/` に保存します。
