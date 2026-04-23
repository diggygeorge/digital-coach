'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Dumbbell, TrendingUp, Target, User, Activity, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Nutrition', href: '/nutrition', icon: Utensils },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Progress', href: '/progress', icon: TrendingUp },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Profile', href: '/profile', icon: User },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-blue-600 text-white p-1.5 md:p-2 rounded-lg">
            <Activity size={18} />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Digital Coach</div>
            <div className="text-xs text-gray-400 leading-tight hidden sm:block">Fitness & Nutrition</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Tablet nav — icons only */}
        <div className="hidden md:flex lg:hidden items-center gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`p-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop logout */}
          <button onClick={logout} className="hidden lg:block border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Logout
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1 z-30 sticky top-[57px]">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            )
          })}
          <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border-t border-gray-100 mt-1 pt-3">
            Logout
          </button>
        </div>
      )}

      {/* Mobile bottom nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} className="mb-0.5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
