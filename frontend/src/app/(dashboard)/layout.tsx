'use client'

import React, { MainLayout } from '@/components/layout/MainLayout'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Determine if sidebar should be shown for specific routes
  const showSidebar = !pathname.includes('/fullscreen') // example condition
  
  return (
    <MainLayout showSidebar={showSidebar}>
      {children}
    </MainLayout>
  )
}