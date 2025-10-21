"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface EthicsProfile {
  utilitarian: number
  deontological: number
  virtueEthics: number
  pragmatic: number
  emotional: number
}

interface ProfileData {
  totalChoices: number
  ethics: EthicsProfile
  topCategories: Array<{ category: string; count: number }>
  recentChoices: Array<{
    dilemmaId: string
    title: string
    choice: string
    choiceText: string
    createdAt: string
  }>
  averages: {
    complexity: string
    emotionalIntensity: string
  }
}

// Radar Chart Component
function RadarChart({ ethics }: { ethics: EthicsProfile }) {
  const size = 300
  const center = size / 2
  const radius = 120
  const angleStep = (Math.PI * 2) / 5

  const points = [
    { label: 'Utilitarian', value: ethics.utilitarian, angle: -Math.PI / 2 },
    { label: 'Deontological', value: ethics.deontological, angle: -Math.PI / 2 + angleStep },
    { label: 'Virtue Ethics', value: ethics.virtueEthics, angle: -Math.PI / 2 + angleStep * 2 },
    { label: 'Pragmatic', value: ethics.pragmatic, angle: -Math.PI / 2 + angleStep * 3 },
    { label: 'Emotional', value: ethics.emotional, angle: -Math.PI / 2 + angleStep * 4 }
  ]

  // Calculate polygon points
  const polygonPoints = points.map(p => {
    const r = (p.value / 100) * radius
    const x = center + r * Math.cos(p.angle)
    const y = center + r * Math.sin(p.angle)
    return `${x},${y}`
  }).join(' ')

  // Grid circles
  const gridLevels = [20, 40, 60, 80, 100]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Grid circles */}
        {gridLevels.map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 100) * radius}
            fill="none"
            stroke="rgba(0, 255, 65, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {points.map((p, i) => {
          const x = center + radius * Math.cos(p.angle)
          const y = center + radius * Math.sin(p.angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(0, 255, 65, 0.2)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <motion.polygon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          points={polygonPoints}
          fill="rgba(0, 255, 65, 0.2)"
          stroke="#00ff41"
          strokeWidth="2"
          style={{ transformOrigin: 'center' }}
        />

        {/* Data points */}
        {points.map((p, i) => {
          const r = (p.value / 100) * radius
          const x = center + r * Math.cos(p.angle)
          const y = center + r * Math.sin(p.angle)
          return (
            <motion.circle
              key={i}
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={x}
              cy={y}
              fill="#00ff41"
            />
          )
        })}
      </svg>

      {/* Labels */}
      {points.map((p, i) => {
        const labelDistance = radius + 30
        const x = center + labelDistance * Math.cos(p.angle)
        const y = center + labelDistance * Math.sin(p.angle)

        return (
          <div
            key={i}
            className="absolute text-sm font-medium"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              color: '#00ff41'
            }}
          >
            <div className="text-center">
              <div>{p.label}</div>
              <div className="text-xs text-white/60">{p.value}%</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch('/api/analytics/profile')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl mystical-text">프로필 분석 중...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  // 가장 높은 딜레마 성격 찾기
  const topEthic = Object.entries(data.ethics).sort((a, b) => b[1] - a[1])[0]
  const ethicLabels: Record<string, string> = {
    utilitarian: 'Utilitarian',
    deontological: 'Deontological',
    virtueEthics: 'Virtue Ethics',
    pragmatic: 'Pragmatic',
    emotional: 'Emotional'
  }

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mystical-text">
              Personality Analysis
            </h1>
            <button
              onClick={() => router.push('/analytics')}
              className="accent-gradient px-6 py-3 text-sm"
            >
              Global Statistics
            </button>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            당신의 선택으로 분석한 성격 유형입니다
          </p>
        </motion.div>
      </div>

      {data.totalChoices === 0 ? (
        <div className="max-w-3xl mx-auto text-center panel p-12">
          <h2 className="text-2xl font-bold mystical-text mb-4">아직 선택이 없습니다</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            딜레마를 경험하고 나만의 성격을 발견하세요
          </p>
          <button
            onClick={() => router.push('/')}
            className="accent-gradient px-8 py-3"
          >
            딜레마 체험하기
          </button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="max-w-5xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-8 border border-green-400/20 text-center"
            >
              <h2 className="text-3xl font-bold mystical-text mb-2">
                {ethicLabels[topEthic[0]]} Type
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>
                총 {data.totalChoices}개의 딜레마에서 선택을 완료했습니다
              </p>
              <div className="flex gap-4 justify-center text-sm">
                <span>평균 복잡도: <strong className="mystical-text">{data.averages.complexity}/10</strong></span>
                <span>•</span>
                <span>평균 감정 강도: <strong className="mystical-text">{data.averages.emotionalIntensity}/10</strong></span>
              </div>
            </motion.div>
          </div>

          {/* Radar Chart */}
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mystical-text mb-6 text-center">Dilemma Personality Analysis</h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="panel p-8 border border-green-400/20 flex justify-center"
            >
              <RadarChart ethics={data.ethics} />
            </motion.div>
          </div>

          {/* Top Categories */}
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mystical-text mb-6">Favorite Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.topCategories.map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="panel p-6 border border-green-400/20 text-center"
                >
                  <div className="text-2xl font-bold mystical-text mb-2">{cat.count}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{cat.category}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Choices */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mystical-text mb-6">Recent Choices</h2>
            <div className="space-y-4">
              {data.recentChoices.map((choice, index) => (
                <motion.div
                  key={choice.dilemmaId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="panel p-6 border border-green-400/20 cursor-pointer hover:border-green-400/50 transition-all"
                  onClick={() => router.push(`/explore/${choice.dilemmaId}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                        {choice.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 text-xs rounded-full" style={{
                          background: choice.choice === 'A' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(226, 74, 74, 0.2)',
                          color: choice.choice === 'A' ? '#4A90E2' : '#E24A4A',
                          border: `1px solid ${choice.choice === 'A' ? '#4A90E2' : '#E24A4A'}`
                        }}>
                          선택 {choice.choice}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {choice.choiceText}
                      </p>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(choice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
