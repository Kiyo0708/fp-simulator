# FP Simulator

ファイナンシャルプランナー向けのライフプランシミュレーターアプリ。
ユーザーが収入・支出・ライフイベントを入力すると、年齢ごとの資産推移をグラフで可視化する。

## Tech Stack

| 役割 | 技術 |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` プラグイン方式) |
| Animation | Framer Motion |
| Package Manager | npm |

## Commands

```bash
npm run dev      # 開発サーバー起動 → http://localhost:5173
npm run build    # 本番ビルド
npm run lint     # ESLint
npm run preview  # 本番ビルドのプレビュー
```

## Directory Structure

```
src/
  components/   # 再利用可能なUIコンポーネント
  pages/        # ページ単位のコンポーネント (TopPage, PlannerPage, ResultPage など)
  store/        # 状態管理 (Zustand 導入予定)
  types/        # TypeScript型定義 (LifeEvent, CashFlow, SimulationResult など)
  hooks/        # カスタムReactフック
  utils/        # 計算ロジック (資産推移計算、税額計算など)
```

## Code Conventions

- 関数コンポーネントのみ (クラスコンポーネント禁止)
- コンポーネントは named export、ページ・App のみ default export
- Props の interface は同一ファイル内に定義
- コメントは「なぜ」が非自明な場合のみ。「何をしているか」は書かない
- スタイルは Tailwind を優先。動的な値のみ inline style を許容

## Design System

**カラー**

| 用途 | 値 |
|---|---|
| 背景 | `#080c14` |
| メインアクセント (金) | `#fbbf24` |
| プラス・資産増加 | `#10b981` |
| マイナス・支出 | `#ef4444` |
| 情報・グラフ | `#6366f1` |
| テキスト | `white` + 透明度 (`/90`, `/60`, `/30`) |
| ボーダー | `white/10` 〜 `white/20` |

**コンポーネントの共通パターン**

```tsx
// カード
rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10

// ホバー
hover:bg-white/10 transition-colors duration-300
```

**Framer Motion アニメーション標準パターン**

```tsx
// ページ入場
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}

// 子要素のスタガー: delay を 0.1s ずつずらす

// ボタン
whileHover={{ scale: 1.04 }}
whileTap={{ scale: 0.97 }}
```

## Application Design

詳細設計は [docs/design.md](docs/design.md) を参照。

### 画面構成

- **TopPage**: ランディング
- **ResultPage**: メインハブ。積み上げ棒グラフ + 年次サマリー表。左サイドバーから各入力ページへ遷移
- **FamilyPage**: 家族構成（代表者・配偶者・子ども）
- **IncomePage**: 収入・積み立て・利回り
- **ExpensePage**: 生活費・住宅費（v1: 家賃のみ）
- **ChildrenPage**: 子どもの進学プラン（公立/私立）

### 実装優先順位

| フェーズ | 内容 | 状態 |
|---|---|---|
| v1 MVP | 家族・収入・生活費・家賃 → グラフ + テーブル → JSON保存/読み込み | 🚧 |
| v2 | 子ども教育費の入力・計算 | 未着手 |
| v3 | 住宅ローン対応 | 未着手 |
| v4 | 退職・年金プラン | 未着手 |
| v5 | PDF/CSVエクスポート | 未着手 |

## Repository

https://github.com/Kiyo0708/fp-simulator
