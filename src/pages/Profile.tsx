import { Link } from 'react-router-dom'
import { useStore } from '../store'
import type { ActivityType, WeatherOverride } from '../types'

const interestOptions: { id: ActivityType; label: string }[] = [
  { id: 'exhibition', label: '展览' },
  { id: 'market', label: '市集' },
  { id: 'show', label: '演出' },
  { id: 'hike', label: '徒步' },
  { id: 'food', label: '逛吃' },
]

export function Profile() {
  const { prefs, setPrefs, checkins } = useStore()

  const toggle = (id: ActivityType) => {
    const interests = prefs.interests.includes(id)
      ? prefs.interests.filter((x) => x !== id)
      : [...prefs.interests, id]
    setPrefs({ ...prefs, interests: interests.length ? interests : [id] })
  }

  const setWeather = (weatherOverride: WeatherOverride) => setPrefs({ ...prefs, weatherOverride })

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">我的出发偏好</h1>
      <p className="text-sm text-muted">
        已打卡 {checkins.length} 次。改预算或天气假设后，回「本周末」看推荐变化。
      </p>

      <label className="block text-sm">
        昵称
        <input
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2"
          value={prefs.nickname}
          onChange={(e) => setPrefs({ ...prefs, nickname: e.target.value })}
        />
      </label>

      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="text-sm">城市</p>
        <p className="font-serif text-xl">深圳</p>
        <p className="mt-1 text-xs text-muted">首发只做深圳。其他城市入口预留，数据尚未铺开。</p>
        <div className="mt-2 flex gap-2">
          {['上海', '北京', '杭州'].map((c) => (
            <span key={c} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {c} 即将开通
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>人均预算上限</span>
          <span>¥{prefs.budget}</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={10}
          value={prefs.budget}
          onChange={(e) => setPrefs({ ...prefs, budget: Number(e.target.value) })}
          className="mt-2 w-full accent-teal"
        />
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>默认同行</span>
          <span>{prefs.people} 人</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={prefs.people}
          onChange={(e) => setPrefs({ ...prefs, people: Number(e.target.value) })}
          className="mt-2 w-full accent-teal"
        />
      </div>

      <div>
        <p className="text-sm">兴趣</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {interestOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                prefs.interests.includes(o.id) ? 'bg-teal text-white' : 'border border-line bg-card'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm">天气假设（演示推荐变化）</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ['live', '跟随实况'],
              ['sunny', '假装晴热'],
              ['rain', '假装暴雨'],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setWeather(k)}
              className={`rounded-xl py-2 text-sm ${
                prefs.weatherOverride === k ? 'bg-ink text-paper' : 'border border-line bg-card'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <Link to="/welcome" className="block text-center text-sm text-teal">
        重新做一遍问卷
      </Link>
    </div>
  )
}
