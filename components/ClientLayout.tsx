"use client"

import { useEffect, useState } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SocketProvider } from '@/contexts/SocketContext'
import LanguageToggle from '@/components/LanguageToggle'
import HomeButton from '@/components/HomeButton'
import { Toaster } from 'react-hot-toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <LanguageProvider>
      <SocketProvider>
        {mounted && (
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#00ff41',
                border: '1px solid #00ff41',
                fontFamily: 'monospace',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#00ff41',
                  secondary: '#1a1a2e',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4444',
                  secondary: '#1a1a2e',
                },
                style: {
                  border: '1px solid #ff4444',
                },
              },
            }}
          />
        )}
        <HomeButton />
        <LanguageToggle />
        {children}
      </SocketProvider>
    </LanguageProvider>
  )
}
