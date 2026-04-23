'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login, register } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<'signin' | 'register'>('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = login(signInEmail, signInPassword)
    if (result.success) {
      setSuccess('Signed in successfully!')
      router.replace('/')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (regPassword !== regConfirm) {
      setError('Passwords do not match')
      return
    }
    const result = register(regName, regEmail, regPassword)
    if (result.success) {
      router.replace('/onboarding')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  const switchTab = (newTab: 'signin' | 'register') => {
    setTab(newTab)
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Digital Coach</h1>
          <p className="text-blue-200 text-sm mt-1">Fitness & Nutrition</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
              {success}
            </div>
          )}

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Password must be at least 6 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
