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

### 基本情報入力

| 項目 | 説明 |
|---|---|
| 現在の年齢 | シミュレーション開始年齢 |
| 想定寿命 | 何歳までシミュレートするか |
| 現在の貯蓄額 | 初期資産 |
| 月収 (手取り) | 毎月の収入 |
| 月支出 | 毎月の固定支出 |
| 想定利回り | 資産運用の年率 (%) |

### ライフイベント

任意の年齢に追加できるイベント。資産に一時的 or 継続的に影響する。

| イベント例 | 種別 | 影響 |
|---|---|---|
| 結婚 | 一時支出 | -100万円 など |
| 子どもの誕生 | 継続支出増加 | 毎月 +3万円 など |
| マイホーム購入 | 一時支出 + ローン | 頭金 -500万円、月々 +8万円 など |
| 子どもの大学入学 | 一時支出 | -200万円 など |
| 退職 | 収入変化 | 月収 0円 + 退職金 |
| 年金受給開始 | 収入増加 | 毎月 +15万円 など |

### シミュレーション結果

- 年齢ごとの資産残高グラフ (折れ線)
- 資産が底をつく年齢の警告
- 収入・支出・資産の年次サマリー表

### 実装優先順位

1. トップページ ✅
2. 基本情報入力フォーム
3. ライフイベント追加UI
4. 資産推移計算ロジック (`utils/simulation.ts`)
5. グラフ表示 (Recharts 導入予定)
6. PDF/CSV エクスポート

## Repository

https://github.com/Kiyo0708/fp-simulator
