"use client"

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

/**
 * Global Home Button - appears on all pages except homepage
 * Fixed to left-center of screen
 */
export default function HomeButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on homepage
  if (pathname === '/') {
    return null
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={() => router.push('/')}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 group"
      aria-label="Go to homepage"
    >
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl group-hover:bg-green-400/30 transition-all" />

        {/* Button container */}
        <div className="relative flex flex-col items-center gap-1.5 p-3 bg-black/80 border-2 border-green-400/40 rounded-lg hover:border-green-400 hover:bg-black/90 transition-all backdrop-blur-sm">
          {/* Home Icon */}
          <svg
            className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>

          {/* Label */}
          <span className="text-xs font-bold text-green-400 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Home
          </span>
        </div>

        {/* Floating particles effect */}
        <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute top-0 left-0 w-1 h-1 bg-green-400 rounded-full animate-ping" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-green-400 rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-green-400 rounded-full animate-ping animation-delay-600" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-green-400 rounded-full animate-ping animation-delay-900" />
        </div>
      </div>
    </motion.button>
  )
}
