'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  email: string
  height: number // cm
  currentWeight: number // kg
  targetWeight: number // kg
  bodyFat: number // percentage
  joinDate: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface MealEntry {
  id: string
  name: string
  amount: string
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  time: string
  cal: number
  protein: number
  carbs: number
  fats: number
  date: string // YYYY-MM-DD
}

export interface WaterLog {
  date: string
  ml: number // total ml for the day
}

export interface CompletedSet {
  kg: number
  reps: number
}

export interface CompletedExercise {
  name: string
  sets: CompletedSet[]
}

export interface WorkoutSession {
  id: string
  workoutName: string
  date: string
  duration: number // seconds
  exercises: CompletedExercise[]
  caloriesBurned: number
}

export interface FitnessGoal {
  id: string
  label: string
  current: number
  target: number
  unit: string
  type: 'weekly' | 'weight' | 'strength'
}

export interface AppState {
  profile: UserProfile
  meals: MealEntry[]
  waterLogs: WaterLog[]
  workoutHistory: WorkoutSession[]
  goals: FitnessGoal[]
  selectedGoalType: 'cutting' | 'bulking' | 'maintain'
  notifications: boolean
  darkMode: boolean
}

interface AppContextType {
  state: AppState
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void
  // Meals
  addMeal: (meal: Omit<MealEntry, 'id' | 'date'>) => void
  removeMeal: (id: string) => void
  getTodayMeals: () => MealEntry[]
  getTodayMacros: () => { cal: number; protein: number; carbs: number; fats: number }
  // Water
  addWater: (ml: number) => void
  removeWater: (ml: number) => void
  getTodayWater: () => number
  // Workouts
  saveWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => void
  getWorkoutHistory: () => WorkoutSession[]
  getWeekWorkoutCount: () => number
  getTotalWorkouts: () => number
  getTotalTime: () => number
  getTotalCaloriesBurned: () => number
  getStreak: () => number
  // Goals
  addGoal: (goal: Omit<FitnessGoal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<FitnessGoal>) => void
  removeGoal: (id: string) => void
  // Settings
  setGoalType: (type: 'cutting' | 'bulking' | 'maintain') => void
  toggleNotifications: () => void
  toggleDarkMode: () => void
  // Utility
  resetData: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'digital-coach-data'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function buildDefaults(): AppState {
  const defaultProfile: UserProfile = {
    name: '',
    email: '',
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    bodyFat: 0,
    joinDate: new Date().toISOString().split('T')[0],
    level: 'Beginner',
  }

  const defaultGoals: FitnessGoal[] = [
    { id: '1', label: 'Workout 5x per week', current: 3, target: 5, unit: 'days', type: 'weekly' },
    { id: '2', label: 'Hit daily calorie goal', current: 5, target: 7, unit: 'days', type: 'weekly' },
    { id: '3', label: 'Bench Press 80kg', current: 70, target: 80, unit: 'kg', type: 'strength' },
  ]

  const defaultMeals: MealEntry[] = []

  const defaultWaterLogs: WaterLog[] = []

  const defaultHistory: WorkoutSession[] = []

  return {
    profile: defaultProfile,
    meals: defaultMeals,
    waterLogs: defaultWaterLogs,
    workoutHistory: defaultHistory,
    goals: defaultGoals,
    selectedGoalType: 'cutting',
    notifications: true,
    darkMode: false,
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return buildDefaults()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    // corrupted data – fall through to defaults
  }
  return buildDefaults()
}

// ── Context ────────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Start with defaults for SSR, hydrate from localStorage in useEffect
  const [state, setState] = useState<AppState>(buildDefaults)
  const hydrated = useRef(false)

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const stored = loadState()
    setState(stored)
    hydrated.current = true
  }, [])

  // Persist to localStorage whenever state changes (skip the initial SSR default)
  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full or unavailable – silently ignore
    }
  }, [state])

  // ── Profile ────────────────────────────────────────────────────────────────

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }))
  }, [])

  // ── Meals ──────────────────────────────────────────────────────────────────

  const addMeal = useCallback((meal: Omit<MealEntry, 'id' | 'date'>) => {
    const entry: MealEntry = { ...meal, id: generateId(), date: todayStr() }
    setState((prev) => ({ ...prev, meals: [...prev.meals, entry] }))
  }, [])

  const removeMeal = useCallback((id: string) => {
    setState((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }))
  }, [])

  const getTodayMeals = useCallback((): MealEntry[] => {
    const today = todayStr()
    return state.meals.filter((m) => m.date === today)
  }, [state.meals])

  const getTodayMacros = useCallback(() => {
    const meals = getTodayMeals()
    return meals.reduce(
      (acc, m) => ({
        cal: acc.cal + m.cal,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { cal: 0, protein: 0, carbs: 0, fats: 0 },
    )
  }, [getTodayMeals])

  // ── Water ──────────────────────────────────────────────────────────────────

  const addWater = useCallback((ml: number) => {
    setState((prev) => {
      const today = todayStr()
      const existing = prev.waterLogs.find((w) => w.date === today)
      if (existing) {
        return {
          ...prev,
          waterLogs: prev.waterLogs.map((w) =>
            w.date === today ? { ...w, ml: w.ml + ml } : w,
          ),
        }
      }
      return { ...prev, waterLogs: [...prev.waterLogs, { date: today, ml }] }
    })
  }, [])

  const removeWater = useCallback((ml: number) => {
    setState((prev) => {
      const today = todayStr()
      return {
        ...prev,
        waterLogs: prev.waterLogs.map((w) =>
          w.date === today ? { ...w, ml: Math.max(0, w.ml - ml) } : w,
        ),
      }
    })
  }, [])

  const getTodayWater = useCallback((): number => {
    const today = todayStr()
    const entry = state.waterLogs.find((w) => w.date === today)
    return entry ? entry.ml : 0
  }, [state.waterLogs])

  // ── Workouts ───────────────────────────────────────────────────────────────

  const saveWorkoutSession = useCallback((session: Omit<WorkoutSession, 'id'>) => {
    const full: WorkoutSession = { ...session, id: generateId() }
    setState((prev) => ({ ...prev, workoutHistory: [...prev.workoutHistory, full] }))
  }, [])

  const getWorkoutHistory = useCallback((): WorkoutSession[] => {
    return [...state.workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [state.workoutHistory])

  const getWeekWorkoutCount = useCallback((): number => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return state.workoutHistory.filter((w) => new Date(w.date) >= weekAgo).length
  }, [state.workoutHistory])

  const getTotalWorkouts = useCallback((): number => {
    return state.workoutHistory.length
  }, [state.workoutHistory])

  const getTotalTime = useCallback((): number => {
    return state.workoutHistory.reduce((sum, w) => sum + w.duration, 0)
  }, [state.workoutHistory])

  const getTotalCaloriesBurned = useCallback((): number => {
    return state.workoutHistory.reduce((sum, w) => sum + w.caloriesBurned, 0)
  }, [state.workoutHistory])

  const getStreak = useCallback((): number => {
    if (state.workoutHistory.length === 0) return 0
    const dates = [...new Set(state.workoutHistory.map((w) => w.date))].sort().reverse()
    let streak = 0
    const cursor = new Date()
    // Allow today or yesterday as the starting point
    const todayDate = todayStr()
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dates[0] !== todayDate && dates[0] !== yesterdayDate) return 0
    // If most recent is yesterday, start cursor from yesterday
    if (dates[0] === yesterdayDate) {
      cursor.setDate(cursor.getDate() - 1)
    }
    for (const d of dates) {
      const expected = cursor.toISOString().split('T')[0]
      if (d === expected) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else if (d < expected) {
        break
      }
    }
    return streak
  }, [state.workoutHistory])

  // ── Goals ──────────────────────────────────────────────────────────────────

  const addGoal = useCallback((goal: Omit<FitnessGoal, 'id'>) => {
    const full: FitnessGoal = { ...goal, id: generateId() }
    setState((prev) => ({ ...prev, goals: [...prev.goals, full] }))
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<FitnessGoal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
  }, [])

  const removeGoal = useCallback((id: string) => {
    setState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }))
  }, [])

  // ── Settings ───────────────────────────────────────────────────────────────

  const setGoalType = useCallback((type: 'cutting' | 'bulking' | 'maintain') => {
    setState((prev) => ({ ...prev, selectedGoalType: type }))
  }, [])

  const toggleNotifications = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: !prev.notifications }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }))
  }, [])

  // ── Utility ────────────────────────────────────────────────────────────────

  const resetData = useCallback(() => {
    const defaults = buildDefaults()
    setState(defaults)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // ── Provide ────────────────────────────────────────────────────────────────

  const value: AppContextType = {
    state,
    updateProfile,
    addMeal,
    removeMeal,
    getTodayMeals,
    getTodayMacros,
    addWater,
    removeWater,
    getTodayWater,
    saveWorkoutSession,
    getWorkoutHistory,
    getWeekWorkoutCount,
    getTotalWorkouts,
    getTotalTime,
    getTotalCaloriesBurned,
    getStreak,
    addGoal,
    updateGoal,
    removeGoal,
    setGoalType,
    toggleNotifications,
    toggleDarkMode,
    resetData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return ctx
}
