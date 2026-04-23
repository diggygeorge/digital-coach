'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface User {
  email: string
  name: string
  password: string
}

interface SessionUser {
  email: string
  name: string
  onboardingComplete: boolean
}

interface AuthContextType {
  isLoggedIn: boolean
  user: SessionUser | null
  onboardingComplete: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  completeOnboarding: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem('digital-coach-users')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveUsers(users: User[]) {
  localStorage.setItem('digital-coach-users', JSON.stringify(users))
}

function getOnboardingStatus(email: string): boolean {
  try {
    return localStorage.getItem(`digital-coach-onboarding-${email}`) === 'true'
  } catch {}
  return false
}

function saveOnboardingStatus(email: string, complete: boolean) {
  localStorage.setItem(`digital-coach-onboarding-${email}`, String(complete))
}

function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem('digital-coach-session')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveSession(session: SessionUser | null) {
  if (session) {
    localStorage.setItem('digital-coach-session', JSON.stringify(session))
  } else {
    localStorage.removeItem('digital-coach-session')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setUser(session)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const users = getUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) {
      return { success: false, error: 'No account found with this email' }
    }
    if (found.password !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password' }
    }
    const onboardingComplete = getOnboardingStatus(found.email)
    const session: SessionUser = { email: found.email, name: found.name, onboardingComplete }
    saveSession(session)
    setUser(session)
    return { success: true }
  }, [])

  const register = useCallback((name: string, email: string, password: string): { success: boolean; error?: string } => {
    if (!name.trim()) {
      return { success: false, error: 'Name is required' }
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' }
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }
    const users = getUsers()
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { success: false, error: 'An account with this email already exists' }
    }
    const newUser: User = { email, name: name.trim(), password: simpleHash(password) }
    users.push(newUser)
    saveUsers(users)
    const session: SessionUser = { email: newUser.email, name: newUser.name, onboardingComplete: false }
    saveSession(session)
    setUser(session)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setUser(null)
  }, [])

  const completeOnboarding = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev
      saveOnboardingStatus(prev.email, true)
      const updated: SessionUser = { ...prev, onboardingComplete: true }
      saveSession(updated)
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, onboardingComplete: user?.onboardingComplete ?? false, login, register, logout, completeOnboarding, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
