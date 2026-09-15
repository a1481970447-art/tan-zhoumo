import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { recommend, type RankedActivity } from './lib/recommend'
import {
  getMemberId,
  loadActiveSquadCode,
  loadCheckins,
  loadPrefs,
  loadSquads,
  saveActiveSquadCode,
  saveCheckins,
  savePrefs,
  saveSquads,
  uid,
} from './lib/storage'
import { fetchWeekendWeather } from './lib/weather'
import type { Checkin, Prefs, Squad, WeekendWeather } from './types'

interface Store {
  prefs: Prefs
  setPrefs: (p: Prefs) => void
  weather: WeekendWeather | null
  ranked: RankedActivity[]
  checkins: Checkin[]
  addCheckin: (c: Omit<Checkin, 'id'>) => void
  squads: Squad[]
  activeSquad: Squad | null
  memberId: string
  createSquad: (name: string) => Squad
  joinSquad: (code: string, name: string) => string | null
  vote: (activityId: string) => void
  nickname: string
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(() => loadPrefs())
  const [weather, setWeather] = useState<WeekendWeather | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>(() => loadCheckins())
  const [squads, setSquads] = useState<Squad[]>(() => loadSquads())
  const [activeCode, setActiveCode] = useState(() => loadActiveSquadCode())
  const memberId = getMemberId()

  useEffect(() => {
    let alive = true
    fetchWeekendWeather(prefs.weatherOverride).then((w) => {
      if (alive) setWeather(w)
    })
    return () => {
      alive = false
    }
  }, [prefs.weatherOverride])

  const setPrefs = useCallback((p: Prefs) => {
    setPrefsState(p)
    savePrefs(p)
  }, [])

  const ranked = useMemo(
    () => (weather ? recommend(prefs, weather) : []),
    [prefs, weather],
  )

  const activeSquad = squads.find((s) => s.code === activeCode) ?? null

  const persistSquads = useCallback((list: Squad[], code: string) => {
    setSquads(list)
    saveSquads(list)
    setActiveCode(code)
    saveActiveSquadCode(code)
  }, [])

  const addCheckin = useCallback((c: Omit<Checkin, 'id'>) => {
    setCheckins((cur) => {
      const next = [{ ...c, id: uid() }, ...cur]
      saveCheckins(next)
      return next
    })
  }, [])

  const createSquad = useCallback(
    (name: string) => {
      const code = `SZ-${uid().slice(0, 4).toUpperCase()}`
      const squad: Squad = {
        code,
        name: name || '周末小队',
        members: [{ id: memberId, name: prefs.nickname }],
        votes: {},
        createdAt: new Date().toISOString(),
      }
      setSquads((cur) => {
        const list = [squad, ...cur.filter((s) => s.code !== code)]
        persistSquads(list, code)
        return list
      })
      return squad
    },
    [memberId, persistSquads, prefs.nickname],
  )

  const joinSquad = useCallback(
    (code: string, name: string) => {
      const normalized = code.trim().toUpperCase()
      if (!normalized) return '口令为空'
      setSquads((cur) => {
        const found = cur.find((s) => s.code === normalized)
        if (!found) {
          const squad: Squad = {
            code: normalized,
            name: name || '共享小队',
            members: [{ id: memberId, name: prefs.nickname }],
            votes: {},
            createdAt: new Date().toISOString(),
          }
          const list = [squad, ...cur]
          persistSquads(list, normalized)
          return list
        }
        const members = found.members.some((m) => m.id === memberId)
          ? found.members
          : [...found.members, { id: memberId, name: prefs.nickname }]
        const list = cur.map((s) => (s.code === found.code ? { ...s, members } : s))
        persistSquads(list, found.code)
        return list
      })
      return null
    },
    [memberId, persistSquads, prefs.nickname],
  )

  const vote = useCallback(
    (activityId: string) => {
      if (!activeCode) return
      setSquads((cur) => {
        const squad = cur.find((s) => s.code === activeCode)
        if (!squad) return cur
        const current = squad.votes[activityId] ?? []
        const nextVotes = current.includes(memberId)
          ? { ...squad.votes, [activityId]: current.filter((id) => id !== memberId) }
          : { ...squad.votes, [activityId]: [...current, memberId] }
        const list = cur.map((s) => (s.code === squad.code ? { ...s, votes: nextVotes } : s))
        persistSquads(list, squad.code)
        return list
      })
    },
    [activeCode, memberId, persistSquads],
  )

  return (
    <Ctx.Provider
      value={{
        prefs,
        setPrefs,
        weather,
        ranked,
        checkins,
        addCheckin,
        squads,
        activeSquad,
        memberId,
        createSquad,
        joinSquad,
        vote,
        nickname: prefs.nickname,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('store')
  return v
}
