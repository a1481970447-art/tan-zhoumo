import { activities } from '../data/activities'
import type { Activity, Prefs, WeekendWeather } from '../types'

export interface RankedActivity {
  activity: Activity
  score: number
  reasons: string[]
}

export function recommend(prefs: Prefs, weather: WeekendWeather): RankedActivity[] {
  const ranked: RankedActivity[] = []

  for (const activity of activities) {
    const reasons: string[] = []
    let score = 10

    if (activity.cost > prefs.budget) {
      continue
    }

    if (prefs.interests.includes(activity.type)) {
      score += 42
      reasons.push('符合你的兴趣')
    }

    if (weather.raining) {
      if (activity.indoor) {
        score += 36
        reasons.push('下雨天室内更稳')
      } else {
        score -= 38
        reasons.push('户外，雨天容错低')
      }
    }

    if (weather.hot) {
      if (activity.heatFriendly || activity.eveningBetter) {
        score += 18
        reasons.push(activity.eveningBetter ? '更适合傍晚出发' : '有遮荫或空调')
      }
      if (activity.type === 'hike' && !activity.heatFriendly) {
        score -= 28
        reasons.push('高温不建议长时间暴晒')
      }
    }

    if (!weather.raining && !weather.hot && !activity.indoor) {
      score += 12
      reasons.push('天气适合出门')
    }

    if (prefs.people <= 2 && (activity.type === 'exhibition' || activity.type === 'show')) {
      score += 12
      reasons.push('小人数好看展/听现场')
    }
    if (prefs.people >= 3 && (activity.type === 'market' || activity.type === 'hike' || activity.type === 'food')) {
      score += 14
      reasons.push('3 人以上更好玩')
    }
    if (prefs.people < activity.minPeople || prefs.people > activity.maxPeople) {
      score -= 8
    }

    if (prefs.priority === 'save') {
      score += Math.round((90 - activity.cost) / 4)
      if (activity.cost <= 20) reasons.push('几乎不花钱')
    }
    if (prefs.priority === 'photo' && activity.tags.includes('好拍')) {
      score += 22
      reasons.push('好拍')
    }
    if (prefs.priority === 'fresh' && activity.tags.includes('小众')) {
      score += 16
      reasons.push('相对不那么拥挤')
    }

    ranked.push({ activity, score, reasons: reasons.slice(0, 3) })
  }

  return ranked.sort((a, b) => b.score - a.score)
}
