'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useAppContext } from '@/lib/store'
import {
  User,
  Ruler,
  Target,
  Dumbbell,
  Layers,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Flame,
  Activity,
  Sparkles,
} from 'lucide-react'

const TOTAL_STEPS = 7

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, completeOnboarding } = useAuth()
  const { updateProfile, setGoalType } = useAppContext()

  const [step, setStep] = useState(1)

  // Step 2
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('')

  // Step 3
  const [height, setHeight] = useState<number>(170)
  const [currentWeight, setCurrentWeight] = useState<number | ''>('')
  const [targetWeight, setTargetWeight] = useState<number | ''>('')
  const [bodyFat, setBodyFat] = useState<number | ''>('')

  // Step 4
  const [goalTypeLocal, setGoalTypeLocal] = useState<'cutting' | 'bulking' | 'maintain' | ''>('')

  // Step 5
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('')
  const [trainingDays, setTrainingDays] = useState<number>(4)

  // Step 6
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])

  function canProceed(): boolean {
    switch (step) {
      case 1: return true
      case 2: return fullName.trim().length > 0 && age !== '' && Number(age) > 0 && gender !== ''
      case 3: return height > 0 && currentWeight !== '' && Number(currentWeight) > 0 && targetWeight !== '' && Number(targetWeight) > 0
      case 4: return goalTypeLocal !== ''
      case 5: return fitnessLevel !== '' && trainingDays >= 1
      case 6: return true
      case 7: return true
      default: return false
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  function toggleMuscle(muscle: string) {
    setSelectedMuscles(prev => prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle])
  }

  function selectAll() {
    setSelectedMuscles(prev => prev.length === MUSCLE_GROUPS.length ? [] : [...MUSCLE_GROUPS])
  }

  function handleComplete() {
    updateProfile({
      name: fullName.trim(),
      email: user?.email ?? '',
      height: Number(height) || 0,
      currentWeight: Number(currentWeight) || 0,
      targetWeight: Number(targetWeight) || 0,
      bodyFat: Number(bodyFat) || 0,
      level: fitnessLevel || 'Beginner',
    })
    if (goalTypeLocal) setGoalType(goalTypeLocal)
    completeOnboarding()
    router.replace('/')
  }

  const firstName = user?.name?.split(' ')[0] || fullName.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        {step > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Step {step - 1} of {TOTAL_STEPS - 1}</span>
              <span className="text-xs font-medium text-gray-400">{Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-5">
                  <Sparkles size={36} className="text-blue-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Welcome, {firstName}! 🎉
                </h1>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Let&apos;s set up your profile so we can create your perfect fitness plan. This takes about 2 minutes.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '📋', text: 'Your personal details' },
                  { icon: '📏', text: 'Body measurements & goals' },
                  { icon: '🏋️', text: 'Fitness experience & schedule' },
                  { icon: '🎯', text: 'Personalized recommendations' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={User} title="About You" subtitle="Tell us a bit about yourself" />
              <div className="space-y-5 min-h-[280px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">How old are you?</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value ? Number(e.target.value) : '')} placeholder="25" min={10} max={120}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <button key={g} onClick={() => setGender(g)}
                        className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${gender === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'} {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <NavButtons step={step} total={TOTAL_STEPS} canProceed={canProceed()} onBack={handleBack} onNext={handleNext} />
            </div>
          )}

          {/* Step 3: Body Metrics */}
          {step === 3 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={Ruler} title="Body Metrics" subtitle="Help us calculate your ideal plan" />
              <div className="space-y-5 min-h-[280px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Height</label>
                  <input type="range" min={120} max={230} value={height} onChange={e => setHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">120 cm</span>
                    <span className="text-lg font-bold text-blue-600">{height} cm</span>
                    <span className="text-xs text-gray-400">230 cm</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Weight (kg)</label>
                    <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value ? Number(e.target.value) : '')} placeholder="78" min={20} max={300}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Weight (kg)</label>
                    <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value ? Number(e.target.value) : '')} placeholder="75" min={20} max={300}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Fat % <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value ? Number(e.target.value) : '')} placeholder="18" min={3} max={60}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <NavButtons step={step} total={TOTAL_STEPS} canProceed={canProceed()} onBack={handleBack} onNext={handleNext} />
            </div>
          )}

          {/* Step 4: Goal */}
          {step === 4 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={Target} title="What's Your Goal?" subtitle="This determines your calorie and macro targets" />
              <div className="space-y-3 min-h-[280px]">
                {([
                  { key: 'cutting' as const, emoji: '🔥', title: 'Cutting', desc: 'Lose fat while preserving muscle', badge: '-500 cal/day', border: 'border-orange-400', bg: 'bg-orange-50', iconBg: 'bg-orange-100' },
                  { key: 'bulking' as const, emoji: '💪', title: 'Bulking', desc: 'Build muscle with calorie surplus', badge: '+500 cal/day', border: 'border-blue-400', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
                  { key: 'maintain' as const, emoji: '⚖️', title: 'Maintain', desc: 'Stay lean at current weight', badge: '0 cal/day', border: 'border-green-400', bg: 'bg-green-50', iconBg: 'bg-green-100' },
                ]).map(goal => (
                  <button key={goal.key} onClick={() => setGoalTypeLocal(goal.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${goalTypeLocal === goal.key ? `${goal.border} ${goal.bg}` : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${goalTypeLocal === goal.key ? goal.iconBg : 'bg-gray-50'}`}>
                      {goal.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{goal.title}</div>
                      <div className="text-xs text-gray-500">{goal.desc}</div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${goalTypeLocal === goal.key ? 'bg-white text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                      {goal.badge}
                    </span>
                  </button>
                ))}
              </div>
              <NavButtons step={step} total={TOTAL_STEPS} canProceed={canProceed()} onBack={handleBack} onNext={handleNext} />
            </div>
          )}

          {/* Step 5: Experience */}
          {step === 5 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={Dumbbell} title="Your Experience" subtitle="Help us match workouts to your level" />
              <div className="space-y-6 min-h-[280px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Fitness Level</label>
                  <div className="space-y-2">
                    {([
                      { key: 'Beginner' as const, emoji: '🌱', desc: 'New to fitness or returning after a long break' },
                      { key: 'Intermediate' as const, emoji: '💪', desc: 'Consistent training for 6+ months' },
                      { key: 'Advanced' as const, emoji: '🏆', desc: '2+ years of serious training' },
                    ]).map(level => (
                      <button key={level.key} onClick={() => setFitnessLevel(level.key)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${fitnessLevel === level.key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-xl">{level.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{level.key}</div>
                          <div className="text-xs text-gray-500">{level.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How many days per week can you train?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button key={d} onClick={() => setTrainingDays(d)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${trainingDays === d ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {trainingDays <= 2 ? 'Light schedule — great for beginners' : trainingDays <= 4 ? 'Solid routine — most popular choice' : trainingDays <= 5 ? 'Active lifestyle — great for results' : 'Intense schedule — for dedicated athletes'}
                  </p>
                </div>
              </div>
              <NavButtons step={step} total={TOTAL_STEPS} canProceed={canProceed()} onBack={handleBack} onNext={handleNext} />
            </div>
          )}

          {/* Step 6: Target Areas */}
          {step === 6 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={Layers} title="Focus Areas" subtitle="Optional — select muscles you want to prioritize" />
              <div className="space-y-4 min-h-[280px]">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{selectedMuscles.length} selected</p>
                  <button onClick={selectAll} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    {selectedMuscles.length === MUSCLE_GROUPS.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {MUSCLE_GROUPS.map(muscle => (
                    <button key={muscle} onClick={() => toggleMuscle(muscle)}
                      className={`px-4 py-3.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedMuscles.includes(muscle) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {selectedMuscles.includes(muscle) ? '✓ ' : ''}{muscle}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center">You can always change this later in Settings</p>
              </div>
              <NavButtons step={step} total={TOTAL_STEPS} canProceed={canProceed()} onBack={handleBack} onNext={handleNext} />
            </div>
          )}

          {/* Step 7: Summary */}
          {step === 7 && (
            <div className="p-6 md:p-8">
              <StepHeader icon={CheckCircle} title="You're All Set!" subtitle="Here's a summary of your profile" />
              <div className="min-h-[280px]">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                  {[
                    ['Name', fullName],
                    ['Age', `${age} years`],
                    ['Gender', String(gender)],
                    ['Height', `${height} cm`],
                    ['Weight', `${currentWeight} kg → ${targetWeight} kg`],
                    ...(bodyFat !== '' && Number(bodyFat) > 0 ? [['Body Fat', `${bodyFat}%`]] : []),
                    ['Goal', goalTypeLocal ? `${goalTypeLocal === 'cutting' ? '🔥' : goalTypeLocal === 'bulking' ? '💪' : '⚖️'} ${goalTypeLocal.charAt(0).toUpperCase() + goalTypeLocal.slice(1)}` : ''],
                    ['Level', String(fitnessLevel)],
                    ['Schedule', `${trainingDays} days/week`],
                    ...(selectedMuscles.length > 0 ? [['Focus', selectedMuscles.join(', ')]] : []),
                  ].map(([label, value], i) => (
                    <div key={i}>
                      {i > 0 && <div className="border-t border-gray-200 mb-2.5" />}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-700">Your personalized plan is ready! We&apos;ll customize your nutrition targets, workout recommendations, and progress tracking based on these preferences.</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button onClick={handleBack} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleComplete}
                  className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                  Let&apos;s Go! 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ size?: number }>; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

function NavButtons({ step, total, canProceed, onBack, onNext }: { step: number; total: number; canProceed: boolean; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50">
        <ChevronLeft size={16} /> Back
      </button>
      {step === total - 1 ? (
        <button onClick={onNext} className="text-sm font-medium text-gray-400 hover:text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 mr-2">
          Skip
        </button>
      ) : null}
      <button onClick={onNext} disabled={!canProceed}
        className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Continue <ChevronRight size={16} />
      </button>
    </div>
  )
}
