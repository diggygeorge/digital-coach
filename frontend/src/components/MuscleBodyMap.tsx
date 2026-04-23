'use client'

import { useState } from 'react'

interface MuscleBodyMapProps {
  selected: string[]
  onSelect: (id: string) => void
  highlightedMuscles?: string[]
  readOnly?: boolean
}
const frontMuscles = [
  { id: 'chest', label: 'Chest', x: 72, y: 28 },
  { id: 'core', label: 'Core', x: 61, y: 40 },
  { id: 'shoulders', label: 'Shoulders', x: 18, y: 24 },
  { id: 'biceps', label: 'Biceps', x: 18, y: 33 },
  { id: 'legs', label: 'Quads', x: 75, y: 60 },
  { id: 'calves', label: 'Calves', x: 69, y: 78 },
]

const backMuscles = [
  { id: 'back', label: 'Traps', x: 72, y: 24 },
  { id: 'back', label: 'Lats', x: 30, y: 27 },
  { id: 'glutes', label: 'Glutes', x: 30, y: 50 },
  { id: 'legs', label: 'Hamstrings', x: 72, y: 60 },
  { id: 'triceps', label: 'Triceps', x: 18, y: 33 },
]

export function MuscleBodyMap({ selected, onSelect, highlightedMuscles = [], readOnly = false }: MuscleBodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={() => setView('front')}
          style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid', borderColor: view === 'front' ? '#2563eb' : '#e5e7eb', background: view === 'front' ? '#2563eb' : 'white', color: view === 'front' ? 'white' : '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          Front
        </button>
        <button onClick={() => setView('back')}
          style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid', borderColor: view === 'back' ? '#2563eb' : '#e5e7eb', background: view === 'back' ? '#2563eb' : 'white', color: view === 'back' ? 'white' : '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          Back
        </button>
      </div>

      {/* Image */}
      {/* Image + dots */}
      <div style={{ position: 'relative' }}>
        <img
          src={view === 'front' ? '/front.png' : '/back.png'}
          alt="muscle model"
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
        />

        {(view === 'front' ? frontMuscles : backMuscles).map((muscle, i) => {
          const isRight = muscle.x >= 50
          const isSelected = selected.includes(muscle.id)
          const isHighlighted = highlightedMuscles.includes(muscle.id)
          const isActive = isSelected || isHighlighted

          return (
            <div
              key={i}
              onClick={() => !readOnly && onSelect(muscle.id)}
              style={{
                position: 'absolute',
                left: `${muscle.x}%`,
                top: `${muscle.y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                flexDirection: isRight ? 'row' : 'row-reverse',
                cursor: readOnly ? 'default' : 'pointer',
                gap: 0,
              }}
            >
              {/* Dot */}
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, zIndex: 2,
                background: isActive ? '#2563eb' : 'white',
                border: `2px solid ${isActive ? '#2563eb' : '#aab0c0'}`,
                boxShadow: isActive ? '0 0 0 3px #eef0fd' : 'none',
              }} />
              {/* Dashed line */}
              <div style={{
                width: '40px', flexShrink: 0,
                borderTop: `1.5px dashed ${isActive ? '#2563eb' : '#aab0c0'}`,
              }} />
              {/* Label */}
              <span style={{
                fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap',
                padding: '2px 6px', borderRadius: '4px',
                color: isActive ? '#2563eb' : '#1a1a2e',
                background: isActive ? '#eef0fd' : 'white',
                border: `1px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
              }}>
                {muscle.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}