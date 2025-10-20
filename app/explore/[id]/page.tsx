"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamic import to avoid SSR issues with Three.js
const DilemmaViewer3D = dynamic(() => import('@/components/DilemmaViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="divine-spinner mx-auto mb-4"></div>
        <p className="text-green-400 text-xl">딜레마를 준비하는 중...</p>
      </div>
    </div>
  )
})

interface Dilemma {
  id: string
  title: string
  description: string
  optionA: string
  optionB: string
  situation?: string
  facts?: string
  immediateConsequences?: string
  longTermConsequences?: string
  ethicalPrinciples?: string
  hiddenMeaning?: string
  sceneData?: string // JSON string of 3D scene objects
  category: string
  viewCount: number
  choiceCount: number
  author: {
    id: string
    username: string
  }
  createdAt: string
}

interface Stats {
  total: number
  choicesA: number
  choicesB: number
  percentageA: number
  percentageB: number
}

export default function ExplorePage() {
  const params = useParams()
  const router = useRouter()
  const dilemmaId = params.id as string

  const [dilemma, setDilemma] = useState<Dilemma | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasChosen, setHasChosen] = useState(false)
  const [userChoice, setUserChoice] = useState<'A' | 'B' | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    async function fetchDilemma() {
      try {
        const response = await fetch(`/api/dilemma/${dilemmaId}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch dilemma')
        }

        setDilemma(data.data)
      } catch (err: any) {
        console.error('Error fetching dilemma:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDilemma()
  }, [dilemmaId])

  const handleChoice = async (choice: 'A' | 'B', isVR: boolean = false) => {
    console.log('🎯 handleChoice called:', choice, 'isVR:', isVR)
    setUserChoice(choice)
    setHasChosen(true)

    try {
      // Save choice
      console.log('📤 Saving choice to API...')
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemmaId,
          choice,
          timeSpent: Math.floor(Date.now() / 1000),
          vrSession: isVR,
        }),
      })

      const data = await response.json()
      console.log('📥 Choice API response:', data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to save choice')
      }

      // Fetch statistics
      console.log('📊 Fetching statistics...')
      const statsResponse = await fetch(`/api/dilemma/${dilemmaId}/stats`)
      const statsData = await statsResponse.json()
      console.log('📊 Stats response:', statsData)

      if (statsData.success) {
        setStats(statsData.data)
      }

      // ALWAYS show results after delay, even if stats failed
      setTimeout(() => {
        console.log('✅ Showing results')
        setShowResults(true)
      }, 1500)

    } catch (err: any) {
      console.error('❌ Error in handleChoice:', err)
      // Show results even on error
      setTimeout(() => {
        setShowResults(true)
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="divine-spinner mx-auto mb-6"></div>
          <p className="text-green-400 text-xl font-bold tracking-widest">LOADING...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !dilemma) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-6"
        >
          <div className="w-20 h-20 mx-auto mb-8 border-2 border-red-400 rotate-45"></div>
          <h1 className="text-3xl font-bold text-red-400 mb-6 tracking-wider">ERROR</h1>
          <p className="text-gray-500 mb-8 text-sm tracking-wide">
            {error || 'Resource not found'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all"
          >
            RETURN
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative">
      {!hasChosen ? (
        <DilemmaViewer3D dilemma={dilemma} onChoice={handleChoice} />
      ) : (
        <div className="w-full min-h-screen bg-black flex items-center justify-center py-8">
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl w-full mx-auto px-4 md:px-6"
              >
                {/* Results Panel */}
                <div className="panel p-4 md:p-8 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold glitch-text-secondary mb-6 md:mb-8 text-center tracking-wider" data-text={`PATH ${userChoice}`}>
                    PATH {userChoice}
                  </h2>

                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold text-green-400 mb-2 md:mb-3 tracking-wider">
                      {userChoice === 'A' ? 'PATH A' : 'PATH B'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                      {userChoice === 'A' ? dilemma.optionA : dilemma.optionB}
                    </p>
                  </div>

                  {/* Immediate Consequences */}
                  {dilemma.immediateConsequences && (
                    <div className="mb-4 md:mb-6 bg-white/5 rounded-lg p-4 md:p-6 border border-green-400/20">
                      <h4 className="text-base md:text-lg font-semibold text-green-400 mb-2 md:mb-3 tracking-wider">IMMEDIATE RESULT</h4>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                        {typeof dilemma.immediateConsequences === 'string'
                          ? JSON.parse(dilemma.immediateConsequences)[`choice${userChoice}`]
                          : dilemma.immediateConsequences}
                      </p>
                    </div>
                  )}

                  {/* Long-term Consequences */}
                  {dilemma.longTermConsequences && (
                    <div className="mb-4 md:mb-6 bg-white/5 rounded-lg p-4 md:p-6 border border-green-400/20">
                      <h4 className="text-base md:text-lg font-semibold text-green-400 mb-2 md:mb-3 tracking-wider">LONG-TERM IMPACT</h4>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                        {typeof dilemma.longTermConsequences === 'string'
                          ? JSON.parse(dilemma.longTermConsequences)[`choice${userChoice}`]
                          : dilemma.longTermConsequences}
                      </p>
                    </div>
                  )}

                  {/* Statistics */}
                  {stats ? (
                    <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-green-400/20">
                      <h4 className="text-base md:text-lg font-semibold text-green-400 mb-3 md:mb-4 tracking-wider">STATISTICS</h4>

                      <div className="space-y-3 md:space-y-4">
                        {/* Path A Bar */}
                        <div>
                          <div className="flex justify-between mb-2 text-xs md:text-sm">
                            <span className="text-cyan-400">Path A (청록)</span>
                            <span className="text-cyan-400 font-semibold">{stats.percentageA}%</span>
                          </div>
                          <div className="w-full h-6 md:h-8 bg-black/50 rounded-full overflow-hidden border border-cyan-400/30">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.percentageA}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{stats.choicesA}명이 선택</p>
                        </div>

                        {/* Path B Bar */}
                        <div>
                          <div className="flex justify-between mb-2 text-xs md:text-sm">
                            <span className="text-red-400">Path B (적색)</span>
                            <span className="text-red-400 font-semibold">{stats.percentageB}%</span>
                          </div>
                          <div className="w-full h-6 md:h-8 bg-black/50 rounded-full overflow-hidden border border-red-400/30">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.percentageB}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-red-400 to-red-600"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{stats.choicesB}명이 선택</p>
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-3 md:mt-4">
                          총 {stats.total}명이 이 딜레마를 경험했습니다
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-green-400/20">
                      <h4 className="text-base md:text-lg font-semibold text-green-400 mb-3 md:mb-4 tracking-wider">STATISTICS</h4>
                      <p className="text-gray-400 text-xs md:text-sm text-center">통계를 불러오는 중...</p>
                    </div>
                  )}

                  {/* Hidden Meaning */}
                  {dilemma.hiddenMeaning && (
                    <div className="mt-4 md:mt-6 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-lg p-4 md:p-6 border border-green-400/30">
                      <h4 className="text-base md:text-lg font-semibold text-green-400 mb-2 md:mb-3 tracking-wider">INSIGHT</h4>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
                        {dilemma.hiddenMeaning}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 py-3 md:py-4 bg-green-400 text-black font-bold tracking-widest text-xs md:text-sm hover:bg-green-300 transition-all"
                    >
                      RESTART
                    </button>
                    <button
                      onClick={() => router.push('/gallery')}
                      className="flex-1 py-3 md:py-4 border-2 border-green-400/30 bg-transparent text-green-400 font-bold tracking-widest text-xs md:text-sm hover:bg-green-400/10 transition-all"
                    >
                      GALLERY
                    </button>
                  </div>
                </div>

                {/* Dilemma Info Card */}
                <div className="panel p-4 md:p-6 border border-green-400/20">
                  <h3 className="text-xs md:text-sm font-bold text-green-400 mb-3 md:mb-4 tracking-widest">METADATA</h3>
                  <div className="text-xs text-gray-500 space-y-2 md:space-y-3 font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">CATEGORY</span>
                      <span className="text-green-400">{dilemma.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AUTHOR</span>
                      <span className="text-green-400">{dilemma.author?.username || 'System'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIEWS</span>
                      <span className="text-green-400">{dilemma.viewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CHOICES</span>
                      <span className="text-green-400">{dilemma.choiceCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
