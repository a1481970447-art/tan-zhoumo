import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { activityMap, TYPE_LABEL } from '../data/activities'
import { guides } from '../data/guides'
import { useStore } from '../store'
import type { Checkin } from '../types'

function weekendKey(iso: string) {
  const d = new Date(iso)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return `${mon.getFullYear()}-${mon.getMonth() + 1}-${mon.getDate()}`
}

function buildGuideText(items: Checkin[]) {
  const stops = items.slice(0, 3).map((c) => activityMap[c.activityId]?.title ?? '未知点')
  const avg = items.length
    ? Math.round(items.reduce((s, c) => s + c.spend, 0) / items.length)
    : 0
  return [
    '【探周末 · 深圳攻略卡】',
    `路线：${stops.join(' → ') || '先去打卡再生成'}`,
    `人均约 ¥${avg}`,
    '天气备注：出门前看「本周末」页的降雨概率，下雨改室内。',
    '避坑：高温中午不要排梧桐山；市集确认当周是否摆摊。',
  ].join('\n')
}

export function Footprints() {
  const { checkins, weather, applyGuideStops } = useStore()
  const nav = useNavigate()
  const [copied, setCopied] = useState(false)

  const applyGuide = (activityIds: string[]) => {
    applyGuideStops(activityIds)
    nav('/squad')
  }

  const groups = useMemo(() => {
    const map = new Map<string, Checkin[]>()
    for (const c of checkins) {
      const k = weekendKey(c.date)
      map.set(k, [...(map.get(k) ?? []), c])
    }
    return [...map.entries()]
  }, [checkins])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildGuideText(checkins))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">足迹与攻略</h1>

      <section className="rounded-2xl border border-dashed border-stamp bg-card p-4">
        <p className="stamp inline-block rounded-sm px-2 py-1 text-[10px]">GUIDE</p>
        <h2 className="mt-2 font-serif text-xl">用打卡生成攻略卡</h2>
        <p className="mt-1 text-sm text-muted">
          {weather?.headline ?? '结合本周天气'}。取最近 3 个打卡点连成路线。
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          {checkins.slice(0, 3).map((c) => (
            <li key={c.id}>{activityMap[c.activityId]?.title ?? c.activityId}</li>
          ))}
          {checkins.length === 0 && <li className="list-none text-muted">还没有打卡。</li>}
        </ol>
        <button
          type="button"
          onClick={copy}
          className="mt-3 w-full rounded-2xl bg-teal py-3 text-white"
        >
          {copied ? '已复制分享文案' : '复制攻略文案'}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">预置学生攻略</h2>
        {guides.map((g) => (
          <article key={g.id} className="rounded-2xl border border-line bg-card p-4">
            <p className="text-xs text-teal">{g.coverHint}</p>
            <h3 className="font-serif text-lg">{g.title}</h3>
            <p className="text-xs text-muted">
              {g.duration} · {g.budget} · {g.weather}
            </p>
            <p className="mt-2 text-sm">{g.body}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              {g.stops.map((stop, i) => (
                <li key={`${g.id}-${i}`}>
                  {stop.activityIds.length === 0 && stop.note}
                  {stop.activityIds.length === 1 && (
                    <Link to={`/activity/${stop.activityIds[0]}`} className="text-teal">
                      {stop.note}
                    </Link>
                  )}
                  {stop.activityIds.length > 1 && (
                    <>
                      <span>{stop.note}</span>
                      <span className="mt-0.5 block text-xs">
                        {stop.activityIds.map((id, j) => {
                          const a = activityMap[id]
                          if (!a) return null
                          return (
                            <span key={id}>
                              {j > 0 ? ' / ' : ''}
                              <Link to={`/activity/${id}`} className="text-teal">
                                {a.title}
                              </Link>
                            </span>
                          )
                        })}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-sm text-stamp">避坑：{g.pitfall}</p>
            <button
              type="button"
              onClick={() => applyGuide(g.stops.flatMap((s) => s.activityIds))}
              className="mt-3 w-full rounded-2xl bg-teal py-2 text-sm text-white"
            >
              套用这条线
            </button>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">打卡时间轴</h2>
        {groups.length === 0 && (
          <p className="text-sm text-muted">去活动详情页盖章，周末会在这里按周归档。</p>
        )}
        {groups.map(([week, items]) => (
          <div key={week} className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted">周起始 {week}</p>
            <ul className="mt-2 space-y-2">
              {items.map((c) => {
                const a = activityMap[c.activityId]
                return (
                  <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <Link to={`/activity/${c.activityId}`} className="font-medium">
                        {a?.title ?? '活动'}
                      </Link>
                      <p className="text-xs text-muted">
                        {a ? TYPE_LABEL[a.type] : ''} · {c.mood} · {c.people} 人
                      </p>
                      {c.note && <p className="text-muted">{c.note}</p>}
                    </div>
                    <span className="shrink-0">¥{c.spend}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
