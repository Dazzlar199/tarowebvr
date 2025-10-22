"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Dilemma } from '@prisma/client'

export default function ArchivePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ai' | 'default'>('all')

  useEffect(() => {
    loadDilemmas()
  }, [])

  const loadDilemmas = async () => {
    try {
      const response = await fetch('/api/dilemma/list?limit=100')
      const data = await response.json()

      if (data.success) {
        setDilemmas(data.data?.dilemmas || [])
      }
    } catch (error) {
      console.error('Failed to load dilemmas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDilemmas = dilemmas.filter(d => {
    if (filter === 'all') return true
    if (filter === 'ai') return d.id.includes('ai') || d.id.includes('gemini')
    if (filter === 'default') return d.id.includes('default')
    return true
  })

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
          {t('archive.title')}
        </h1>
        <p className="text-lg text-gray-400 tracking-wide">
          {t('archive.subtitle')}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto mb-8 flex gap-4"
      >
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 border transition-all ${
            filter === 'all'
              ? 'border-green-400 bg-green-400/10 text-green-400'
              : 'border-green-400/20 bg-black/40 text-gray-500'
          }`}
        >
          {t('archive.filter.all')}
        </button>
        <button
          onClick={() => setFilter('ai')}
          className={`px-6 py-3 border transition-all ${
            filter === 'ai'
              ? 'border-green-400 bg-green-400/10 text-green-400'
              : 'border-green-400/20 bg-black/40 text-gray-500'
          }`}
        >
          {t('archive.filter.ai')}
        </button>
        <button
          onClick={() => setFilter('default')}
          className={`px-6 py-3 border transition-all ${
            filter === 'default'
              ? 'border-green-400 bg-green-400/10 text-green-400'
              : 'border-green-400/20 bg-black/40 text-gray-500'
          }`}
        >
          {t('archive.filter.default')}
        </button>
      </motion.div>

      {/* Dilemma Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {loading ? (
          <div className="text-center py-20">
            <div className="divine-spinner mx-auto mb-4"></div>
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        ) : filteredDilemmas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-8">{t('archive.empty')}</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-green-400 text-black font-bold tracking-wider hover:bg-green-300 transition-all"
            >
              {t('archive.empty.button')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDilemmas.map((dilemma, index) => (
              <motion.div
                key={dilemma.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="panel border border-green-400/20 p-6 hover:border-green-400 transition-all cursor-pointer"
                onClick={() => router.push(`/explore/${dilemma.id}`)}
              >
                <h3 className="text-lg font-bold text-green-400 mb-3 tracking-wide">
                  {dilemma.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {dilemma.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {dilemma.id.includes('default') ? 'DEFAULT' : 'AI GENERATED'}
                  </span>
                  <span className="text-green-400">
                    {t('archive.card.explore')} →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
