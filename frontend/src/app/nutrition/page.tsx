'use client'

import { useState } from 'react'
import { Utensils, Plus, Trash2, Clock, Search, TrendingUp, Droplets, Flame, Minus } from 'lucide-react'
import { useAppContext } from '@/lib/store'
import type { MealEntry } from '@/lib/store'

const quickFoods = ['Chicken Breast', 'Brown Rice', 'Broccoli', 'Eggs', 'Salmon', 'Sweet Potato', 'Greek Yogurt', 'Almonds']

const GOAL_CAL: Record<string, number> = { cutting: 1700, bulking: 2700, maintain: 2200 }
const GOAL_MACROS: Record<string, { p: number; c: number; f: number }> = {
  cutting: { p: 180, c: 130, f: 55 },
  bulking: { p: 160, c: 370, f: 80 },
  maintain: { p: 150, c: 250, f: 70 },
}

const GOAL_LABELS: Record<string, { emoji: string; label: string; desc: string }> = {
  cutting: { emoji: '🔥', label: 'Cutting', desc: 'Calorie deficit to lose fat' },
  bulking: { emoji: '💪', label: 'Bulking', desc: 'Calorie surplus to build muscle' },
  maintain: { emoji: '⚖️', label: 'Maintain', desc: 'Maintain current weight' },
}

type MealKey = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'

export default function Nutrition() {
  const { state, getTodayMeals, getTodayMacros, addMeal, removeMeal, addWater, removeWater, getTodayWater } = useAppContext()

  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFood, setNewFood] = useState({ name: '', amount: '', meal: 'Breakfast' as MealKey, cal: '', p: '', c: '', f: '' })

  const filters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

  const todayMeals = getTodayMeals()
  const totals = getTodayMacros()
  const water = getTodayWater()
  const calTarget = GOAL_CAL[state.selectedGoalType] ?? 2200
  const macroTargets = GOAL_MACROS[state.selectedGoalType] ?? GOAL_MACROS.maintain
  const goalInfo = GOAL_LABELS[state.selectedGoalType] ?? GOAL_LABELS.maintain

  const TARGETS = { cal: calTarget, p: macroTargets.p, c: macroTargets.c, f: macroTargets.f }

  const mealTypes: MealKey[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

  const grouped: Record<MealKey, MealEntry[]> = {
    Breakfast: todayMeals.filter(m => m.meal === 'Breakfast'),
    Lunch: todayMeals.filter(m => m.meal === 'Lunch'),
    Dinner: todayMeals.filter(m => m.meal === 'Dinner'),
    Snack: todayMeals.filter(m => m.meal === 'Snack'),
  }

  const visibleMeals = activeFilter === 'All'
    ? mealTypes
    : mealTypes.filter(m => m === activeFilter)

  const handleAddFood = () => {
    if (!newFood.name) return
    addMeal({
      name: newFood.name,
      amount: newFood.amount || '1 serving',
      meal: newFood.meal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cal: Number(newFood.cal) || 0,
      protein: Number(newFood.p) || 0,
      carbs: Number(newFood.c) || 0,
      fats: Number(newFood.f) || 0,
    })
    setNewFood({ name: '', amount: '', meal: 'Breakfast', cal: '', p: '', c: '', f: '' })
    setShowAddModal(false)
  }

  // Nutrition streak: consecutive days going backwards where total calories are within 200 of target
  const computeStreak = () => {
    let streak = 0
    const today = new Date()
    for (let i = 1; i <= 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const dayMeals = state.meals.filter(m => m.date === ds)
      if (dayMeals.length === 0) break
      const dayCal = dayMeals.reduce((s, m) => s + m.cal, 0)
      if (Math.abs(dayCal - calTarget) <= 200) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  const nutritionStreak = computeStreak()

  const macroItems = [
    { label: 'Calories', icon: <Flame size={16} className="text-orange-500" />, bg: 'bg-orange-50', val: totals.cal, target: TARGETS.cal, unit: '', color: 'text-orange-500' },
    { label: 'Protein', letter: 'P', bg: 'bg-blue-50', val: totals.protein, target: TARGETS.p, unit: 'g', color: 'text-blue-500' },
    { label: 'Carbs', letter: 'C', bg: 'bg-green-50', val: totals.carbs, target: TARGETS.c, unit: 'g', color: 'text-green-500' },
    { label: 'Fats', letter: 'F', bg: 'bg-yellow-50', val: totals.fats, target: TARGETS.f, unit: 'g', color: 'text-yellow-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nutrition Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">Track your daily food intake and macros</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Summary */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Today&apos;s Summary</h2>
              <button onClick={() => setShowAddModal(true)} className="bg-gray-900 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 hover:bg-gray-700 transition-colors">
                <Plus size={14} /> Add Food
              </button>
            </div>

            {/* Macro cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
              {macroItems.map((m) => (
                <div key={m.label} className={`${m.bg} rounded-xl p-3`}>
                  <div className="text-sm font-bold">
                    {'icon' in m && m.icon ? m.icon : <span className={`font-bold ${m.color}`}>{'letter' in m ? m.letter : ''}</span>}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{m.val}{m.unit}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                  <div className={`text-xs font-medium ${m.color} mt-0.5`}>{Math.max(m.target - m.val, 0)}{m.unit} left</div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              {[
                { label: 'Calories', val: totals.cal, target: TARGETS.cal, display: `${totals.cal} / ${TARGETS.cal}` },
                { label: 'Protein', val: totals.protein, target: TARGETS.p, display: `${totals.protein}g / ${TARGETS.p}g` },
                { label: 'Carbs', val: totals.carbs, target: TARGETS.c, display: `${totals.carbs}g / ${TARGETS.c}g` },
                { label: 'Fats', val: totals.fats, target: TARGETS.f, display: `${totals.fats}g / ${TARGETS.f}g` },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-gray-500">{bar.label}</span>
                    <span className="text-gray-400">{bar.display}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${Math.min((bar.val / Math.max(bar.target, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meals */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Today&apos;s Meals</h2>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border whitespace-nowrap transition-colors ${
                    activeFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            {visibleMeals.map(mealKey => (
              <div key={mealKey} className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils size={15} className="text-gray-400" />
                  <h3 className="font-semibold text-gray-700 text-sm">{mealKey}</h3>
                </div>
                <div className="space-y-2">
                  {grouped[mealKey].length === 0
                    ? <p className="text-sm text-gray-300 pl-2">No items logged</p>
                    : grouped[mealKey].map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-3 md:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span>{item.amount}</span>
                              <span className="flex items-center gap-0.5"><Clock size={10} />{item.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 md:gap-5 shrink-0">
                            {[['Cal', item.cal, ''], ['P', item.protein, 'g'], ['C', item.carbs, 'g'], ['F', item.fats, 'g']].map(([k, v, u]) => (
                              <div key={String(k)} className="text-right hidden sm:block">
                                <div className="text-xs text-gray-400">{k}</div>
                                <div className="font-bold text-gray-900 text-sm">{v}{u}</div>
                              </div>
                            ))}
                            {/* Mobile: just calories */}
                            <div className="text-right sm:hidden">
                              <div className="text-xs text-gray-400">Cal</div>
                              <div className="font-bold text-gray-900 text-sm">{item.cal}</div>
                            </div>
                            <button onClick={() => removeMeal(item.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Current Goal */}
          <div className="bg-purple-600 rounded-2xl p-5 text-white">
            <div className="text-sm font-medium text-purple-200 mb-3">Current Goal</div>
            <div className="bg-purple-500 rounded-xl p-4 mb-3">
              <div className="text-xs text-purple-300 mb-1">Goal Type</div>
              <div className="text-xl md:text-2xl font-bold">{goalInfo.emoji} {goalInfo.label}</div>
              <div className="text-sm text-purple-200 mt-1">{goalInfo.desc}</div>
            </div>
            <div className="text-xs text-purple-200 mb-1">Daily Target: {calTarget} kcal</div>
            <div className="bg-white rounded-lg h-2">
              <div className="bg-purple-300 h-2 rounded-lg" style={{ width: `${Math.min((totals.cal / Math.max(calTarget, 1)) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Quick Add</h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search foods..."
                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              {quickFoods.filter(f => f.toLowerCase().includes(search.toLowerCase())).map(food => (
                <button key={food} onClick={() => { setNewFood(p => ({ ...p, name: food })); setShowAddModal(true) }}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  {food}
                </button>
              ))}
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Droplets size={17} className="text-blue-500" /> Water Intake
            </h3>
            <div className="text-center my-3">
              <div className="text-3xl font-bold text-gray-900 mt-1">{water.toLocaleString()} / 2,500</div>
              <div className="text-sm text-gray-400">ml today</div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((water / 2500) * 100, 100)}%` }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => removeWater(250)}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5">
                <Minus size={14} /> 250ml
              </button>
              <button onClick={() => addWater(250)}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5">
                <Plus size={14} /> 250ml
              </button>
            </div>
          </div>

          {/* Nutrition Streak */}
          <div className="bg-green-50 rounded-2xl p-4 md:p-5 border border-green-100">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2 text-sm">
              <TrendingUp size={15} /> Nutrition Streak
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">{nutritionStreak} days</div>
            <p className="text-sm text-gray-500 mt-2">
              {nutritionStreak > 0
                ? `You've hit your calorie goal ${nutritionStreak} days in a row!`
                : 'Hit your calorie target to start a streak!'}
            </p>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Food</h3>
            <div className="space-y-3">
              <input value={newFood.name} onChange={e => setNewFood(p => ({ ...p, name: e.target.value }))} placeholder="Food name"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newFood.amount} onChange={e => setNewFood(p => ({ ...p, amount: e.target.value }))} placeholder="Amount (e.g. 200g, 1 cup)"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={newFood.meal} onChange={e => setNewFood(p => ({ ...p, meal: e.target.value as MealKey }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="grid grid-cols-4 gap-2">
                {(['cal', 'p', 'c', 'f'] as const).map(key => (
                  <input key={key} value={newFood[key]} onChange={e => setNewFood(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={key === 'cal' ? 'Cal' : key === 'p' ? 'Protein' : key === 'c' ? 'Carbs' : 'Fats'} type="number"
                    className="border border-gray-200 rounded-lg px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowAddModal(false); setNewFood({ name: '', amount: '', meal: 'Breakfast', cal: '', p: '', c: '', f: '' }) }} className="flex-1 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddFood} className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
