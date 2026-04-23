const API_BASE = 'http://localhost:8080/api'

export async function submitWorkoutConfig(equipment: string[]) {
  try {
    const res = await fetch(`${API_BASE}/workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipment }),
    })
    if (!res.ok) throw new Error('Failed to submit workout config')
    return res.json()
  } catch (err) {
    console.error('submitWorkoutConfig error:', err)
    return null
  }
}

export async function detectEquipment(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Equipment detection failed')
  return res.json()
}

export async function apiRegister(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    return res.json()
  } catch {
    return null // backend not running, fall back to localStorage
  }
}

export async function apiLogin(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  } catch {
    return null // backend not running, fall back to localStorage
  }
}

export async function apiUpdateProfile(email: string, data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...data }),
    })
    return res.json()
  } catch {
    return null
  }
}