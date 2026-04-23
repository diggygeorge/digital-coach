'use client'

import { Flame, Trophy, TrendingUp, Award, Utensils, Dumbbell, Calendar, Play, Eye, Camera } from 'lucide-react'
import Link from 'next/link'
import { useAppContext } from '@/lib/store'

const GOAL_CAL: Record<string, number> = { cutting: 1700, bulking: 2700, maintain: 2200 }
const GOAL_MACROS: Record<string, { p: number; c: number; f: number }> = {
  cutting: { p: 180, c: 130, f: 55 },
  bulking: { p: 160, c: 370, f: 80 },
  maintain: { p: 150, c: 250, f: 70 },
}

function CalorieCircle({ current, total }: { current: number; total: number }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const pct = Math.min(current / Math.max(total, 1), 1)
  const offset = circ * (1 - pct)
  return (
    <div className="relative flex items-center justify-center w-36 h-36 md:w-40 md:h-40 shrink-0">
      <svg width="100%" height="100%" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f97316" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 80 80)" />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl md:text-2xl font-bold text-gray-900">{current}</div>
        <div className="text-xs text-gray-400">of {total}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { state, getTodayMacros, getStreak, getWorkoutHistory, getTodayMeals } = useAppContext()
  const macros = getTodayMacros()
  const streak = getStreak()
  const calTarget = GOAL_CAL[state.selectedGoalType] ?? 2200
  const macroTargets = GOAL_MACROS[state.selectedGoalType] ?? GOAL_MACROS.maintain
  const remaining = Math.max(calTarget - macros.cal, 0)
  const history = getWorkoutHistory()

  const nutritionItems = [
    { label: 'Protein', current: macros.protein, total: macroTargets.p },
    { label: 'Carbs', current: macros.carbs, total: macroTargets.c },
    { label: 'Fats', current: macros.fats, total: macroTargets.f },
  ]

  // This week tracker — compute from real data
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekDays = dayLabels.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const ds = d.toISOString().slice(0, 10)
    const hasWorkout = state.workoutHistory.some(w => w.date === ds)
    const hasNutrition = state.meals.some(m => m.date === ds)
    return { day, nutrition: hasNutrition, workout: hasWorkout }
  })

  const completedDays = weekDays.filter(d => d.nutrition || d.workout).length
  const overallPct = Math.round((completedDays / 14) * 100)

  // Goals from store
  const goals = state.goals.slice(0, 3)

  // Recent activity from workout history
  const recentWorkouts = history.slice(0, 2)

  const statCards = [
    { icon: <Flame size={22} />, iconBg: 'bg-orange-100', iconColor: 'text-orange-500', value: String(macros.cal), label: 'Calories Today', sub: `${remaining} remaining`, subColor: 'text-orange-500' },
    { icon: <Trophy size={22} />, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500', value: String(streak), label: 'Day Streak', sub: streak > 0 ? 'Keep it up!' : 'Start today!', subColor: 'text-yellow-500' },
    { icon: <TrendingUp size={22} />, iconBg: 'bg-green-100', iconColor: 'text-green-500', value: '+12%', label: 'Strength Gain', sub: 'This month', subColor: 'text-blue-500', badge: true },
    { icon: <Award size={22} />, iconBg: 'bg-purple-100', iconColor: 'text-purple-500', value: `${state.profile.currentWeight}kg`, label: 'Current Weight', sub: `Target: ${state.profile.targetWeight}kg`, subColor: 'text-purple-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {state.profile.name ? state.profile.name.split(' ')[0] : 'Athlete'}!</h1>
        <p className="text-gray-400 mt-1 text-sm">Here&apos;s your fitness and nutrition overview for today</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className={`${card.iconBg} ${card.iconColor} w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center mb-3 md:mb-4`}>
              {card.icon}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-xs md:text-sm text-gray-400 mb-1 md:mb-2">{card.label}</div>
            {card.badge
              ? <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{card.sub}</span>
              : <div className={`text-xs md:text-sm font-medium ${card.subColor}`}>{card.sub}</div>
            }
          </div>
        ))}
      </div>

      {/* Nutrition + This Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Today&apos;s Nutrition</h2>
            <Link href="/nutrition" className="bg-gray-900 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 hover:bg-gray-700 transition-colors">
              + Log Food
            </Link>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <CalorieCircle current={macros.cal} total={calTarget} />
            <div className="flex-1 space-y-3 md:space-y-4">
              {nutritionItems.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs md:text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="text-gray-400">{item.current}g / {item.total}g</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full" style={{ width: `${Math.min((item.current / Math.max(item.total, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-6">
            {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
              <Link key={meal} href="/nutrition" className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2 md:py-2.5 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Utensils size={13} /> {meal}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">This Week</h2>
          <div className="space-y-2.5">
            {weekDays.map(({ day, nutrition, workout }) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs md:text-sm text-gray-400 w-8">{day}</span>
                <div className={`flex-1 flex items-center justify-center py-1.5 md:py-2 rounded-lg ${nutrition ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                  <Utensils size={12} />
                </div>
                <div className={`flex-1 flex items-center justify-center py-1.5 md:py-2 rounded-lg ${workout ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                  <Dumbbell size={12} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500 text-xs">Overall Progress</span>
              <span className="text-green-500 font-semibold text-xs">{overallPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Workout + Recent Activity + Goals + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Workout */}
          <div className="bg-blue-600 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-blue-200 text-xs md:text-sm">
                <Calendar size={14} /> TODAY&apos;S WORKOUT
              </div>
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">Intermediate</span>
            </div>
            <h2 className="text-white font-bold text-xl md:text-2xl mb-1">Chest &amp; Triceps</h2>
            <div className="flex items-center gap-4 text-blue-200 text-xs md:text-sm mb-4 md:mb-5">
              <span className="flex items-center gap-1"><Dumbbell size={12} /> 6 exercises</span>
              <span>45-60 min</span>
            </div>
            <Link href="/workouts/session" className="w-full bg-white text-blue-600 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors text-sm md:text-base">
              <Play size={15} /> Start Workout
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
              <Link href="/progress" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentWorkouts.length > 0 ? recentWorkouts.map(w => {
                const d = new Date(w.date)
                const daysDiff = Math.round((Date.now() - d.getTime()) / 86400000)
                const when = daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Yesterday' : `${daysDiff} days ago`
                const mins = Math.round(w.duration / 60)
                return (
                  <div key={w.id} className="bg-gray-50 rounded-xl p-3 md:p-4 flex items-center gap-3">
                    <div className="bg-blue-100 rounded-xl p-2 shrink-0"><Dumbbell size={18} className="text-blue-500" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{w.workoutName}</div>
                      <div className="text-xs text-gray-400">{when}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-orange-500 flex items-center gap-1"><Flame size={11} /> {w.caloriesBurned} cal</div>
                      <div className="text-xs text-gray-400">{mins} min</div>
                    </div>
                    <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full shrink-0 hidden sm:block">Completed</span>
                  </div>
                )
              }) : (
                <>
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4 flex items-center gap-3">
                    <div className="bg-blue-100 rounded-xl p-2 shrink-0"><Dumbbell size={18} className="text-blue-500" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">No workouts yet</div>
                      <div className="text-xs text-gray-400">Start your first workout today</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Current Goals</h3>
            <div className="space-y-3">
              {goals.length > 0 ? goals.map(g => {
                const pct = g.type === 'weight'
                  ? Math.min(Math.max(((g.current - g.target) / (g.current - g.target + 1)) * 100, 0), 100)
                  : Math.min((g.current / Math.max(g.target, 1)) * 100, 100)
                const display = g.unit ? `${g.current}${g.unit}` : `${g.current}/${g.target}`
                return (
                  <div key={g.id} className="bg-blue-50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <span className="text-gray-600 text-xs md:text-sm">{g.label}</span>
                      <span className="font-bold text-sm text-blue-600">{display}</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              }) : (
                <p className="text-sm text-gray-400">No goals set yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/nutrition', icon: <Utensils size={16} />, label: 'Log Meal' },
                { href: '/workouts', icon: <Calendar size={16} />, label: 'Browse Workouts' },
                { href: '/workouts/scan', icon: <Camera size={16} />, label: 'Scan Equipment' },
                { href: '/progress', icon: <Eye size={16} />, label: 'View Progress' },
              ].map(a => (
                <Link key={a.label} href={a.href} className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
