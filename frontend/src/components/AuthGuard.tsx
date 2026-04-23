'use client'

import { useAuth } from '@/lib/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { AppProvider } from '@/lib/store'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, onboardingComplete } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn && pathname !== '/login') {
      router.replace('/login')
    }
    if (isLoggedIn && pathname === '/login') {
      router.replace('/')
    }
    if (isLoggedIn && !onboardingComplete && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
    if (isLoggedIn && onboardingComplete && pathname === '/onboarding') {
      router.replace('/')
    }
  }, [isLoggedIn, isLoading, pathname, router, onboardingComplete])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (pathname === '/login') {
    return <>{children}</>
  }

  if (!isLoggedIn) {
    return null
  }

  if (pathname === '/onboarding') {
    return (
      <AppProvider>
        {children}
      </AppProvider>
    )
  }

  if (!onboardingComplete) {
    return null
  }

  return (
    <AppProvider>
      <Navbar />
      <div className="pb-20 md:pb-0">
        {children}
      </div>
    </AppProvider>
  )
}
