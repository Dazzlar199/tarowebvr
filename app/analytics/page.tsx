"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface DilemmaStats {
  id: string
  title: string
  category: string
  choiceCount: number
  viewCount: number
  complexity: number
  emotionalIntensity: number
  choiceA: number
  choiceB: number
  ratioA: number
  ratioB: number
}

interface AnalyticsData {
  dilemmas: DilemmaStats[]
  categories: Array<{ category: string; count: number }>
  summary: {
    totalDilemmas: number
    totalChoices: number
    totalViews: number
    avgChoicesPerDilemma: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const response = await fetch('/api/analytics/global')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl mystical-text">데이터 로딩 중...</div>
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
              Global Statistics
            </h1>
            <button
              onClick={() => router.push('/analytics/profile')}
              className="accent-gradient px-6 py-3 text-sm"
            >
              My Personality
            </button>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            전 세계 사람들의 선택을 분석합니다
          </p>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: '총 딜레마', value: data.summary.totalDilemmas },
            { label: '총 선택', value: data.summary.totalChoices },
            { label: '총 조회', value: data.summary.totalViews },
            { label: '평균 참여율', value: `${data.summary.avgChoicesPerDilemma.toFixed(1)}` }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="panel p-6 border border-green-400/20"
            >
              <div className="text-3xl font-bold mystical-text mb-1">{stat.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Dilemmas with A/B Ratio */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mystical-text mb-6">Top 10 Dilemmas</h2>
        <div className="space-y-6">
          {data.dilemmas.slice(0, 10).map((dilemma, index) => (
            <motion.div
              key={dilemma.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="panel p-6 border border-green-400/20 cursor-pointer hover:border-green-400/50 transition-all"
              onClick={() => router.push(`/explore/${dilemma.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold mystical-text">#{index + 1}</div>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      {dilemma.title}
                    </h3>
                    <div className="flex gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>{dilemma.category}</span>
                      <span>•</span>
                      <span>{dilemma.choiceCount}명 참여</span>
                      <span>•</span>
                      <span>{dilemma.viewCount} 조회</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* A vs B Ratio Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span style={{ color: '#4A90E2' }}>선택 A</span>
                  <span style={{ color: '#E24A4A' }}>선택 B</span>
                </div>
                <div className="relative h-8 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dilemma.ratioA}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dilemma.ratioB}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-white text-sm font-bold">
                    <span>{dilemma.choiceA}명 ({dilemma.ratioA.toFixed(1)}%)</span>
                    <span>{dilemma.choiceB}명 ({dilemma.ratioB.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Complexity & Emotional Intensity */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>복잡도</div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dilemma.complexity / 10) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>감정 강도</div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dilemma.emotionalIntensity / 10) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mystical-text mb-6">Category Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.categories.map((cat, index) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="panel p-6 border border-green-400/20 text-center"
            >
              <div className="text-2xl font-bold mystical-text mb-2">{cat.count}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{cat.category}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
