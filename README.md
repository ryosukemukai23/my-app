# News Portal

ニュース記事に連動して、天気・商品・音楽・スポーツ情報を表示するニュースサイトです。
Next.js (App Router) の Server Component によるデータ取得と、複数の外部 API の統合を主眼に作りました。

**Demo**: https://my-app-teal-nu.vercel.app/ja/top

## 特徴

- カテゴリ別ニュース一覧（10 カテゴリ）と記事詳細、関連記事
- 日本語 / 英語の切り替え、ダークモード
- 記事ごとに連動するサイドバー（天気・楽天商品・Apple Music・SportsDB）
- カーソル方式のページネーション
- Canvas 2D によるロゴ・天気アイコンのアニメーション

## 技術スタック

| 分類           | 使用技術                                      |
| -------------- | --------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) / React / TypeScript  |
| UI             | Material-UI (MUI) / Tailwind CSS v4 / Emotion |
| 状態管理       | React Context API                             |
| デプロイ       | Vercel                                        |

## 使用 API

| API                       | 用途           | キー             |
| ------------------------- | -------------- | ---------------- |
| NewsData.io               | ニュース記事   | 必須             |
| OpenWeatherMap            | 天気           | 必須             |
| 楽天ウェブサービス        | 関連商品       | 必須             |
| iTunes Search / Apple RSS | 楽曲・チャート | 不要             |
| TheSportsDB               | スポーツ       | 不要（無料キー） |

## アーキテクチャ

1. **Server Component でデータ取得**
   一覧・記事詳細・関連記事は `utils/serverNewsAPI.ts` をサーバー側で直接呼びます。API キーはブラウザに露出しません。
2. **外部 API は Route Handler で中継**
   楽天・iTunes・SportsDB は `app/api/*` 経由で呼びます。CORS 回避、キーの秘匿、サーバー側キャッシュ、タイムアウト制御（iTunes は 5 秒）が目的です。
3. **キャッシュ設計**
   NewsData.io の無料枠（1 日 100 リクエスト）に合わせ、一覧は `revalidate` で 3 時間キャッシュしています。クライアント側は `localStorage` に API 結果を保存します。
4. **ページネーション**
   NewsData.io の `nextPage` トークンを URL の `cursor` に載せる方式です。ページ番号方式ではありません。
5. **多言語**
   URL の `[lang]` セグメントで言語を決定します。

## ディレクトリ構成

```
src
├─ app
│  ├─ [lang]
│  │  ├─ [category]      # カテゴリ別一覧
│  │  └─ article/[id]    # 記事詳細
│  └─ api                # itunes / rakuten / sportsdb の中継
├─ components            # MUI 版コンポーネント、3D アイコン
├─ contexts              # Dark mode / Language / MUI theme
├─ hooks                 # 外部 API 取得フック
├─ theme                 # MUI テーマ
├─ types                 # 型定義
└─ utils                 # サーバー側 API 取得、キャッシュ、日付整形
```

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # プロジェクト直下に置く
npm run dev
```

`.env.local` に設定する環境変数：

| 変数                  | 内容                                     |
| --------------------- | ---------------------------------------- |
| `NEWSDATA_API_KEY`    | NewsData.io の API キー                  |
| `OPENWEATHER_API_KEY` | OpenWeatherMap の API キー               |
| `RAKUTEN_APP_ID`      | 楽天のアプリケーション ID                |
| `RAKUTEN_ACCESS_KEY`  | 楽天のアクセスキー                       |
| `RAKUTEN_ORIGIN`      | 楽天 API に送る Origin（デプロイ先 URL） |

天気のキーの変数名は、実際のコードに合わせて修正してください。

## 開発で苦労した点と対応

- **本番だけ極端に遅い**
  原因は、廃止済みの Redis への接続待ちが、ページ表示のたびに発生していたことでした。Vercel のログから特定し、依存を外して解消しました。
- **外部 API が応答しないと画面が止まる**
  iTunes ルートにタイムアウトを入れ、検索 → チャートの順でフォールバックするようにしました。
- **無料枠の API を守る設計**
  キャッシュ期間を揃え、リンクのプリフェッチを無効化して、無駄なリクエストを減らしました。
- **ブラウザから外部 API を直接呼ぶと失敗する**
  CORS を避けるため、Route Handler で中継する構成にしました。

## 既知の制約

- NewsData.io の無料プランは、最新記事の配信が約 12 時間遅れます。
- 記事詳細は 48 時間より古い記事を取得できません。

## 今後の改善

- 記事データの永続キャッシュ（Redis などの再導入）
- テストの追加
- 日時表示の日本時間対応
