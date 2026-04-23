'use client'

import { useState } from 'react'
import { ArrowLeft, Dumbbell, Clock, Flame, Check, Plus, Minus, Save, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes'] as const
type MuscleGroup = (typeof muscleGroups)[number]

interface ExerciseEntry {
  name: string
  muscles: string[]
}

const exerciseDB: ExerciseEntry[] = [
  { name: 'Bench Press', muscles: ['chest', 'triceps', 'shoulders'] },
  { name: 'Incline Dumbbell Press', muscles: ['chest', 'shoulders'] },
  { name: 'Cable Flyes', muscles: ['chest'] },
  { name: 'Push-ups', muscles: ['chest', 'triceps'] },
  { name: 'Chest Dips', muscles: ['chest', 'triceps'] },
  { name: 'Barbell Row', muscles: ['back', 'biceps'] },
  { name: 'Lat Pulldown', muscles: ['back', 'biceps'] },
  { name: 'Pull-ups', muscles: ['back', 'biceps'] },
  { name: 'Seated Row', muscles: ['back'] },
  { name: 'Deadlift', muscles: ['back', 'legs', 'glutes'] },
  { name: 'Overhead Press', muscles: ['shoulders', 'triceps'] },
  { name: 'Lateral Raises', muscles: ['shoulders'] },
  { name: 'Front Raises', muscles: ['shoulders'] },
  { name: 'Face Pulls', muscles: ['shoulders', 'back'] },
  { name: 'Bicep Curl', muscles: ['biceps'] },
  { name: 'Hammer Curl', muscles: ['biceps'] },
  { name: 'Preacher Curl', muscles: ['biceps'] },
  { name: 'Tricep Pushdown', muscles: ['triceps'] },
  { name: 'Skull Crushers', muscles: ['triceps'] },
  { name: 'Tricep Dips', muscles: ['triceps', 'chest'] },
  { name: 'Squats', muscles: ['legs', 'glutes'] },
  { name: 'Leg Press', muscles: ['legs'] },
  { name: 'Romanian Deadlift', muscles: ['legs', 'glutes'] },
  { name: 'Lunges', muscles: ['legs', 'glutes'] },
  { name: 'Leg Curl', muscles: ['legs'] },
  { name: 'Calf Raises', muscles: ['legs'] },
  { name: 'Planks', muscles: ['core'] },
  { name: 'Crunches', muscles: ['core'] },
  { name: 'Russian Twists', muscles: ['core'] },
  { name: 'Hanging Leg Raise', muscles: ['core'] },
  { name: 'Hip Thrusts', muscles: ['glutes'] },
  { name: 'Glute Bridges', muscles: ['glutes'] },
]

const muscleChipColors: Record<string, string> = {
  chest: 'bg-red-100 text-red-700 border-red-200',
  back: 'bg-green-100 text-green-700 border-green-200',
  shoulders: 'bg-purple-100 text-purple-700 border-purple-200',
  biceps: 'bg-blue-100 text-blue-700 border-blue-200',
  triceps: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  legs: 'bg-orange-100 text-orange-700 border-orange-200',
  core: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  glutes: 'bg-pink-100 text-pink-700 border-pink-200',
}

interface SelectedExercise {
  name: string
  sets: number
  reps: number
}

export default function CustomWorkout() {
  const router = useRouter()
  const [workoutName, setWorkoutName] = useState('')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [saved, setSaved] = useState(false)

  const toggleMuscle = (muscle: string) => {
    const lower = muscle.toLowerCase()
    setSelectedMuscles(prev =>
      prev.includes(lower) ? prev.filter(m => m !== lower) : [...prev, lower]
    )
  }

  const filteredExercises = selectedMuscles.length === 0
    ? exerciseDB
    : exerciseDB.filter(ex => ex.muscles.some(m => selectedMuscles.includes(m)))

  const isExerciseSelected = (name: string) =>
    selectedExercises.some(e => e.name === name)

  const toggleExercise = (name: string) => {
    if (isExerciseSelected(name)) {
      setSelectedExercises(prev => prev.filter(e => e.name !== name))
    } else {
      setSelectedExercises(prev => [...prev, { name, sets: 3, reps: 10 }])
    }
  }

  const updateExercise = (name: string, field: 'sets' | 'reps', delta: number) => {
    setSelectedExercises(prev =>
      prev.map(e =>
        e.name === name
          ? { ...e, [field]: Math.max(1, e[field] + delta) }
          : e
      )
    )
  }

  const estimatedDuration = selectedExercises.length * 4
  const estimatedCalories = selectedExercises.length * 60

  const handleSave = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) return

    const workout = {
      id: Date.now(),
      name: workoutName,
      muscles: selectedMuscles,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('digital-coach-custom-workouts') || '[]')
    existing.push(workout)
    localStorage.setItem('digital-coach-custom-workouts', JSON.stringify(existing))

    setSaved(true)
    setTimeout(() => {
      router.push('/workouts')
    }, 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/workouts" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Custom Workout</h1>
          <p className="text-gray-400 text-sm mt-0.5">Build your perfect training session</p>
        </div>
      </div>

      {/* Success message */}
      {saved && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Workout saved successfully!</p>
            <p className="text-xs text-green-600">Redirecting to workouts...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Preview card - sticky on mobile at top, sidebar on desktop */}
        <div className="lg:order-2 lg:w-1/3">
          <div className="sticky top-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
              <Dumbbell size={16} className="text-blue-500" /> Workout Preview
            </h3>

            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Workout Name</p>
                <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                  {workoutName || 'Untitled Workout'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Dumbbell size={14} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Exercises</p>
                  <p className="font-bold text-gray-900 text-sm">{selectedExercises.length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock size={14} className="text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="font-bold text-gray-900 text-sm">{estimatedDuration}m</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Flame size={14} className="text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Calories</p>
                  <p className="font-bold text-gray-900 text-sm">{estimatedCalories}</p>
                </div>
              </div>

              {selectedMuscles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Target Muscles</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMuscles.map(m => (
                      <span
                        key={m}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedExercises.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Exercises</p>
                  <ul className="space-y-1">
                    {selectedExercises.map(ex => (
                      <li key={ex.name} className="text-xs text-gray-600 flex justify-between">
                        <span className="truncate pr-2">{ex.name}</span>
                        <span className="text-gray-400 shrink-0">{ex.sets}x{ex.reps}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSave}
                  disabled={!workoutName.trim() || selectedExercises.length === 0 || saved}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={14} /> Save Workout
                </button>
                <Link
                  href="/workouts/session"
                  className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Play size={14} /> Start Workout
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Builder steps */}
        <div className="lg:order-1 lg:w-2/3 space-y-5">
          {/* Step 1: Name */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Name Your Workout</h2>
            </div>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="e.g. Monday Push Day"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Step 2: Muscle Groups */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Select Muscle Groups</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">Choose the muscles you want to target</p>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(muscle => {
                const lower = muscle.toLowerCase()
                const active = selectedMuscles.includes(lower)
                const colors = muscleChipColors[lower] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                return (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(muscle)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      active
                        ? colors
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {active && <Check size={12} className="inline mr-1" />}
                    {muscle}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Choose Exercises */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Choose Exercises</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {selectedMuscles.length > 0
                ? `Showing exercises for: ${selectedMuscles.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}`
                : 'Select muscle groups above to filter, or browse all exercises'}
            </p>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {filteredExercises.map(ex => {
                const selected = isExerciseSelected(ex.name)
                return (
                  <button
                    key={ex.name}
                    onClick={() => toggleExercise(ex.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      selected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {selected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-700 truncate">{ex.name}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      {ex.muscles.map(m => (
                        <span
                          key={m}
                          className={`text-xs px-1.5 py-0.5 rounded-full ${muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
              {filteredExercises.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No exercises match the selected muscle groups</p>
              )}
            </div>
          </div>

          {/* Step 4: Sets & Reps */}
          {selectedExercises.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="font-bold text-gray-900 text-sm md:text-base">Set Reps &amp; Sets</h2>
              </div>
              <p className="text-xs text-gray-400 mb-3">Customize sets and reps for each exercise</p>
              <div className="space-y-3">
                {selectedExercises.map(ex => (
                  <div key={ex.name} className="bg-gray-50 rounded-xl p-3 md:p-4">
                    <p className="font-medium text-gray-900 text-sm mb-2">{ex.name}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Sets */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">Sets</span>
                        <button
                          onClick={() => updateExercise(ex.name, 'sets', -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 text-sm">{ex.sets}</span>
                        <button
                          onClick={() => updateExercise(ex.name, 'sets', 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Reps */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">Reps</span>
                        <button
                          onClick={() => updateExercise(ex.name, 'reps', -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 text-sm">{ex.reps}</span>
                        <button
                          onClick={() => updateExercise(ex.name, 'reps', 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom save button (mobile convenience) */}
          <div className="lg:hidden space-y-2">
            <button
              onClick={handleSave}
              disabled={!workoutName.trim() || selectedExercises.length === 0 || saved}
              className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} /> Save Workout
            </button>
            <Link
              href="/workouts/session"
              className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Play size={14} /> Start Workout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
