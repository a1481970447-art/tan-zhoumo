import type { WeatherDay, WeatherOverride, WeekendWeather } from '../types'

const SZ = { lat: 22.5431, lon: 114.0579 }

function wmoLabel(code: number, hot: boolean) {
  if (code <= 1) return hot ? '晴热' : '晴'
  if (code <= 3) return '多云'
  if (code <= 48) return '有雾'
  if (code <= 67 || (code >= 80 && code <= 82)) return '降雨'
  if (code >= 95) return '雷雨'
  if (code >= 71) return '雨夹雪'
  return '多云'
}

export function interpretDay(d: Omit<WeatherDay, 'label' | 'raining' | 'hot'>): WeatherDay {
  const raining = d.rainProb >= 50 || (d.code >= 51 && d.code <= 82) || d.code >= 95
  const hot = d.tMax >= 32
  return { ...d, raining, hot, label: wmoLabel(d.code, hot) }
}

function nextWeekend(days: WeatherDay[]): Pick<WeekendWeather, 'saturday' | 'sunday'> {
  const sat = days.find((d) => new Date(`${d.date}T12:00:00`).getDay() === 6)
  const sun = days.find((d) => new Date(`${d.date}T12:00:00`).getDay() === 0)
  return { saturday: sat, sunday: sun }
}

function headline(w: Pick<WeekendWeather, 'saturday' | 'sunday' | 'raining' | 'hot'>) {
  if (w.raining) return '周末有雨，优先室内和夜间计划'
  if (w.hot) return '体感偏热，建议傍晚出发、少爬山'
  return '天气友好，户外市集和短途都可以排'
}

const fallbackDays: WeatherDay[] = [
  interpretDay({ date: '2026-09-19', code: 2, tMax: 31, tMin: 26, rainProb: 20 }),
  interpretDay({ date: '2026-09-20', code: 3, tMax: 30, tMin: 25, rainProb: 30 }),
]

function pack(
  days: WeatherDay[],
  source: WeekendWeather['source'],
): WeekendWeather {
  const { saturday, sunday } = nextWeekend(days)
  const use = [saturday, sunday].filter(Boolean) as WeatherDay[]
  const raining = use.some((d) => d.raining)
  const hot = use.some((d) => d.hot)
  const weather: WeekendWeather = { saturday, sunday, raining, hot, source, headline: '' }
  weather.headline = headline(weather)
  return weather
}

function overrideWeather(kind: Exclude<WeatherOverride, 'live'>): WeekendWeather {
  const baseDate = (() => {
    const t = new Date()
    const day = t.getDay()
    const add = day === 0 ? 0 : 6 - day
    t.setDate(t.getDate() + add)
    return t
  })()
  const d1 = baseDate.toISOString().slice(0, 10)
  const d2date = new Date(baseDate)
  d2date.setDate(d2date.getDate() + 1)
  const d2 = d2date.toISOString().slice(0, 10)
  if (kind === 'rain') {
    const days = [
      interpretDay({ date: d1, code: 81, tMax: 28, tMin: 24, rainProb: 80 }),
      interpretDay({ date: d2, code: 95, tMax: 27, tMin: 24, rainProb: 90 }),
    ]
    return pack(days, 'override')
  }
  const days = [
    interpretDay({ date: d1, code: 0, tMax: 33, tMin: 27, rainProb: 5 }),
    interpretDay({ date: d2, code: 1, tMax: 34, tMin: 27, rainProb: 10 }),
  ]
  return pack(days, 'override')
}

export async function fetchWeekendWeather(
  override: WeatherOverride,
): Promise<WeekendWeather> {
  if (override !== 'live') return overrideWeather(override)
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${SZ.lat}&longitude=${SZ.lon}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FShanghai&forecast_days=7`
    const res = await fetch(url)
    if (!res.ok) throw new Error('weather http')
    const data = (await res.json()) as {
      daily: {
        time: string[]
        weather_code: number[]
        temperature_2m_max: number[]
        temperature_2m_min: number[]
        precipitation_probability_max: number[]
      }
    }
    const days = data.daily.time.map((date, i) =>
      interpretDay({
        date,
        code: data.daily.weather_code[i],
        tMax: Math.round(data.daily.temperature_2m_max[i]),
        tMin: Math.round(data.daily.temperature_2m_min[i]),
        rainProb: data.daily.precipitation_probability_max[i] ?? 0,
      }),
    )
    return pack(days, 'live')
  } catch {
    return pack(
      fallbackDays.map((d, i) => {
        const t = new Date()
        const add = ((6 - t.getDay() + 7) % 7) + i
        const x = new Date(t)
        x.setDate(t.getDate() + add)
        return { ...d, date: x.toISOString().slice(0, 10) }
      }),
      'fallback',
    )
  }
}
