"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserProfile {
  totalChoices: number
  categories: Record<string, number>
  recentChoices: Array<{
    id: string
    dilemmaTitle: string
    choice: string
    createdAt: string
  }>
  analysis?: {
    type: string
    description: string
  }
}

export default function ProfilePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12"
      >
        <button
          onClick={() => router.push('/')}
          className="mb-8 text-green-400 hover:text-green-300 transition-colors text-sm tracking-wider"
        >
          {t('stories.back')}
        </button>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 mystical-text">
          {t('profile.title')}
        </h1>
        <p className="text-lg text-gray-400 tracking-wide">
          {t('profile.subtitle')}
        </p>
      </motion.div>

      {loading ? (
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="divine-spinner mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      ) : !profile ? (
        <div className="max-w-6xl mx-auto text-center py-20">
          <p className="text-gray-500 mb-8">{t('profile.empty')}</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-green-400 text-black font-bold tracking-wider hover:bg-green-300 transition-all"
          >
            {t('profile.empty.button')}
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="panel border border-green-400/20 p-8 text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {profile.totalChoices}
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                {t('profile.stats.total')}
              </div>
            </div>

            <div className="panel border border-green-400/20 p-8 text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {Object.keys(profile.categories).length}
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                {t('profile.stats.categories')}
              </div>
            </div>

            <div className="panel border border-green-400/20 p-8 text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {profile.analysis ? '✓' : '-'}
              </div>
              <div className="text-sm text-gray-500 tracking-wide">
                {t('profile.stats.analysis')}
              </div>
            </div>
          </motion.div>

          {/* Categories Breakdown */}
          {Object.keys(profile.categories).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="panel border border-green-400/20 p-8"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6 tracking-wide">
                {t('profile.categories.title')}
              </h2>
              <div className="space-y-4">
                {Object.entries(profile.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-300 uppercase tracking-wider text-sm">
                        {category}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-black/60 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-400 h-full rounded-full"
                            style={{
                              width: `${(count / profile.totalChoices) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-green-400 font-bold w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Recent Choices */}
          {profile.recentChoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="panel border border-green-400/20 p-8"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6 tracking-wide">
                {t('profile.recent.title')}
              </h2>
              <div className="space-y-4">
                {profile.recentChoices.map((choice, index) => (
                  <div
                    key={choice.id}
                    className="flex items-center justify-between p-4 bg-black/40 border border-green-400/10 hover:border-green-400/30 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-300 mb-1">
                        {choice.dilemmaTitle}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {new Date(choice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-green-400 font-bold text-xl">
                      {choice.choice}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Personality Analysis */}
          {profile.analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="panel border border-green-400/20 p-8"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6 tracking-wide">
                {t('profile.analysis.title')}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl text-gray-300 mb-2 font-bold">
                    {profile.analysis.type}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {profile.analysis.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
