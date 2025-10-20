"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface World {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  viewCount: number
  likeCount: number
  author: {
    username: string
  }
  tags: string[]
}

export default function GalleryPage() {
  const router = useRouter()
  const [worlds, setWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    fetchWorlds()
  }, [sort])

  async function fetchWorlds() {
    try {
      setLoading(true)
      const response = await fetch(`/api/world/gallery?sort=${sort}`)
      const data = await response.json()

      if (data.success) {
        setWorlds(data.data.worlds)
      }
    } catch (error) {
      console.error('Failed to fetch worlds:', error)
    } finally {
      setLoading(false)
    }
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
              세계 갤러리
            </h1>
            <button
              onClick={() => router.push('/')}
              className="accent-gradient px-6 py-3"
            >
              + 새 세계 만들기
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex gap-3">
            {['recent', 'popular', 'views'].map((option) => (
              <button
                key={option}
                onClick={() => setSort(option)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  sort === option
                    ? 'accent-gradient'
                    : 'panel hover:border-outline'
                }`}
                style={sort !== option ? {
                  background: 'rgba(10, 20, 15, 0.5)',
                  border: '2px solid rgba(0, 255, 65, 0.3)',
                  color: 'var(--foreground)'
                } : {}}
              >
                {option === 'recent' && '최신순'}
                {option === 'popular' && '인기순'}
                {option === 'views' && '조회순'}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video bg-white/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : worlds.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-xl" style={{ color: 'var(--text-muted)' }}>아직 생성된 세계가 없습니다</p>
            <button
              onClick={() => router.push('/')}
              className="accent-gradient mt-6 px-8 py-3"
            >
              첫 세계 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/explore/${world.id}`)}
                className="group cursor-pointer"
              >
                <div className="world-card relative aspect-video overflow-hidden">
                  {world.thumbnailUrl ? (
                    <Image
                      src={world.thumbnailUrl}
                      alt={world.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                      <div className="text-6xl">🌌</div>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {world.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {world.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-lg line-clamp-1 transition-colors" style={{
                    color: 'var(--foreground)',
                    background: 'linear-gradient(135deg, #00ff41, #00ffcc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.5))'
                  }}>
                    {world.title}
                  </h3>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {world.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs" style={{ color: 'rgba(0, 255, 65, 0.7)' }}>
                      by {world.author.username}
                    </span>
                    {world.tags.length > 0 && (
                      <div className="flex gap-1">
                        {world.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              background: 'rgba(0, 255, 65, 0.15)',
                              color: '#00ff41',
                              border: '1px solid rgba(0, 255, 65, 0.4)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
