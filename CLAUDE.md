# Life Simulator

ライフシミュレーターゲーム。プレイヤーが人生の選択を積み重ね、健康・幸福度・お金・スキルを管理しながら理想の人生を目指す。

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
  pages/        # ページ単位のコンポーネント (TopPage, GamePage など)
  store/        # 状態管理 (Zustand 導入予定)
  types/        # TypeScript型定義
  hooks/        # カスタムReactフック
  utils/        # 純粋なユーティリティ関数
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
| 健康・成功 | `#10b981` |
| 危険・警告 | `#ef4444` |
| スキル・情報 | `#6366f1` |
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

## Game Design

### コアステータス

| ステータス | 範囲 | 説明 |
|---|---|---|
| ❤️ 健康 | 0〜100 | 生活習慣・医療で変動 |
| 😊 幸福度 | 0〜100 | 人間関係・趣味・達成感で変動 |
| 💰 お金 | 万円 | 収入・支出・投資で変動 |
| 🧠 スキル | 0〜100 | 仕事・勉強・経験で変動 |

### ゲームフロー (設計中)

```
トップページ
  → キャラクター作成 (名前・初期ステータス振り分け)
    → 学生時代 (10代)
      → 社会人 (20〜30代)
        → 結婚・家族 (30〜40代)
          → 老後 (60代〜)
            → エンディング
```

各フェーズはターン制 (1ターン = 1ヶ月 or 1年)。
選択肢を選ぶとステータスが変動し、次のイベントへ繋がる。

### 実装優先順位

1. トップページ ✅
2. キャラクター作成画面
3. ゲームの状態管理 (Zustand)
4. メインゲーム画面 (イベント・選択肢)
5. ステータス変動ロジック
6. エンディング・セーブ機能

## Repository

https://github.com/Kiyo0708/life-simulator
