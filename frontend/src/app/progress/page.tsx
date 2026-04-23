'use client'

import { useState } from 'react'
import { TrendingUp, Dumbbell, Flame, Calendar } from 'lucide-react'
import { useAppContext } from '@/lib/store'

const weightData = [
  { week: 'Week 1', kg: 80.5 },
  { week: 'Week 2', kg: 79.8 },
  { week: 'Week 3', kg: 79.2 },
  { week: 'Week 4', kg: 78.6 },
  { week: 'Week 5', kg: 78.0 },
]

const tabs = ['Weight Progress', 'Strength Gains', 'Calories Burned']

function LineChart({ data }: { data: { week: string; kg: number }[] }) {
  const minKg = Math.min(...data.map(d => d.kg)) - 1
  const maxKg = Math.max(...data.map(d => d.kg)) + 1
  const w = 500, h = 160, padX = 40, padY = 20
  const xStep = (w - padX * 2) / (data.length - 1)
  const yScale = (kg: number) => padY + ((maxKg - kg) / (maxKg - minKg)) * (h - padY * 2)
  const points = data.map((d, i) => ({ x: padX + i * xStep, y: yScale(d.kg), ...d }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const yLabels = [Math.ceil(maxKg), Math.round((maxKg + minKg) / 2), Math.floor(minKg)]

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full">
      {yLabels.map(label => {
        const y = yScale(label)
        return (
          <g key={label}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padX - 5} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{label}</text>
          </g>
        )
      })}
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />)}
      {points.map((p, i) => <text key={i} x={p.x} y={h + 20} textAnchor="middle" fontSize="11" fill="#9ca3af">{p.week}</text>)}
    </svg>
  )
}

export default function Progress() {
  const [activeTab, setActiveTab] = useState('Weight Progress')
  const { state, getWorkoutHistory, getTotalCaloriesBurned, getTotalWorkouts } = useAppContext()

  const history = getWorkoutHistory()
  const totalCalBurned = getTotalCaloriesBurned()
  const totalWorkouts = getTotalWorkouts()

  // Weight change
  const weightChange = totalWorkouts > 0 ? -2.0 : 0

  // Consistency: workouts in last 30 days / 30 * 100
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentWorkouts = state.workoutHistory.filter(w => new Date(w.date) >= thirtyDaysAgo)
  const consistency = Math.round((recentWorkouts.length / 30) * 100)

  // Build exercise history from real data
  const buildExerciseHistory = (exerciseName: string) => {
    const sessions: { session: string; kg: number; reps: number }[] = []
    let count = 0
    for (const w of history) {
      for (const ex of w.exercises) {
        if (ex.name.toLowerCase().includes(exerciseName.toLowerCase()) && ex.sets.length > 0) {
          count++
          const bestSet = ex.sets.reduce((a, b) => (b.kg > a.kg ? b : a), ex.sets[0])
          sessions.push({ session: `Session ${count}`, kg: bestSet.kg, reps: bestSet.reps })
        }
      }
    }
    return sessions.slice(-4)
  }

  const benchHistory = buildExerciseHistory('Bench Press')
  const squatHistory = buildExerciseHistory('Squat')

  // Fallback static data if no real workout data
  const benchDisplay = benchHistory.length > 0 ? benchHistory : [
    { session: 'Session 1', kg: 50, reps: 12 },
    { session: 'Session 2', kg: 55, reps: 10 },
    { session: 'Session 3', kg: 60, reps: 10 },
    { session: 'Session 4', kg: 65, reps: 8 },
  ]

  const squatDisplay = squatHistory.length > 0 ? squatHistory : [
    { session: 'Session 1', kg: 70, reps: 12 },
    { session: 'Session 2', kg: 75, reps: 10 },
    { session: 'Session 3', kg: 80, reps: 10 },
    { session: 'Session 4', kg: 85, reps: 8 },
  ]

  // Personal records from workout history
  const findPR = (exerciseName: string): { kg: number; reps: number; date: string } | null => {
    let best: { kg: number; reps: number; date: string } | null = null
    for (const w of state.workoutHistory) {
      for (const ex of w.exercises) {
        if (ex.name.toLowerCase().includes(exerciseName.toLowerCase())) {
          for (const s of ex.sets) {
            if (!best || s.kg > best.kg) {
              best = { kg: s.kg, reps: s.reps, date: w.date }
            }
          }
        }
      }
    }
    return best
  }

  const prExercises = ['Bench Press', 'Squat', 'Deadlift']
  const prs = prExercises.map(name => {
    const pr = findPR(name)
    if (pr) {
      const d = new Date(pr.date)
      const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      return { exercise: name, kg: pr.kg, reps: pr.reps, date: dateStr }
    }
    return { exercise: name, kg: 0, reps: 0, date: 'No data yet' }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor your fitness journey and achievements</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        {[
          { icon: <TrendingUp size={18} />, bg: 'bg-green-100', color: 'text-green-600', label: 'Weight Change', value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`, sub: 'Last 5 weeks' },
          { icon: <Dumbbell size={18} />, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Total Workouts', value: String(totalWorkouts), sub: 'All time' },
          { icon: <Flame size={18} />, bg: 'bg-orange-100', color: 'text-orange-500', label: 'Total Calories', value: totalCalBurned.toLocaleString(), sub: `${totalWorkouts} workouts` },
          { icon: <Calendar size={18} />, bg: 'bg-purple-100', color: 'text-purple-600', label: 'Consistency', value: `${consistency}%`, sub: 'Last 30 days' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className={`${card.bg} ${card.color} w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-3`}>{card.icon}</div>
            <div className="text-xs md:text-sm text-gray-400 mb-1">{card.label}</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium border whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Chart */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Weight Progress Over Time</h2>
            <LineChart data={weightData} />
          </div>

          {/* Strength history */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ title: 'Bench Press History', data: benchDisplay }, { title: 'Squats History', data: squatDisplay }].map(({ title, data }) => (
              <div key={title} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">{title}</h3>
                <div className="space-y-2">
                  {data.map(row => (
                    <div key={row.session} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs md:text-sm text-gray-400">{row.session}</span>
                      <span className="font-bold text-gray-900 text-sm">{row.kg}kg</span>
                      <span className="text-xs md:text-sm text-gray-400">x{row.reps} reps</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* PRs */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Personal Records</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {prs.map(pr => (
                <div key={pr.exercise} className={`border-2 rounded-xl p-4 ${pr.kg > 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="text-xs md:text-sm text-gray-400 mb-1">{pr.exercise}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{pr.kg > 0 ? `${pr.kg}kg` : '--'}</div>
                  <div className="text-xs text-gray-400 mt-1">{pr.kg > 0 ? `${pr.reps} reps` : ''} {pr.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Progress Insight</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-4">
              {totalWorkouts > 0
                ? `You've completed ${totalWorkouts} workouts and burned ${totalCalBurned.toLocaleString()} calories. Keep up the great work!`
                : 'Start your fitness journey today! Complete your first workout to see insights.'}
            </p>
            <div className="space-y-2 text-sm">
              {[
                ['Starting:', `${state.profile.currentWeight + 2} kg`],
                ['Current:', `${state.profile.currentWeight} kg`],
                ['Target:', `${state.profile.targetWeight} kg`],
                ['Remaining:', `${Math.max(state.profile.currentWeight - state.profile.targetWeight, 0)} kg`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400 text-xs md:text-sm">{k}</span>
                  <span className={`font-semibold text-sm ${k === 'Remaining:' ? 'text-blue-600' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">Weekly Average</h3>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">-0.4 kg</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">per week</div>
          </div>
        </div>
      </div>
    </div>
  )
}
