"use client"

import { LanguageProvider } from '@/contexts/LanguageContext'
import { SocketProvider } from '@/contexts/SocketContext'
import LanguageToggle from '@/components/LanguageToggle'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SocketProvider>
        <LanguageToggle />
        {children}
      </SocketProvider>
    </LanguageProvider>
  )
}
