import { motion } from 'framer-motion'
import { ParticleBackground } from './components/ParticleBackground'
import { StatPreviewCard } from './components/StatPreviewCard'
import './App.css'

const STATS = [
  { icon: '❤️', label: '健康', targetValue: 85, color: '#ef4444', delay: 0 },
  { icon: '😊', label: '幸福度', targetValue: 72, color: '#f59e0b', delay: 0.1 },
  { icon: '💰', label: '貯金', targetValue: 320, unit: '万円', color: '#10b981', delay: 0.2 },
  { icon: '🧠', label: 'スキル', targetValue: 64, color: '#6366f1', delay: 0.3 },
]

const FEATURES = [
  { icon: '🏠', text: '家族・住まい' },
  { icon: '💼', text: 'キャリア' },
  { icon: '📚', text: '教育・成長' },
  { icon: '🌍', text: '旅・体験' },
  { icon: '🤝', text: '人間関係' },
  { icon: '🎯', text: '人生の目標' },
]

export default function App() {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#080c14]">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-900/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-svh px-4 py-20">

        {/* Header badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm font-medium tracking-wide"
        >
          ✨ あなただけの人生を歩もう
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-bold leading-tight mb-4"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
        >
          <span
            className="block"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 40%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Life Simulator
          </span>
          <span className="block text-white/90 mt-1" style={{ fontSize: '0.55em' }}>
            あなたの人生、あなたが決める
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-white/50 mb-14 max-w-lg text-base leading-relaxed"
        >
          選択が積み重なり、あなただけのストーリーが生まれる。
          <br />
          仕事、恋愛、健康、お金 — すべてのバランスを保ちながら理想の人生を目指そう。
        </motion.p>

        {/* Stat preview cards */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {STATS.map((s) => (
            <StatPreviewCard key={s.label} {...s} />
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative px-10 py-4 rounded-2xl text-lg font-bold text-black cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 0 40px rgba(251,191,36,0.4)',
            }}
          >
            <span className="relative z-10">🎮 ゲームを始める</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-2xl text-lg font-semibold text-white/80 border border-white/20 bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
          >
            📖 遊び方を見る
          </motion.button>
        </motion.div>

        {/* Feature tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="flex flex-wrap justify-center gap-2 max-w-lg"
        >
          {FEATURES.map((f) => (
            <span
              key={f.text}
              className="px-3 py-1.5 rounded-full text-sm text-white/50 bg-white/5 border border-white/10"
            >
              {f.icon} {f.text}
            </span>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.0 }}
          className="mt-16 text-white/20 text-xs tracking-wide"
        >
          © 2026 Life Simulator — あなたの選択が世界をつくる
        </motion.p>
      </div>
    </div>
  )
}
