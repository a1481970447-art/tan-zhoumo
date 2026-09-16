export type ActivityType = 'exhibition' | 'market' | 'show' | 'hike' | 'food'
export type Priority = 'save' | 'fresh' | 'photo'
export type WeatherOverride = 'live' | 'sunny' | 'rain'

export interface Activity {
  id: string
  title: string
  subtitle: string
  type: ActivityType
  district: string
  cost: number
  durationHours: number
  indoor: boolean
  heatFriendly: boolean
  eveningBetter: boolean
  minPeople: number
  maxPeople: number
  meetupStation: string
  tags: string[]
  summary: string
  tips: string
  highlights: string[]
  hours: string
}

export interface Prefs {
  budget: number
  interests: ActivityType[]
  people: number
  priority: Priority
  city: string
  weatherOverride: WeatherOverride
  onboarded: boolean
  nickname: string
}

export interface WeatherDay {
  date: string
  code: number
  tMax: number
  tMin: number
  rainProb: number
  label: string
  raining: boolean
  hot: boolean
}

export interface WeekendWeather {
  saturday?: WeatherDay
  sunday?: WeatherDay
  headline: string
  raining: boolean
  hot: boolean
  source: 'live' | 'fallback' | 'override'
}

export interface Checkin {
  id: string
  activityId: string
  mood: string
  note: string
  spend: number
  people: number
  date: string
}

export interface SquadMember {
  id: string
  name: string
}

export interface Squad {
  code: string
  name: string
  members: SquadMember[]
  votes: Record<string, string[]>
  createdAt: string
}

export interface GuideStop {
  activityIds: string[]
  note: string
}

export interface Guide {
  id: string
  title: string
  coverHint: string
  duration: string
  budget: string
  weather: string
  stops: GuideStop[]
  pitfall: string
  body: string
}
