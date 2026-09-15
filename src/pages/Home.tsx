import { Link } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { useStore } from '../store'

function fmt(date?: string) {
  if (!date) return ''
  const d = new Date(`${date}T12:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function Home() {
  const { weather, ranked, prefs } = useStore()
  const top = ranked[0]
  const rest = ranked.slice(1, 5)

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-teal px-4 py-4 text-white">
        {weather ? (
          <>
            <p className="text-xs opacity-80">
              {weather.source === 'live' ? '深圳实况预报' : weather.source === 'override' ? '你正在预览假设天气' : '备用天气'}
            </p>
            <p className="mt-1 font-serif text-2xl">{weather.headline}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="opacity-80">周六 {fmt(weather.saturday?.date)}</p>
                <p className="text-lg">
                  {weather.saturday?.label} {weather.saturday?.tMax}°
                </p>
                <p className="text-xs opacity-80">降雨 {weather.saturday?.rainProb}%</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="opacity-80">周日 {fmt(weather.sunday?.date)}</p>
                <p className="text-lg">
                  {weather.sunday?.label} {weather.sunday?.tMax}°
                </p>
                <p className="text-xs opacity-80">降雨 {weather.sunday?.rainProb}%</p>
              </div>
            </div>
          </>
        ) : (
          <p>正在拉取深圳周末天气…</p>
        )}
      </section>

      <p className="text-sm text-muted">
        预算 ¥{prefs.budget} · {prefs.people} 人 · 先给你一个主推荐，减少纠结。
      </p>

      {top ? (
        <div className="space-y-2">
          <p className="text-xs tracking-widest text-stamp">本周末主推荐</p>
          <ActivityCard activity={top.activity} reasons={top.reasons} featured />
        </div>
      ) : weather ? (
        <p className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
          当前预算下没有匹配活动。去「我的」里把人均上限调高一点。
        </p>
      ) : null}

      {rest.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest text-muted">备选</p>
            <Link to="/discover" className="text-sm text-teal">
              全部发现
            </Link>
          </div>
          {rest.map((r) => (
            <ActivityCard key={r.activity.id} activity={r.activity} reasons={r.reasons} />
          ))}
        </div>
      )}
    </div>
  )
}
