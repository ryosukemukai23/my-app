# News Portal - AI-Powered News Platform

ニュース連動型リッチコンテンツサイト（ポートフォリオ用）

## 🎯 プロジェクト概要

- **デザイン**: 白黒ベース、アクセントカラー #801b2b
- **機能**: タブ切替型ニュース表示、天気予報、楽天商品表示、Spotify/SportsDB 連携
- **技術スタック**: Next.js 14 + TypeScript + TailwindCSS + **Material-UI (MUI)**
- **特徴**: ダークモード対応、多言語対応（日本語/英語）、AI 補助によるレコメンド機能

## 🎨 UI フレームワーク

このプロジェクトは**TailwindCSS と Material-UI のハイブリッド構成**です：

### TailwindCSS

- グローバルスタイル
- カスタムユーティリティクラス
- 細かいスタイル調整

### Material-UI (MUI)

- **主要コンポーネント**: Header, ArticleCard, Sidebar, Pagination
- **テーマシステム**: ライト/ダークモード統一管理
- **アイコン**: @mui/icons-material
- **レスポンシブグリッド**: Grid システム

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

必要なパッケージ：

- `@mui/material` - MUI コアライブラリ
- `@emotion/react` - MUI のスタイリングエンジン
- `@emotion/styled` - スタイル付きコンポーネント
- `@mui/icons-material` - MUI アイコン
- `lucide-react` - 補助アイコン

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、API キーを設定してください。

```bash
cp .env.local.example .env.local
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📁 ディレクトリ構造

```
/src
├─ /app                 # Next.js App Router
│   ├─ /[lang]         # 言語別ルーティング (MUI版)
│   │   └─ /[category] # カテゴリ別ページ (MUI版)
│   ├─ /article/[id]   # 記事詳細ページ
│   └─ /weather/[country] # 天気詳細ページ
├─ /components         # コンポーネント
│   ├─ /MUI           # MUI版コンポーネント ⭐
│   │   ├─ MuiHeader.tsx
│   │   ├─ MuiArticleCard.tsx
│   │   ├─ MuiSidebar.tsx
│   │   └─ MuiPagination.tsx
│   ├─ /3D            # 3Dコンポーネント
│   └─ (その他)
├─ /theme             # MUIテーマ ⭐
│   └─ muiTheme.ts
├─ /hooks             # カスタムフック
├─ /contexts          # Context API
│   ├─ DarkModeContext.tsx
│   ├─ LanguageContext.tsx
│   └─ MuiThemeContext.tsx ⭐
├─ /types             # 型定義
├─ /utils             # ユーティリティ
└─ /styles            # スタイル
```

## 🎨 MUI 実装詳細

### テーマ設定

`src/theme/muiTheme.ts` でライト/ダークモードのテーマを定義：

- プライマリカラー: #801b2b (アクセントカラー)
- カスタムシャドウ
- タイポグラフィ設定

### Context 統合

`app/layout.tsx` で以下の順序で Provider 配置：

1. DarkModeProvider
2. LanguageProvider
3. **MuiThemeProvider** ← ダークモード状態を監視

### MUI vs Tailwind 使い分け

| 要素               | 使用技術 | 理由                        |
| ------------------ | -------- | --------------------------- |
| Header             | MUI      | AppBar, Tabs, IconButton    |
| ArticleCard        | MUI      | Card, CardMedia, Typography |
| Sidebar            | MUI      | Card, List, Avatar          |
| Pagination         | MUI      | Pagination コンポーネント   |
| 3D アイコン        | Canvas   | カスタム 3D 効果            |
| グローバルスタイル | Tailwind | 統一されたユーティリティ    |

## 🎯 主な機能

### ニュース表示

- The News API を使用した記事取得
- カテゴリ別表示（11 カテゴリ）
- フリーワード検索（top カテゴリ）
- **MUI Pagination** によるページネーション

### サイドバー

- **MUI Card** ベースのレイアウト
- 現在地の天気 + 5 日間予報
- 楽天商品トップ 5 件表示
- Spotify 音楽表示（Entertainment カテゴリ）
- SportsDB 情報表示（Sports カテゴリ）

### UI/UX

- **MUI AppBar** によるヘッダー
- **MUI Tabs** によるカテゴリナビゲーション
- **MUI Theme** によるダークモード対応
- レスポンシブ **Grid** システム
- 3D 天気アイコン・ロゴ

## 🔑 使用 API

| API            | 用途             | API キー                   |
| -------------- | ---------------- | -------------------------- |
| The News API   | ニュース記事取得 | 必須                       |
| OpenWeatherMap | 天気情報         | 必須                       |
| Rakuten API    | 商品情報         | 必須                       |
| Spotify API    | 音楽情報         | 必須（Client ID + Secret） |
| SportsDB API   | スポーツ情報     | 不要（無料版）             |

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI ライブラリ**: Material-UI (MUI) v5 ⭐
- **スタイリング**: TailwindCSS v4 + Emotion (MUI)
- **アイコン**: @mui/icons-material + Lucide React
- **状態管理**: React Context API
- **データ取得**: Fetch API

## 📊 ポートフォリオアピールポイント

✅ **モダンな UI フレームワーク**: MUI v5 の最新機能を活用  
✅ **ハイブリッド構成**: Tailwind + MUI の組み合わせスキル  
✅ **テーマシステム**: ダークモード完全対応  
✅ **レスポンシブデザイン**: MUI Grid による柔軟なレイアウト  
✅ **TypeScript 完全対応**: 型安全な実装  
✅ **複数 API 統合**: 5 つの外部 API を統合管理

## 📝 TODO

- [ ] MUI 版 記事詳細ページ作成
- [ ] MUI 版 天気詳細ページ作成
- [ ] MUI Dialog によるモーダル実装
- [ ] MUI Snackbar によるトースト通知
- [ ] アクセシビリティの向上

## 📄 ライセンス

MIT License

## 👤 作成者

Your Name - Portfolio Project
