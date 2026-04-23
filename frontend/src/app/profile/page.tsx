'use client'

import { useState } from 'react'
import { Pencil, Bell, LogOut, Dumbbell, TrendingUp, Award, Target, X, Save } from 'lucide-react'
import { useAppContext } from '@/lib/store'
import { useAuth } from '@/lib/auth'

function CircleProgress({ pct }: { pct: number }) {
  const r = 52, circ = 2 * Math.PI * r
  const clampedPct = Math.min(Math.max(pct, 0), 100)
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="65" cy="65" r={r} fill="none" stroke="#2563eb" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - clampedPct / 100)}
        strokeLinecap="round" transform="rotate(-90 65 65)" />
      <text x="65" y="62" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827">{clampedPct}%</text>
      <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#9ca3af">To Goal</text>
    </svg>
  )
}

export default function Profile() {
  const {
    state, updateProfile, getTotalWorkouts, getTotalTime,
    getTotalCaloriesBurned, getStreak, getWorkoutHistory,
    toggleNotifications, removeGoal, resetData,
  } = useAppContext()

  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: state.profile.name,
    email: state.profile.email,
    height: String(state.profile.height),
    currentWeight: String(state.profile.currentWeight),
    targetWeight: String(state.profile.targetWeight),
    bodyFat: String(state.profile.bodyFat),
    level: state.profile.level as string,
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const totalWorkouts = getTotalWorkouts()
  const totalTimeSec = getTotalTime()
  const totalTimeHrs = Math.round(totalTimeSec / 3600)
  const totalTimeMin = Math.round(totalTimeSec / 60)
  const timeDisplay = totalTimeHrs > 0 ? `${totalTimeHrs}h` : `${totalTimeMin}m`
  const totalCalBurned = getTotalCaloriesBurned()
  const streak = getStreak()
  const history = getWorkoutHistory()

  const stats = [
    { label: 'Total Workouts', value: String(totalWorkouts) },
    { label: 'Total Time', value: timeDisplay },
    { label: 'Calories Burned', value: totalCalBurned >= 1000 ? `${(totalCalBurned / 1000).toFixed(1)}k` : String(totalCalBurned) },
    { label: 'Current Streak', value: streak > 0 ? `${streak} days` : '0' },
  ]

  // Weight progress
  const weightDiff = state.profile.currentWeight - state.profile.targetWeight
  const startWeight = state.profile.currentWeight + 5 // assume started 5kg above current
  const totalToLose = startWeight - state.profile.targetWeight
  const lost = startWeight - state.profile.currentWeight
  const weightPct = totalToLose > 0 ? Math.round((lost / totalToLose) * 100) : 0

  // Achievements
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentWorkoutCount = state.workoutHistory.filter(w => new Date(w.date) >= thirtyDaysAgo).length
  const consistency = Math.round((recentWorkoutCount / 30) * 100)

  const achievements = [
    { emoji: '🎯', label: 'First Workout', unlocked: totalWorkouts >= 1 },
    { emoji: '🔥', label: '7 Day Streak', unlocked: streak >= 7 },
    { emoji: '💪', label: '10 Workouts', unlocked: totalWorkouts >= 10 },
    { emoji: '🏆', label: '30 Workouts', unlocked: totalWorkouts >= 30 },
    { emoji: '⚡', label: 'PR Setter', unlocked: totalWorkouts >= 1 },
    { emoji: '👑', label: '100 Workouts', unlocked: totalWorkouts >= 100 },
    { emoji: '🎖️', label: 'Weight Goal', unlocked: state.profile.currentWeight <= state.profile.targetWeight },
    { emoji: '💎', label: 'Consistency King', unlocked: consistency > 90 },
  ]
  const unlockedCount = achievements.filter(a => a.unlocked).length

  // This month stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthWorkouts = state.workoutHistory.filter(w => new Date(w.date) >= monthStart)
  const monthCalBurned = monthWorkouts.reduce((s, w) => s + w.caloriesBurned, 0)

  const monthStats = [
    { icon: <Dumbbell size={15} className="text-purple-500" />, label: 'Workouts', value: String(monthWorkouts.length) },
    { icon: <TrendingUp size={15} className="text-green-500" />, label: 'Strength Gain', value: '+8%' },
    { icon: <Award size={15} className="text-yellow-500" />, label: 'Calories Burned', value: monthCalBurned.toLocaleString() },
  ]

  const openEditModal = () => {
    setEditForm({
      name: state.profile.name,
      email: state.profile.email,
      height: String(state.profile.height),
      currentWeight: String(state.profile.currentWeight),
      targetWeight: String(state.profile.targetWeight),
      bodyFat: String(state.profile.bodyFat),
      level: state.profile.level,
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = () => {
    updateProfile({
      name: editForm.name,
      email: editForm.email,
      height: Number(editForm.height) || state.profile.height,
      currentWeight: Number(editForm.currentWeight) || state.profile.currentWeight,
      targetWeight: Number(editForm.targetWeight) || state.profile.targetWeight,
      bodyFat: Number(editForm.bodyFat) || state.profile.bodyFat,
      level: editForm.level as 'Beginner' | 'Intermediate' | 'Advanced',
    })
    setShowEditModal(false)
  }

  const { logout: authLogout } = useAuth()

  const handleLogout = () => {
    resetData()
    authLogout()
  }

  const initials = state.profile.name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* Blue banner */}
      <div className="bg-blue-600 rounded-2xl p-4 md:p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl md:text-2xl">{state.profile.name}</h1>
            <p className="text-blue-200 text-xs md:text-sm">{state.profile.email}</p>
            <p className="text-blue-300 text-xs mt-0.5">Member since {state.profile.joinDate ? new Date(state.profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2026'}</p>
          </div>
        </div>
        <button onClick={openEditModal} className="bg-white text-blue-600 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors">
          <Pencil size={13} /> Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Body Metrics */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 md:mb-5 text-sm md:text-base">Body Metrics</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full space-y-2">
                {[
                  ['Height', `${state.profile.height} cm`],
                  ['Current Weight', `${state.profile.currentWeight} kg`],
                  ['Target Weight', `${state.profile.targetWeight} kg`],
                  ['Body Fat', `${state.profile.bodyFat}%`],
                  ['Level', state.profile.level],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400 text-xs md:text-sm">{k}</span>
                    <span className="font-bold text-gray-900 text-sm md:text-base">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center shrink-0">
                <CircleProgress pct={weightPct} />
                <p className="text-xs md:text-sm text-gray-400 mt-2">{Math.max(weightDiff, 0)} kg remaining</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Achievements</h2>
              <span className="text-xs md:text-sm text-gray-400">{unlockedCount}/{achievements.length} unlocked</span>
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {achievements.map(a => (
                <div key={a.label} className={`rounded-xl p-3 md:p-4 text-center border-2 ${a.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`text-2xl md:text-3xl mb-1 md:mb-2 ${!a.unlocked ? 'grayscale opacity-40' : ''}`}>{a.emoji}</div>
                  <div className={`text-xs font-medium leading-tight ${a.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm md:text-base flex items-center gap-2">
              <Target size={15} className="text-blue-500" /> Current Goals
            </h3>
            <div className="space-y-3">
              {state.goals.length === 0 && <p className="text-sm text-gray-400">No goals set yet.</p>}
              {state.goals.map(g => {
                const pct = g.type === 'weight'
                  ? Math.min(Math.max(Math.round(((g.current - g.target) / Math.max(Math.abs(g.current - g.target + 1), 1)) * 100), 0), 100)
                  : Math.min(Math.round((g.current / Math.max(g.target, 1)) * 100), 100)
                const display = g.unit ? `${g.current}${g.unit}` : `${g.current}/${g.target}`
                return (
                  <div key={g.id} className="bg-blue-50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs md:text-sm text-gray-600">{g.label}</span>
                      <span className="text-sm font-bold text-blue-600">{display}</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Settings</h3>
            <div className="space-y-1">
              <button onClick={openEditModal} className="w-full flex items-center justify-between px-3 py-3 text-xs md:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <span>Edit Profile</span>
                <Pencil size={14} />
              </button>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-xs md:text-sm text-gray-600">Notifications</span>
                <button
                  onClick={toggleNotifications}
                  className={`relative w-11 h-6 rounded-full transition-colors ${state.notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${state.notifications ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm md:text-base">This Month</h3>
            <div className="space-y-3">
              {monthStats.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">{s.icon} {s.label}</div>
                  <span className="font-bold text-gray-900 text-sm">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full border border-red-200 text-red-500 rounded-xl py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
                  <input value={editForm.height} onChange={e => setEditForm(p => ({ ...p, height: e.target.value }))} type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Body Fat %</label>
                  <input value={editForm.bodyFat} onChange={e => setEditForm(p => ({ ...p, bodyFat: e.target.value }))} type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Current Weight (kg)</label>
                  <input value={editForm.currentWeight} onChange={e => setEditForm(p => ({ ...p, currentWeight: e.target.value }))} type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Target Weight (kg)</label>
                  <input value={editForm.targetWeight} onChange={e => setEditForm(p => ({ ...p, targetWeight: e.target.value }))} type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Level</label>
                <select value={editForm.level} onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-sm shadow-xl text-center">
            <LogOut size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Log Out</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to log out? All your data will be reset.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleLogout} className="flex-1 bg-red-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-red-700">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
