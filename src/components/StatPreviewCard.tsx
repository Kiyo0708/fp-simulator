import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  icon: string
  label: string
  targetValue: number
  unit?: string
  color: string
  delay?: number
}

export function StatPreviewCard({ icon, label, targetValue, unit = '', color, delay = 0 }: Props) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1500
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.floor(eased * targetValue))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay * 1000 + 800)
    return () => clearTimeout(timeout)
  }, [targetValue, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay + 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-5 backdrop-blur-sm border border-white/10 bg-white/5 flex flex-col gap-3 overflow-hidden group hover:bg-white/10 transition-colors duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}20 0%, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-white/60">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
        {unit && <span className="text-sm text-white/50 mb-1">{unit}</span>}
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${(value / targetValue) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  )
}
