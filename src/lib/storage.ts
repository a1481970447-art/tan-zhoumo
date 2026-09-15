import type { Prefs } from '../types'

const KEY = 'tanzhoumo.v1'

export const defaultPrefs: Prefs = {
  budget: 80,
  interests: ['exhibition', 'market', 'hike'],
  people: 2,
  priority: 'fresh',
  city: '深圳',
  weatherOverride: 'live',
  onboarded: false,
  nickname: '周末游客',
}

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${KEY}:${k}`)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(k: string, v: unknown) {
  localStorage.setItem(`${KEY}:${k}`, JSON.stringify(v))
}

export function uid() {
  return Math.random().toString(36).slice(2, 8)
}

export function getMemberId() {
  let id = localStorage.getItem(`${KEY}:me`)
  if (!id) {
    id = `m_${uid()}`
    localStorage.setItem(`${KEY}:me`, id)
  }
  return id
}

export function loadPrefs(): Prefs {
  return { ...defaultPrefs, ...read<Partial<Prefs>>('prefs', {}) }
}

export function savePrefs(p: Prefs) {
  write('prefs', p)
}

export function loadCheckins() {
  return read<import('../types').Checkin[]>('checkins', [])
}

export function saveCheckins(list: import('../types').Checkin[]) {
  write('checkins', list)
}

export function loadSquads() {
  return read<import('../types').Squad[]>('squads', [])
}

export function saveSquads(list: import('../types').Squad[]) {
  write('squads', list)
}

export function loadActiveSquadCode() {
  return localStorage.getItem(`${KEY}:activeSquad`) ?? ''
}

export function saveActiveSquadCode(code: string) {
  localStorage.setItem(`${KEY}:activeSquad`, code)
}
