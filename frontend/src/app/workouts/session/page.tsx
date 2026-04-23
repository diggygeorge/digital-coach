'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Flame, CheckSquare, Trophy, Pause, Play, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/lib/store'

const exerciseVideos: Record<string, string> = {
  'Bench Press': 'rT7DgCr-3pg',
  'Incline Dumbbell Press': '8iPEnn-ltC8',
  'Cable Flyes': 'Iwe6AmxVf7o',
  'Tricep Pushdown': '2-LAMcpzODU',
  'Chest Dips': 'dX_nSOOJIsE',
  'Overhead Press': '_RlRDWO2jfg',
}

const muscleChipColors: Record<string, string> = {
  chest: 'bg-red-100 text-red-700',
  shoulders: 'bg-purple-100 text-purple-700',
  biceps: 'bg-blue-100 text-blue-700',
  triceps: 'bg-indigo-100 text-indigo-700',
  core: 'bg-yellow-100 text-yellow-700',
  back: 'bg-green-100 text-green-700',
  legs: 'bg-orange-100 text-orange-700',
  glutes: 'bg-pink-100 text-pink-700',
  calves: 'bg-teal-100 text-teal-700',
}

interface ExerciseDef {
  id: number
  name: string
  desc: string
  muscles: string[]
  formTips: string[]
  sets: { kg: number; reps: number }[]
}

const exercises: ExerciseDef[] = [
  {
    id: 1,
    name: 'Bench Press',
    desc: '4 sets x 8-12 reps',
    muscles: ['chest', 'shoulders', 'triceps'],
    formTips: [
      'Keep shoulder blades retracted and pinched together',
      'Lower the bar to mid-chest with control — no bouncing',
      'Drive feet into the floor and keep back arch natural',
    ],
    sets: [
      { kg: 60, reps: 12 },
      { kg: 65, reps: 10 },
      { kg: 70, reps: 8 },
      { kg: 70, reps: 0 },
    ],
  },
  {
    id: 2,
    name: 'Incline Dumbbell Press',
    desc: '3 sets x 10-12 reps',
    muscles: ['chest', 'shoulders'],
    formTips: [
      'Set bench to 30-45 degrees — higher angles shift load to shoulders',
      'Keep elbows at ~75 degree angle to protect shoulders',
      'Squeeze chest at the top before lowering slowly',
    ],
    sets: [
      { kg: 25, reps: 12 },
      { kg: 25, reps: 10 },
      { kg: 25, reps: 0 },
    ],
  },
  {
    id: 3,
    name: 'Cable Flyes',
    desc: '3 sets x 12-15 reps',
    muscles: ['chest'],
    formTips: [
      'Keep a slight bend in the elbows throughout the movement',
      'Bring hands together at chest height, not above',
      'Control the return — resist the cables eccentrically',
    ],
    sets: [
      { kg: 15, reps: 15 },
      { kg: 15, reps: 12 },
      { kg: 15, reps: 0 },
    ],
  },
  {
    id: 4,
    name: 'Tricep Pushdown',
    desc: '3 sets x 10-12 reps',
    muscles: ['triceps'],
    formTips: [
      'Keep elbows tucked at your sides — do not let them flare',
      'Fully extend arms at the bottom for peak contraction',
      'Use a controlled tempo: 2s down, 1s up',
    ],
    sets: [
      { kg: 20, reps: 12 },
      { kg: 22, reps: 10 },
      { kg: 22, reps: 0 },
    ],
  },
  {
    id: 5,
    name: 'Chest Dips',
    desc: '3 sets x 8-12 reps',
    muscles: ['chest', 'triceps'],
    formTips: [
      'Lean forward at ~30 degrees to shift emphasis to the chest',
      'Lower until upper arms are parallel to the floor',
      'Pause briefly at the bottom, then press back up explosively',
    ],
    sets: [
      { kg: 0, reps: 12 },
      { kg: 0, reps: 10 },
      { kg: 0, reps: 0 },
    ],
  },
  {
    id: 6,
    name: 'Overhead Press',
    desc: '3 sets x 8-10 reps',
    muscles: ['shoulders', 'triceps', 'core'],
    formTips: [
      'Brace your core hard — do not hyperextend your lower back',
      'Press straight up, then bring bar slightly back overhead',
      'Lock out fully at the top before lowering to clavicle',
    ],
    sets: [
      { kg: 40, reps: 10 },
      { kg: 45, reps: 8 },
      { kg: 45, reps: 0 },
    ],
  },
]

type SetState = { kg: number; reps: number; done: boolean }

interface StoredExercise {
  name: string
  sets: number
  reps: number
  muscles?: string[]
}

interface SelectedWorkout {
  name: string
  exerciseList?: StoredExercise[]
  muscles?: string[]
}

export default function WorkoutSession() {
  const router = useRouter()
  const { saveWorkoutSession } = useAppContext()

  const [selectedWorkout, setSelectedWorkout] = useState<SelectedWorkout | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [expandedHow, setExpandedHow] = useState<number | null>(null)
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseDef[]>(exercises)
  const [sets, setSets] = useState<SetState[][]>(
    exercises.map(e => e.sets.map(s => ({ ...s, done: false })))
  )

  useEffect(() => {
    // Small delay to ensure localStorage is ready
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('selected-workout')
      console.log('Retrieved from localStorage:', stored)
      
      if (stored) {
        try {
          const workout = JSON.parse(stored) as SelectedWorkout
          console.log('Parsed workout:', workout)
          setSelectedWorkout(workout)
          
          // Convert stored exercises to ExerciseDef format
          if (workout.exerciseList && workout.exerciseList.length > 0) {
            console.log('Converting exercises:', workout.exerciseList)
            const convertedExercises: ExerciseDef[] = workout.exerciseList.map((ex, idx) => ({
              id: idx + 1,
              name: ex.name,
              desc: `${ex.sets} sets x ${ex.reps} reps`,
              muscles: ex.muscles || [],
              formTips: ['Practice proper form for this exercise'],
              sets: Array(ex.sets).fill(0).map(() => ({ kg: 0, reps: ex.reps })),
            }))
            console.log('Converted exercises:', convertedExercises)
            setWorkoutExercises(convertedExercises)
            setSets(convertedExercises.map(e => e.sets.map(s => ({ ...s, done: false }))))
          } else {
            console.warn('No exerciseList found in workout')
          }
        } catch (err) {
          console.error('Failed to load selected workout:', err)
        }
      } else {
        console.warn('No workout found in localStorage')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const timeStr = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const totalSets = sets.flat().length
  const doneSets = sets.flat().filter(s => s.done).length
  const progress = Math.round((doneSets / totalSets) * 100)
  const calories = Math.round((seconds / 60) * 8)
  const workoutName = selectedWorkout?.name || 'Chest & Triceps'

  const updateSet = (ei: number, si: number, field: 'kg' | 'reps', val: number) => {
    setSets(prev => {
      const next = prev.map(e => [...e])
      next[ei][si] = { ...next[ei][si], [field]: Math.max(0, val) }
      return next
    })
  }

  const toggleDone = (ei: number, si: number) => {
    setSets(prev => {
      const next = prev.map(e => [...e])
      next[ei][si] = { ...next[ei][si], done: !next[ei][si].done }
      return next
    })
  }

  const toggleHow = (id: number) => {
    setExpandedHow(prev => (prev === id ? null : id))
  }

  const handleFinishWorkout = () => {
    setRunning(false)
    const completedExercises = workoutExercises.map((ex, ei) => ({
      name: ex.name,
      sets: sets[ei]
        .filter(s => s.done)
        .map(s => ({ kg: s.kg, reps: s.reps })),
    })).filter(e => e.sets.length > 0)

    saveWorkoutSession({
      workoutName,
      date: new Date().toISOString().split('T')[0],
      duration: seconds,
      exercises: completedExercises,
      caloriesBurned: calories,
    })

    router.push('/workouts')
  }

  return (
    <div>
      {/* Blue header */}
      <div className="bg-blue-600 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/workouts" className="text-white/80 hover:text-white">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-white font-bold text-lg md:text-xl">{workoutName}</h1>
                <p className="text-blue-200 text-xs md:text-sm">Active Workout Session</p>
              </div>
            </div>
            <button
              onClick={() => setRunning(r => !r)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Workout Progress</span>
              <span>{doneSets}/{totalSets} sets complete</span>
            </div>
            <div className="h-2 bg-blue-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { icon: <Clock size={15} />, label: 'Time', value: timeStr },
              { icon: <Flame size={15} />, label: 'Calories', value: calories },
              { icon: <CheckSquare size={15} />, label: 'Sets', value: `${doneSets}/${totalSets}` },
              { icon: <Trophy size={15} />, label: 'Progress', value: `${progress}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-blue-500 rounded-xl p-3 text-white">
                <div className="flex items-center gap-1 text-blue-200 text-xs mb-1">
                  {stat.icon} {stat.label}
                </div>
                <div className="font-bold text-lg md:text-xl">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {workoutExercises.map((ex, ei) => (
            <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="p-4 md:p-5 pb-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-900 text-base md:text-lg">{ex.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400">{ex.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleHow(ex.id)}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-colors"
                  >
                    {expandedHow === ex.id ? (
                      <>
                        <ChevronUp size={12} /> Hide
                      </>
                    ) : (
                      <>
                        <Play size={10} className="fill-blue-600" /> How To
                      </>
                    )}
                  </button>
                </div>

                {/* Muscle chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {ex.muscles.map(m => (
                    <span
                      key={m}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* How To panel */}
              {expandedHow === ex.id && (
                <div className="border-t border-gray-100 bg-slate-50 px-4 md:px-5 py-4">
                  {/* YouTube video */}
                  {exerciseVideos[ex.name] && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 mb-3">
                      <iframe
                        src={`https://www.youtube.com/embed/${exerciseVideos[ex.name]}?rel=0`}
                        title={`How to: ${ex.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}
                  {/* Muscle chips */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ex.muscles.map(m => (
                      <span
                        key={m}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </span>
                    ))}
                  </div>
                  {/* Form tips */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Form Tips
                  </p>
                  <ul className="space-y-2">
                    {ex.formTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sets */}
              <div className="px-4 md:px-5 pb-4 md:pb-5 pt-2">
                <div className="space-y-2.5">
                  {sets[ei].map((set, si) => {
                    const isActive =
                      !set.done && sets[ei].findIndex(s => !s.done) === si
                    return (
                      <div
                        key={si}
                        className={`rounded-xl p-3 border transition-all ${
                          set.done
                            ? 'bg-green-50 border-green-200'
                            : isActive
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                          <span className="text-xs md:text-sm text-gray-500 w-12 shrink-0">
                            Set {si + 1}
                          </span>

                          {/* KG control */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateSet(ei, si, 'kg', set.kg - 5)}
                              className="text-gray-400 hover:text-gray-700 w-5 text-center font-bold"
                            >
                              -
                            </button>
                            <div className="text-center w-12">
                              <div className="font-bold text-gray-900 text-sm md:text-base">
                                {set.kg}
                              </div>
                              <div className="text-xs text-gray-400">kg</div>
                            </div>
                            <button
                              onClick={() => updateSet(ei, si, 'kg', set.kg + 5)}
                              className="text-gray-400 hover:text-gray-700 w-5 text-center font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps control */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateSet(ei, si, 'reps', set.reps - 1)}
                              className="text-gray-400 hover:text-gray-700 w-5 text-center font-bold"
                            >
                              -
                            </button>
                            <div className="text-center w-12">
                              <div className="font-bold text-gray-900 text-sm md:text-base">
                                {set.reps}
                              </div>
                              <div className="text-xs text-gray-400">reps</div>
                            </div>
                            <button
                              onClick={() => updateSet(ei, si, 'reps', set.reps + 1)}
                              className="text-gray-400 hover:text-gray-700 w-5 text-center font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => toggleDone(ei, si)}
                            className={`ml-auto px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 transition-colors ${
                              set.done
                                ? 'text-green-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {set.done ? 'Done' : 'Complete'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Finish workout CTA */}
        {progress === 100 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <Trophy size={36} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">Workout Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Great job — you crushed {totalSets} sets in {timeStr} and burned ~{calories} kcal
            </p>
            <button
              onClick={handleFinishWorkout}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Finish Workout
            </button>
          </div>
        )}

        {/* Finish button even when not 100% but all marked */}
        {progress > 0 && progress < 100 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleFinishWorkout}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Finish Workout Early ({doneSets}/{totalSets} sets)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
