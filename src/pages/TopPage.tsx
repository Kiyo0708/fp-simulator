import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ParticleBackground } from '../components/ParticleBackground'

const FEATURES = [
  { icon: '📊', text: '資産推移グラフ' },
  { icon: '🏡', text: 'マイホーム購入' },
  { icon: '👶', text: '教育費シミュレーション' },
  { icon: '💼', text: '退職・年金計画' },
  { icon: '📉', text: 'リスク分析' },
  { icon: '📄', text: 'レポート出力' },
]

export default function TopPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#080c14]">
      <ParticleBackground />

      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-900/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-svh px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm font-medium tracking-wide"
        >
          📊 あなたの将来のお金を見える化しよう
        </motion.div>

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
              background: 'linear-gradient(135deg, #fbbf24 0%, #34d399 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FP Simulator
          </span>
          <span className="block text-white/90 mt-1" style={{ fontSize: '0.45em' }}>
            ライフプラン・シミュレーター
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-white/50 mb-14 max-w-lg text-base leading-relaxed"
        >
          収入・支出・ライフイベントを入力するだけで、
          <br />
          年齢ごとの資産推移を自動でシミュレーション。
          <br />
          老後2,000万円問題も、住宅購入も、まず数字で確かめよう。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/result')}
            className="relative px-10 py-4 rounded-2xl text-lg font-bold text-black cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 0 40px rgba(251,191,36,0.4)',
            }}
          >
            📋 プランを作成する
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-16 text-white/20 text-xs tracking-wide"
        >
          © 2026 FP Simulator — あなたの未来を、数字で描こう
        </motion.p>
      </div>
    </div>
  )
}
