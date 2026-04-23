'use client'

import { useRef, useEffect } from 'react'

// ─── Exercise type mapping ────────────────────────────────────────────────────
const nameToType: Record<string, string> = {
  'Bench Press': 'bench',
  'Incline Dumbbell Press': 'bench',
  'Cable Flyes': 'fly',
  'Tricep Pushdown': 'pushdown',
  'Squat': 'squat',
  'Leg Press': 'squat',
  'Deadlift': 'deadlift',
  'Pull-up': 'pull',
  'Lat Pulldown': 'pull',
  'Barbell Row': 'deadlift',
  'Overhead Press': 'press',
  'Dumbbell Curl': 'curl',
  'Bicep Curl': 'curl',
  'Hammer Curl': 'curl',
  'Chest Dips': 'bench',
}

// ─── Joint position types ─────────────────────────────────────────────────────
interface Pose {
  [key: string]: [number, number]
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpPose(start: Pose, end: Pose, t: number): Pose {
  const result: Pose = {}
  for (const key of Object.keys(start)) {
    result[key] = [lerp(start[key][0], end[key][0], t), lerp(start[key][1], end[key][1], t)]
  }
  return result
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// ─── Animation configs ────────────────────────────────────────────────────────
interface AnimConfig {
  viewBox: string
  duration: number
  startPose: Pose
  endPose: Pose
  renderStatic: (ctx: CanvasRenderingContext2D | null, svgEl: SVGSVGElement | null) => void
  renderPose: (svgEl: SVGSVGElement, pose: Pose) => void
  primaryColor: string
}

// We'll render everything directly into SVG elements via refs
// Each animation type returns JSX for the SVG scaffold and an updater function

interface AnimDef {
  viewBox: string
  duration: number
  startPose: Pose
  endPose: Pose
  staticElements: React.ReactNode
  updateRefs: (refs: Record<string, SVGElement | null>, pose: Pose) => void
  primaryColor: string
}

// ─── SQUAT ────────────────────────────────────────────────────────────────────
function squatAnim(): AnimDef {
  const start: Pose = {
    hip: [60, 80],
    knee: [60, 115],
    ankle: [60, 148],
    shoulder: [60, 52],
    head: [60, 36],
    elbow: [38, 62],
    hand: [28, 68],
    barL: [20, 54],
    barR: [100, 54],
  }
  const end: Pose = {
    hip: [60, 112],
    knee: [48, 132],
    ankle: [60, 148],
    shoulder: [60, 84],
    head: [58, 68],
    elbow: [36, 90],
    hand: [28, 98],
    barL: [20, 86],
    barR: [100, 86],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2500,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        {/* floor */}
        <line x1="10" y1="152" x2="110" y2="152" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        {/* barbell shaft */}
        <line id="bar" x1="20" y1="54" x2="100" y2="54" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        {/* plates */}
        <rect id="plateL" x="16" y="50" width="5" height="10" rx="2" fill="#3b82f6" />
        <rect id="plateR" x="99" y="50" width="5" height="10" rx="2" fill="#3b82f6" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }
      const setRect = (id: string, x: number, y: number) => {
        const el = refs[id] as SVGRectElement | null
        if (!el) return
        el.setAttribute('x', String(x))
        el.setAttribute('y', String(y))
      }

      setCircle('head', pose.head)
      setLine('spine', pose.head, pose.hip)
      setLine('upperArmL', pose.shoulder, pose.elbow)
      setLine('upperArmR', pose.shoulder, [pose.elbow[0] + 44, pose.elbow[1]])
      setLine('forearmL', pose.elbow, pose.hand)
      setLine('forearmR', [pose.elbow[0] + 44, pose.elbow[1]], [pose.hand[0] + 44, pose.hand[1]])
      setLine('thighL', pose.hip, pose.knee)
      setLine('thighR', pose.hip, [pose.knee[0] + 24, pose.knee[1]])
      setLine('shinL', pose.knee, pose.ankle)
      setLine('shinR', [pose.knee[0] + 24, pose.knee[1]], [pose.ankle[0] + 24, pose.ankle[1]])
      setLine('bar', pose.barL, pose.barR)
      setRect('plateL', pose.barL[0] - 4, pose.barL[1] - 5)
      setRect('plateR', pose.barR[0] - 1, pose.barR[1] - 5)
    },
  }
}

// ─── BENCH ────────────────────────────────────────────────────────────────────
function benchAnim(): AnimDef {
  const start: Pose = {
    head: [28, 80],
    shoulder: [40, 90],
    hip: [80, 95],
    knee: [98, 115],
    ankle: [100, 138],
    elbowL: [40, 110],
    handL: [40, 70],
    elbowR: [40, 110],
    handR: [40, 70],
  }
  const end: Pose = {
    head: [28, 80],
    shoulder: [40, 90],
    hip: [80, 95],
    knee: [98, 115],
    ankle: [100, 138],
    elbowL: [28, 100],
    handL: [40, 55],
    elbowR: [28, 100],
    handR: [40, 55],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2500,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        {/* bench */}
        <rect x="18" y="100" width="95" height="8" rx="4" fill="#475569" />
        <line x1="25" y1="108" x2="25" y2="140" stroke="#334155" strokeWidth="3" />
        <line x1="105" y1="108" x2="105" y2="140" stroke="#334155" strokeWidth="3" />
        <line x1="20" y1="140" x2="30" y2="140" stroke="#334155" strokeWidth="3" />
        <line x1="100" y1="140" x2="110" y2="140" stroke="#334155" strokeWidth="3" />
        {/* barbell */}
        <line id="bar" x1="10" y1="70" x2="110" y2="70" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <rect id="plateL" x="8" y="64" width="5" height="14" rx="2" fill="#3b82f6" />
        <rect id="plateR" x="107" y="64" width="5" height="14" rx="2" fill="#3b82f6" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }
      const setRect = (id: string, x: number, y: number) => {
        const el = refs[id] as SVGRectElement | null
        if (!el) return
        el.setAttribute('x', String(x))
        el.setAttribute('y', String(y))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.knee)
      setLine('shin', pose.knee, pose.ankle)
      setLine('upperArmL', pose.shoulder, pose.elbowL)
      setLine('upperArmR', [pose.shoulder[0] + 16, pose.shoulder[1]], [pose.elbowR[0] + 16, pose.elbowR[1]])
      setLine('forearmL', pose.elbowL, pose.handL)
      setLine('forearmR', [pose.elbowR[0] + 16, pose.elbowR[1]], [pose.handR[0] + 16, pose.handR[1]])
      setLine('bar', [pose.handL[0] - 20, pose.handL[1]], [pose.handR[0] + 36, pose.handR[1]])
      setRect('plateL', pose.handL[0] - 22, pose.handL[1] - 7)
      setRect('plateR', pose.handR[0] + 34, pose.handR[1] - 7)
    },
  }
}

// ─── DEADLIFT ─────────────────────────────────────────────────────────────────
function deadliftAnim(): AnimDef {
  const start: Pose = {
    head: [60, 86],
    shoulder: [60, 102],
    hip: [66, 128],
    knee: [60, 140],
    ankle: [62, 155],
    handL: [46, 144],
    handR: [74, 144],
  }
  const end: Pose = {
    head: [60, 44],
    shoulder: [60, 58],
    hip: [60, 80],
    knee: [60, 116],
    ankle: [62, 155],
    handL: [46, 108],
    handR: [74, 108],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2800,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        <line x1="10" y1="158" x2="110" y2="158" stroke="#94a3b8" strokeWidth="2" />
        <line id="bar" x1="20" y1="144" x2="100" y2="144" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="144" r="7" fill="none" stroke="#3b82f6" strokeWidth="3" />
        <circle cx="100" cy="144" r="7" fill="none" stroke="#3b82f6" strokeWidth="3" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }

      setCircle('head', pose.head)
      setLine('spine', pose.head, pose.hip)
      setLine('thighL', pose.hip, pose.knee)
      setLine('thighR', pose.hip, [pose.knee[0] + 14, pose.knee[1]])
      setLine('shinL', pose.knee, pose.ankle)
      setLine('shinR', [pose.knee[0] + 14, pose.knee[1]], [pose.ankle[0] + 14, pose.ankle[1]])
      setLine('armL', pose.shoulder, pose.handL)
      setLine('armR', pose.shoulder, pose.handR)
      setLine('bar', [pose.handL[0] - 26, pose.handL[1]], [pose.handR[0] + 26, pose.handR[1]])
    },
  }
}

// ─── PULL ─────────────────────────────────────────────────────────────────────
function pullAnim(): AnimDef {
  const start: Pose = {
    head: [60, 88],
    shoulder: [60, 106],
    hip: [60, 140],
    kneeL: [52, 158],
    kneeR: [68, 158],
    handL: [34, 48],
    handR: [86, 48],
    elbowL: [38, 76],
    elbowR: [82, 76],
  }
  const end: Pose = {
    head: [60, 56],
    shoulder: [60, 72],
    hip: [60, 106],
    kneeL: [52, 124],
    kneeR: [68, 124],
    handL: [34, 48],
    handR: [86, 48],
    elbowL: [42, 60],
    elbowR: [78, 60],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2800,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        {/* pull-up bar */}
        <line x1="10" y1="42" x2="110" y2="42" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <line x1="10" y1="30" x2="10" y2="46" stroke="#64748b" strokeWidth="2" />
        <line x1="110" y1="30" x2="110" y2="46" stroke="#64748b" strokeWidth="2" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.kneeL)
      setLine('thighR', pose.hip, pose.kneeR)
      setLine('upperArmL', pose.handL, pose.elbowL)
      setLine('upperArmR', pose.handR, pose.elbowR)
      setLine('forearmL', pose.elbowL, pose.shoulder)
      setLine('forearmR', pose.elbowR, pose.shoulder)
    },
  }
}

// ─── PRESS ────────────────────────────────────────────────────────────────────
function pressAnim(): AnimDef {
  const start: Pose = {
    head: [60, 44],
    shoulder: [60, 66],
    hip: [60, 110],
    kneeL: [50, 138],
    kneeR: [70, 138],
    ankleL: [50, 158],
    ankleR: [70, 158],
    elbowL: [36, 70],
    elbowR: [84, 70],
    handL: [30, 58],
    handR: [90, 58],
  }
  const end: Pose = {
    head: [60, 44],
    shoulder: [60, 66],
    hip: [60, 110],
    kneeL: [50, 138],
    kneeR: [70, 138],
    ankleL: [50, 158],
    ankleR: [70, 158],
    elbowL: [42, 48],
    elbowR: [78, 48],
    handL: [46, 24],
    handR: [74, 24],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2500,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        <line x1="10" y1="162" x2="110" y2="162" stroke="#94a3b8" strokeWidth="2" />
        <line id="bar" x1="10" y1="58" x2="110" y2="58" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <rect id="plateL" x="8" y="52" width="5" height="12" rx="2" fill="#3b82f6" />
        <rect id="plateR" x="107" y="52" width="5" height="12" rx="2" fill="#3b82f6" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }
      const setRect = (id: string, x: number, y: number) => {
        const el = refs[id] as SVGRectElement | null
        if (!el) return
        el.setAttribute('x', String(x))
        el.setAttribute('y', String(y))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.kneeL)
      setLine('thighR', pose.hip, pose.kneeR)
      setLine('shinL', pose.kneeL, pose.ankleL)
      setLine('shinR', pose.kneeR, pose.ankleR)
      setLine('upperArmL', pose.shoulder, pose.elbowL)
      setLine('upperArmR', pose.shoulder, pose.elbowR)
      setLine('forearmL', pose.elbowL, pose.handL)
      setLine('forearmR', pose.elbowR, pose.handR)
      setLine('bar', [pose.handL[0] - 20, pose.handL[1]], [pose.handR[0] + 20, pose.handR[1]])
      setRect('plateL', pose.handL[0] - 22, pose.handL[1] - 6)
      setRect('plateR', pose.handR[0] + 18, pose.handR[1] - 6)
    },
  }
}

// ─── CURL ─────────────────────────────────────────────────────────────────────
function curlAnim(): AnimDef {
  const start: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    elbowL: [40, 72],
    handL: [40, 108],
  }
  const end: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    elbowL: [40, 72],
    handL: [28, 56],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2000,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        <line x1="10" y1="162" x2="110" y2="162" stroke="#94a3b8" strokeWidth="2" />
        {/* dumbbell */}
        <line id="dumbbell" x1="40" y1="108" x2="40" y2="122" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <rect id="dbTop" x="34" y="104" width="12" height="6" rx="2" fill="#3b82f6" />
        <rect id="dbBot" x="34" y="122" width="12" height="6" rx="2" fill="#3b82f6" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }
      const setRect = (id: string, x: number, y: number) => {
        const el = refs[id] as SVGRectElement | null
        if (!el) return
        el.setAttribute('x', String(x))
        el.setAttribute('y', String(y))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.kneeL)
      setLine('thighR', pose.hip, pose.kneeR)
      setLine('shinL', pose.kneeL, pose.ankleL)
      setLine('shinR', pose.kneeR, pose.ankleR)
      setLine('upperArmR', pose.shoulder, [pose.shoulder[0] + 20, pose.shoulder[1] + 20])
      setLine('forearmR', [pose.shoulder[0] + 20, pose.shoulder[1] + 20], [pose.shoulder[0] + 20, pose.shoulder[1] + 50])
      setLine('upperArmL', pose.shoulder, pose.elbowL)
      setLine('forearmL', pose.elbowL, pose.handL)
      setLine('dumbbell', pose.handL, [pose.handL[0], pose.handL[1] + 14])
      setRect('dbTop', pose.handL[0] - 6, pose.handL[1] - 4)
      setRect('dbBot', pose.handL[0] - 6, pose.handL[1] + 12)
    },
  }
}

// ─── PUSHDOWN ─────────────────────────────────────────────────────────────────
function pushdownAnim(): AnimDef {
  const start: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    elbowL: [44, 70],
    handL: [44, 86],
    elbowR: [76, 70],
    handR: [76, 86],
  }
  const end: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    elbowL: [44, 70],
    handL: [44, 115],
    elbowR: [76, 70],
    handR: [76, 115],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2000,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        <line x1="10" y1="162" x2="110" y2="162" stroke="#94a3b8" strokeWidth="2" />
        {/* cable machine top */}
        <rect x="50" y="10" width="20" height="8" rx="3" fill="#334155" />
        <line x1="52" y1="18" x2="44" y2="70" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="68" y1="18" x2="76" y2="70" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
        {/* rope/bar attachment */}
        <line id="ropeHandle" x1="44" y1="86" x2="76" y2="86" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.kneeL)
      setLine('thighR', pose.hip, pose.kneeR)
      setLine('shinL', pose.kneeL, pose.ankleL)
      setLine('shinR', pose.kneeR, pose.ankleR)
      setLine('upperArmL', pose.shoulder, pose.elbowL)
      setLine('upperArmR', pose.shoulder, pose.elbowR)
      setLine('forearmL', pose.elbowL, pose.handL)
      setLine('forearmR', pose.elbowR, pose.handR)
      setLine('ropeHandle', pose.handL, pose.handR)
    },
  }
}

// ─── FLY ──────────────────────────────────────────────────────────────────────
function flyAnim(): AnimDef {
  const start: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    handL: [14, 72],
    handR: [106, 72],
    elbowL: [30, 68],
    elbowR: [90, 68],
  }
  const end: Pose = {
    head: [60, 36],
    shoulder: [60, 58],
    hip: [60, 100],
    kneeL: [52, 130],
    kneeR: [68, 130],
    ankleL: [52, 158],
    ankleR: [68, 158],
    handL: [48, 80],
    handR: [72, 80],
    elbowL: [44, 72],
    elbowR: [76, 72],
  }
  return {
    viewBox: '0 0 120 180',
    duration: 2500,
    startPose: start,
    endPose: end,
    primaryColor: '#3b82f6',
    staticElements: (
      <>
        <line x1="10" y1="162" x2="110" y2="162" stroke="#94a3b8" strokeWidth="2" />
        {/* cable anchors */}
        <circle cx="8" cy="60" r="4" fill="#475569" />
        <circle cx="112" cy="60" r="4" fill="#475569" />
      </>
    ),
    updateRefs: (refs, pose) => {
      const setLine = (id: string, a: [number, number], b: [number, number]) => {
        const el = refs[id] as SVGLineElement | null
        if (!el) return
        el.setAttribute('x1', String(a[0]))
        el.setAttribute('y1', String(a[1]))
        el.setAttribute('x2', String(b[0]))
        el.setAttribute('y2', String(b[1]))
      }
      const setCircle = (id: string, c: [number, number]) => {
        const el = refs[id] as SVGCircleElement | null
        if (!el) return
        el.setAttribute('cx', String(c[0]))
        el.setAttribute('cy', String(c[1]))
      }

      setCircle('head', pose.head)
      setLine('torso', pose.shoulder, pose.hip)
      setLine('thighL', pose.hip, pose.kneeL)
      setLine('thighR', pose.hip, pose.kneeR)
      setLine('shinL', pose.kneeL, pose.ankleL)
      setLine('shinR', pose.kneeR, pose.ankleR)
      setLine('upperArmL', pose.shoulder, pose.elbowL)
      setLine('upperArmR', pose.shoulder, pose.elbowR)
      setLine('forearmL', pose.elbowL, pose.handL)
      setLine('forearmR', pose.elbowR, pose.handR)
      // cables from anchors to hands
      setLine('cableL', [8, 60], pose.handL)
      setLine('cableR', [112, 60], pose.handR)
    },
  }
}

// ─── DEFAULT ──────────────────────────────────────────────────────────────────
function defaultAnim(): AnimDef {
  return squatAnim()
}

function getAnimDef(type: string): AnimDef {
  switch (type) {
    case 'squat': return squatAnim()
    case 'bench': return benchAnim()
    case 'deadlift': return deadliftAnim()
    case 'pull': return pullAnim()
    case 'press': return pressAnim()
    case 'curl': return curlAnim()
    case 'pushdown': return pushdownAnim()
    case 'fly': return flyAnim()
    default: return defaultAnim()
  }
}

// ─── IDs for each animation type ─────────────────────────────────────────────
const animElementIds: Record<string, string[]> = {
  squat: ['head', 'spine', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'thighL', 'thighR', 'shinL', 'shinR', 'bar', 'plateL', 'plateR'],
  bench: ['head', 'torso', 'thighL', 'shin', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'bar', 'plateL', 'plateR'],
  deadlift: ['head', 'spine', 'thighL', 'thighR', 'shinL', 'shinR', 'armL', 'armR', 'bar'],
  pull: ['head', 'torso', 'thighL', 'thighR', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR'],
  press: ['head', 'torso', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'bar', 'plateL', 'plateR'],
  curl: ['head', 'torso', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'dumbbell', 'dbTop', 'dbBot'],
  pushdown: ['head', 'torso', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'ropeHandle'],
  fly: ['head', 'torso', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'forearmL', 'forearmR', 'cableL', 'cableR'],
}

// ─── Dynamic SVG elements per type ───────────────────────────────────────────
function getDynamicElements(type: string) {
  const headProps = { r: 10, fill: '#e2e8f0', stroke: '#1e293b', strokeWidth: 2 }
  const lineProps = { stroke: '#1e293b', strokeWidth: 4, strokeLinecap: 'round' as const }
  const blueLineProps = { stroke: '#3b82f6', strokeWidth: 4, strokeLinecap: 'round' as const }

  switch (type) {
    case 'squat':
    case 'default':
      return (
        <>
          <circle id="head" cx="60" cy="36" {...headProps} />
          <line id="spine" x1="60" y1="46" x2="60" y2="80" {...lineProps} />
          <line id="upperArmL" x1="60" y1="52" x2="38" y2="62" {...blueLineProps} />
          <line id="upperArmR" x1="60" y1="52" x2="82" y2="62" {...lineProps} />
          <line id="forearmL" x1="38" y1="62" x2="28" y2="68" {...lineProps} />
          <line id="forearmR" x1="82" y1="62" x2="92" y2="68" {...lineProps} />
          <line id="thighL" x1="60" y1="80" x2="60" y2="115" {...blueLineProps} />
          <line id="thighR" x1="60" y1="80" x2="84" y2="115" {...blueLineProps} />
          <line id="shinL" x1="60" y1="115" x2="60" y2="148" {...lineProps} />
          <line id="shinR" x1="84" y1="115" x2="84" y2="148" {...lineProps} />
        </>
      )
    case 'bench':
      return (
        <>
          <circle id="head" cx="28" cy="80" {...headProps} />
          <line id="torso" x1="40" y1="90" x2="80" y2="95" {...lineProps} />
          <line id="thighL" x1="80" y1="95" x2="98" y2="115" {...lineProps} />
          <line id="shin" x1="98" y1="115" x2="100" y2="138" {...lineProps} />
          <line id="upperArmL" x1="40" y1="90" x2="40" y2="110" {...blueLineProps} />
          <line id="upperArmR" x1="56" y1="90" x2="56" y2="110" {...blueLineProps} />
          <line id="forearmL" x1="40" y1="110" x2="40" y2="70" {...blueLineProps} />
          <line id="forearmR" x1="56" y1="110" x2="56" y2="70" {...blueLineProps} />
        </>
      )
    case 'deadlift':
      return (
        <>
          <circle id="head" cx="60" cy="86" {...headProps} />
          <line id="spine" x1="60" y1="96" x2="66" y2="128" {...lineProps} />
          <line id="thighL" x1="66" y1="128" x2="60" y2="140" {...blueLineProps} />
          <line id="thighR" x1="66" y1="128" x2="74" y2="140" {...blueLineProps} />
          <line id="shinL" x1="60" y1="140" x2="62" y2="155" {...lineProps} />
          <line id="shinR" x1="74" y1="140" x2="76" y2="155" {...lineProps} />
          <line id="armL" x1="60" y1="102" x2="46" y2="144" {...blueLineProps} />
          <line id="armR" x1="60" y1="102" x2="74" y2="144" {...blueLineProps} />
        </>
      )
    case 'pull':
      return (
        <>
          <circle id="head" cx="60" cy="88" {...headProps} />
          <line id="torso" x1="60" y1="98" x2="60" y2="140" {...lineProps} />
          <line id="thighL" x1="60" y1="140" x2="52" y2="158" {...lineProps} />
          <line id="thighR" x1="60" y1="140" x2="68" y2="158" {...lineProps} />
          <line id="upperArmL" x1="34" y1="48" x2="38" y2="76" {...blueLineProps} />
          <line id="upperArmR" x1="86" y1="48" x2="82" y2="76" {...blueLineProps} />
          <line id="forearmL" x1="38" y1="76" x2="60" y2="106" {...blueLineProps} />
          <line id="forearmR" x1="82" y1="76" x2="60" y2="106" {...blueLineProps} />
        </>
      )
    case 'press':
      return (
        <>
          <circle id="head" cx="60" cy="44" {...headProps} />
          <line id="torso" x1="60" y1="54" x2="60" y2="100" {...lineProps} />
          <line id="thighL" x1="60" y1="100" x2="52" y2="130" {...lineProps} />
          <line id="thighR" x1="60" y1="100" x2="68" y2="130" {...lineProps} />
          <line id="shinL" x1="52" y1="130" x2="52" y2="158" {...lineProps} />
          <line id="shinR" x1="68" y1="130" x2="68" y2="158" {...lineProps} />
          <line id="upperArmL" x1="60" y1="62" x2="36" y2="70" {...blueLineProps} />
          <line id="upperArmR" x1="60" y1="62" x2="84" y2="70" {...blueLineProps} />
          <line id="forearmL" x1="36" y1="70" x2="30" y2="58" {...blueLineProps} />
          <line id="forearmR" x1="84" y1="70" x2="90" y2="58" {...blueLineProps} />
        </>
      )
    case 'curl':
      return (
        <>
          <circle id="head" cx="60" cy="36" {...headProps} />
          <line id="torso" x1="60" y1="46" x2="60" y2="100" {...lineProps} />
          <line id="thighL" x1="60" y1="100" x2="52" y2="130" {...lineProps} />
          <line id="thighR" x1="60" y1="100" x2="68" y2="130" {...lineProps} />
          <line id="shinL" x1="52" y1="130" x2="52" y2="158" {...lineProps} />
          <line id="shinR" x1="68" y1="130" x2="68" y2="158" {...lineProps} />
          <line id="upperArmL" x1="60" y1="62" x2="40" y2="72" {...blueLineProps} />
          <line id="upperArmR" x1="60" y1="62" x2="80" y2="78" {...lineProps} />
          <line id="forearmL" x1="40" y1="72" x2="40" y2="108" {...blueLineProps} />
          <line id="forearmR" x1="80" y1="78" x2="80" y2="128" {...lineProps} />
        </>
      )
    case 'pushdown':
      return (
        <>
          <circle id="head" cx="60" cy="36" {...headProps} />
          <line id="torso" x1="60" y1="46" x2="60" y2="100" {...lineProps} />
          <line id="thighL" x1="60" y1="100" x2="52" y2="130" {...lineProps} />
          <line id="thighR" x1="60" y1="100" x2="68" y2="130" {...lineProps} />
          <line id="shinL" x1="52" y1="130" x2="52" y2="158" {...lineProps} />
          <line id="shinR" x1="68" y1="130" x2="68" y2="158" {...lineProps} />
          <line id="upperArmL" x1="60" y1="60" x2="44" y2="70" {...blueLineProps} />
          <line id="upperArmR" x1="60" y1="60" x2="76" y2="70" {...blueLineProps} />
          <line id="forearmL" x1="44" y1="70" x2="44" y2="86" {...blueLineProps} />
          <line id="forearmR" x1="76" y1="70" x2="76" y2="86" {...blueLineProps} />
        </>
      )
    case 'fly':
      return (
        <>
          <circle id="head" cx="60" cy="36" {...headProps} />
          <line id="torso" x1="60" y1="46" x2="60" y2="100" {...lineProps} />
          <line id="thighL" x1="60" y1="100" x2="52" y2="130" {...lineProps} />
          <line id="thighR" x1="60" y1="100" x2="68" y2="130" {...lineProps} />
          <line id="shinL" x1="52" y1="130" x2="52" y2="158" {...lineProps} />
          <line id="shinR" x1="68" y1="130" x2="68" y2="158" {...lineProps} />
          <line id="upperArmL" x1="60" y1="62" x2="30" y2="68" {...blueLineProps} />
          <line id="upperArmR" x1="60" y1="62" x2="90" y2="68" {...blueLineProps} />
          <line id="forearmL" x1="30" y1="68" x2="14" y2="72" {...blueLineProps} />
          <line id="forearmR" x1="90" y1="68" x2="106" y2="72" {...blueLineProps} />
          <line id="cableL" x1="8" y1="60" x2="14" y2="72" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
          <line id="cableR" x1="112" y1="60" x2="106" y2="72" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
        </>
      )
    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ExerciseAnimation({ name, className }: { name: string; className?: string }) {
  const type = nameToType[name] ?? 'default'
  const animDef = getAnimDef(type)
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const ids = animElementIds[type] ?? animElementIds['squat']
    const refs: Record<string, SVGElement | null> = {}
    for (const id of ids) {
      refs[id] = svg.getElementById(id) as SVGElement | null
    }

    let going = true
    startTimeRef.current = performance.now()

    function frame(now: number) {
      if (!going) return
      const elapsed = now - startTimeRef.current
      const cycle = animDef.duration * 2
      const t = (elapsed % cycle) / animDef.duration
      // ping-pong: 0→1→0
      const tNorm = t <= 1 ? t : 2 - t
      const eased = easeInOut(Math.min(1, Math.max(0, tNorm)))
      const pose = lerpPose(animDef.startPose, animDef.endPose, eased)
      animDef.updateRefs(refs, pose)
      frameRef.current = requestAnimationFrame(frame)
    }

    frameRef.current = requestAnimationFrame(frame)

    return () => {
      going = false
      cancelAnimationFrame(frameRef.current)
    }
  }, [type, animDef])

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ''}`}>
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 w-full flex justify-center">
        <svg
          ref={svgRef}
          viewBox={animDef.viewBox}
          className="w-28 h-40"
          style={{ overflow: 'visible' }}
        >
          {animDef.staticElements}
          {getDynamicElements(type)}
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Focus on controlled movement</p>
      </div>
    </div>
  )
}
