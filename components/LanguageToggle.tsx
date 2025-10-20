"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import { motion } from 'framer-motion'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-green-400/30 p-1">
        <button
          onClick={() => setLanguage('ko')}
          className={`px-4 py-2 text-xs font-bold tracking-wider transition-all ${
            language === 'ko'
              ? 'bg-green-400 text-black'
              : 'text-gray-500 hover:text-green-400'
          }`}
        >
          한글
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 text-xs font-bold tracking-wider transition-all ${
            language === 'en'
              ? 'bg-green-400 text-black'
              : 'text-gray-500 hover:text-green-400'
          }`}
        >
          ENG
        </button>
      </div>
    </div>
  )
}
