'use client'

import { useState } from 'react'
import { Target, TrendingDown, TrendingUp, Minus, CheckCircle, Trash2, Plus, X } from 'lucide-react'
import { useAppContext } from '@/lib/store'

type GoalKey = 'cutting' | 'bulking' | 'maintain'

interface GoalConfig {
  label: string
  emoji: string
  description: string
  calTarget: number
  calDelta: number
  protein: number
  carbs: number
  fats: number
  weeklyChange: string
  timeline: string
  tips: string[]
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

const goalConfigs: Record<GoalKey, GoalConfig> = {
  cutting: {
    label: 'Cutting',
    emoji: '🔥',
    description: 'Lose fat while preserving muscle mass',
    calTarget: 1700,
    calDelta: -500,
    protein: 180,
    carbs: 130,
    fats: 55,
    weeklyChange: '-0.5 kg/week',
    timeline: '8-12 weeks',
    tips: [
      'High protein intake (2g/kg) prevents muscle loss',
      'Reduce carbs gradually, not drastically',
      'Keep training intensity high to preserve strength',
      'Prioritize sleep - cortisol increases fat storage',
    ],
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-600',
  },
  bulking: {
    label: 'Bulking',
    emoji: '💪',
    description: 'Build muscle with a clean calorie surplus',
    calTarget: 2700,
    calDelta: 500,
    protein: 160,
    carbs: 370,
    fats: 80,
    weeklyChange: '+0.25 kg/week',
    timeline: '16-24 weeks',
    tips: [
      'Eat more on training days, less on rest days',
      'Prioritize compound lifts for maximum growth',
      'Sleep 8+ hours — most muscle repair happens then',
      'Track weight weekly, aim for slow steady gain',
    ],
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600',
  },
  maintain: {
    label: 'Maintain',
    emoji: '⚖️',
    description: 'Stay lean and strong at current weight',
    calTarget: 2200,
    calDelta: 0,
    protein: 150,
    carbs: 250,
    fats: 70,
    weeklyChange: '0 kg/week',
    timeline: 'Ongoing',
    tips: [
      'Consistent calorie intake day to day',
      'Balance cardio and strength training',
      'Monitor body composition monthly, not weight',
      'Adjust intake if weight drifts over 2 weeks',
    ],
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-600',
  },
}

const goalIcons: Record<GoalKey, React.ReactNode> = {
  cutting: <TrendingDown size={22} />,
  bulking: <TrendingUp size={22} />,
  maintain: <Minus size={22} />,
}

function MacroBar({
  label,
  grams,
  calories,
  color,
  total,
}: {
  label: string
  grams: number
  calories: number
  color: string
  total: number
}) {
  const pct = Math.round((calories / Math.max(total, 1)) * 100)
  const barColors: Record<string, string> = {
    protein: 'bg-blue-500',
    carbs: 'bg-green-500',
    fats: 'bg-yellow-500',
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
        <span className="text-sm text-gray-500">
          {grams}g · {pct}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColors[color] ?? 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Goals() {
  const { state, setGoalType, addGoal, removeGoal } = useAppContext()
  const selectedGoal = state.selectedGoalType
  const cfg = goalConfigs[selectedGoal]

  const [showAddModal, setShowAddModal] = useState(false)
  const [newGoal, setNewGoal] = useState({ label: '', current: '', target: '', unit: '', type: 'weekly' as 'weekly' | 'weight' | 'strength' })

  const totalCal = cfg.protein * 4 + cfg.carbs * 4 + cfg.fats * 9

  const selectedBorderMap: Record<GoalKey, string> = {
    cutting: 'border-orange-400 bg-orange-50 ring-2 ring-orange-200',
    bulking: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200',
    maintain: 'border-green-400 bg-green-50 ring-2 ring-green-200',
  }
  const selectedIconBgMap: Record<GoalKey, string> = {
    cutting: 'bg-orange-100 text-orange-600',
    bulking: 'bg-blue-100 text-blue-600',
    maintain: 'bg-green-100 text-green-600',
  }
  const selectedLabelMap: Record<GoalKey, string> = {
    cutting: 'text-orange-700',
    bulking: 'text-blue-700',
    maintain: 'text-green-700',
  }

  const handleAddGoal = () => {
    if (!newGoal.label || !newGoal.target) return
    addGoal({
      label: newGoal.label,
      current: Number(newGoal.current) || 0,
      target: Number(newGoal.target) || 0,
      unit: newGoal.unit,
      type: newGoal.type,
    })
    setNewGoal({ label: '', current: '', target: '', unit: '', type: 'weekly' })
    setShowAddModal(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="mb-5 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Goals</h1>
        <p className="text-gray-400 text-sm mt-1">
          Choose your goal — everything updates automatically
        </p>
      </div>

      {/* Goal type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {(Object.keys(goalConfigs) as GoalKey[]).map(key => {
          const g = goalConfigs[key]
          const isSelected = selectedGoal === key
          return (
            <button
              key={key}
              onClick={() => setGoalType(key)}
              className={`rounded-2xl p-5 text-left border-2 transition-all duration-200 ${
                isSelected ? selectedBorderMap[key] : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div
                className={`rounded-xl p-3 mb-3 flex items-center justify-center w-12 h-12 ${
                  isSelected ? selectedIconBgMap[key] : 'bg-gray-100 text-gray-500'
                }`}
              >
                {goalIcons[key]}
              </div>
              <div
                className={`font-bold text-base mb-0.5 ${
                  isSelected ? selectedLabelMap[key] : 'text-gray-900'
                }`}
              >
                {g.emoji} {g.label}
              </div>
              <div className="text-xs text-gray-400 mb-2">{g.description}</div>
              <div className="text-sm font-semibold text-gray-600">
                {g.calDelta === 0
                  ? 'Maintenance calories'
                  : g.calDelta > 0
                  ? `+${g.calDelta} cal/day`
                  : `${g.calDelta} cal/day`}
              </div>
              {isSelected && (
                <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${cfg.textColor}`}>
                  <CheckCircle size={12} /> Active
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Nutrition Plan */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
              Your Nutrition Plan
            </h2>
            <p className={`text-xs mb-4 ${cfg.textColor}`}>
              {cfg.label} phase · {cfg.calTarget} kcal/day target
            </p>
            <div
              className={`${cfg.bgColor} border ${cfg.borderColor} rounded-xl p-4 mb-4 flex items-center justify-between`}
            >
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Daily Calorie Target</div>
                <div className={`text-3xl font-bold ${cfg.textColor}`}>
                  {cfg.calTarget.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">kcal per day</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5">vs Maintenance</div>
                <div className={`text-xl font-bold ${cfg.textColor}`}>
                  {cfg.calDelta === 0 ? '+/-0' : cfg.calDelta > 0 ? `+${cfg.calDelta}` : cfg.calDelta}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">kcal</div>
              </div>
            </div>
            <div className="space-y-3">
              <MacroBar
                label="Protein"
                grams={cfg.protein}
                calories={cfg.protein * 4}
                color="protein"
                total={totalCal}
              />
              <MacroBar
                label="Carbs"
                grams={cfg.carbs}
                calories={cfg.carbs * 4}
                color="carbs"
                total={totalCal}
              />
              <MacroBar
                label="Fats"
                grams={cfg.fats}
                calories={cfg.fats * 9}
                color="fats"
                total={totalCal}
              />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">
              Tips for {cfg.emoji} {cfg.label}
            </h2>
            <ul className="space-y-3">
              {cfg.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 shrink-0 ${cfg.textColor}`}>
                    <CheckCircle size={16} />
                  </span>
                  <span className="text-sm text-gray-600">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fitness Goals */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Fitness Goals</h2>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                <Target size={12} /> Add Goal
              </button>
            </div>
            <div className="space-y-4">
              {state.goals.length === 0 && (
                <p className="text-sm text-gray-400">No goals yet. Add one to get started.</p>
              )}
              {state.goals.map(g => {
                const pct = g.type === 'weight'
                  ? Math.min(Math.max(Math.round(((g.target - g.current) / Math.max(Math.abs(g.target - (g.current + (g.current > g.target ? 5 : -5))), 1)) * 100), 0), 100)
                  : Math.min(Math.round((g.current / Math.max(g.target, 1)) * 100), 100)
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs md:text-sm">
                          {g.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {g.current} / {g.target} {g.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                          {pct}%
                        </span>
                        <button onClick={() => removeGoal(g.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          {/* Daily Targets */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Daily Targets</h3>
            <div className="space-y-2 md:space-y-3">
              {[
                {
                  label: 'Calories',
                  value: `${cfg.calTarget.toLocaleString()} kcal`,
                  sub:
                    cfg.calDelta === 0
                      ? 'Maintenance'
                      : cfg.calDelta > 0
                      ? `+${cfg.calDelta} surplus`
                      : `${cfg.calDelta} deficit`,
                  bg: 'bg-orange-50',
                },
                {
                  label: 'Protein',
                  value: `${cfg.protein}g`,
                  sub: `${Math.round((cfg.protein * 4 / totalCal) * 100)}% of calories`,
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Carbs',
                  value: `${cfg.carbs}g`,
                  sub: `${Math.round((cfg.carbs * 4 / totalCal) * 100)}% of calories`,
                  bg: 'bg-green-50',
                },
                {
                  label: 'Fats',
                  value: `${cfg.fats}g`,
                  sub: `${Math.round((cfg.fats * 9 / totalCal) * 100)}% of calories`,
                  bg: 'bg-yellow-50',
                },
              ].map(t => (
                <div key={t.label} className={`${t.bg} rounded-xl p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-medium text-gray-600">{t.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.sub}</div>
                    </div>
                    <div className="font-bold text-gray-900 text-base">{t.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className={`${cfg.bgColor} rounded-2xl p-4 md:p-5 border ${cfg.borderColor}`}>
            <div className="text-3xl mb-2">📅</div>
            <div className={`text-2xl font-bold ${cfg.textColor}`}>{cfg.timeline}</div>
            <div className="text-xs text-gray-500 mt-0.5 mb-3">estimated timeline</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Weekly change:</span>
                <span className="font-semibold text-gray-800">{cfg.weeklyChange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Start date:</span>
                <span className="font-medium text-gray-700">Mar 31, 2026</span>
              </div>
            </div>
          </div>

          {/* Goal Projection */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Goal Projection</h3>
            <div className="space-y-2 text-sm">
              {selectedGoal === 'cutting' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Current weight</span>
                    <span className="font-medium">{state.profile.currentWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target weight</span>
                    <span className="font-medium text-orange-600">{state.profile.targetWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">At -0.5 kg/week</span>
                    <span className="font-medium">~{Math.ceil((state.profile.currentWeight - state.profile.targetWeight) / 0.5)} weeks</span>
                  </div>
                  <div className="mt-2 p-2.5 bg-orange-50 rounded-lg text-xs text-orange-700">
                    Maintain 1,700 kcal/day and you&apos;ll hit your target on schedule.
                  </div>
                </>
              )}
              {selectedGoal === 'bulking' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Current weight</span>
                    <span className="font-medium">{state.profile.currentWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target weight</span>
                    <span className="font-medium text-blue-600">{state.profile.currentWeight + 5} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">At +0.25 kg/week</span>
                    <span className="font-medium">~20 weeks</span>
                  </div>
                  <div className="mt-2 p-2.5 bg-blue-50 rounded-lg text-xs text-blue-700">
                    Eat 2,700 kcal/day consistently and you&apos;ll reach your target.
                  </div>
                </>
              )}
              {selectedGoal === 'maintain' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Current weight</span>
                    <span className="font-medium">{state.profile.currentWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target range</span>
                    <span className="font-medium text-green-600">{state.profile.currentWeight - 2}–{state.profile.currentWeight + 2} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Review every</span>
                    <span className="font-medium">2 weeks</span>
                  </div>
                  <div className="mt-2 p-2.5 bg-green-50 rounded-lg text-xs text-green-700">
                    Stay within +/-1 kg for 4 weeks — you&apos;re in maintenance mode.
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <div className="font-bold text-base mb-1">Keep Going!</div>
            <p className="text-xs text-blue-100">
              You&apos;re making great progress. Stay consistent with your {cfg.label.toLowerCase()} plan and
              you&apos;ll hit your targets!
            </p>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={newGoal.label} onChange={e => setNewGoal(p => ({ ...p, label: e.target.value }))} placeholder="Goal name (e.g. Bench Press 100kg)"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newGoal.current} onChange={e => setNewGoal(p => ({ ...p, current: e.target.value }))} placeholder="Current value" type="number"
                  className="border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} placeholder="Target value" type="number"
                  className="border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input value={newGoal.unit} onChange={e => setNewGoal(p => ({ ...p, unit: e.target.value }))} placeholder="Unit (e.g. kg, days, reps)"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={newGoal.type} onChange={e => setNewGoal(p => ({ ...p, type: e.target.value as 'weekly' | 'weight' | 'strength' }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="weekly">Weekly Goal</option>
                <option value="weight">Weight Goal</option>
                <option value="strength">Strength Goal</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddGoal} className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5">
                <Plus size={14} /> Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
