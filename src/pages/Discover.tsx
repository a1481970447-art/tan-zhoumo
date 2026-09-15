import { useMemo, useState } from 'react'
import { ActivityCard } from '../components/ActivityCard'
import { TYPE_LABEL, activities } from '../data/activities'
import { useStore } from '../store'
import type { ActivityType } from '../types'

const types: (ActivityType | 'all')[] = ['all', 'exhibition', 'market', 'show', 'hike', 'food']

export function Discover() {
  const { prefs, ranked } = useStore()
  const [type, setType] = useState<ActivityType | 'all'>('all')
  const [place, setPlace] = useState<'all' | 'in' | 'out'>('all')
  const [budget, setBudget] = useState(prefs.budget)

  const order = useMemo(() => {
    const score = Object.fromEntries(ranked.map((r) => [r.activity.id, r.score]))
    return [...activities]
      .filter((a) => a.cost <= budget)
      .filter((a) => (type === 'all' ? true : a.type === type))
      .filter((a) => (place === 'all' ? true : place === 'in' ? a.indoor : !a.indoor))
      .sort((a, b) => (score[b.id] ?? 0) - (score[a.id] ?? 0))
  }, [budget, place, ranked, type])

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">发现深圳周末</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm ${
              type === t ? 'bg-ink text-paper' : 'border border-line bg-card'
            }`}
          >
            {t === 'all' ? '全部' : TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(
          [
            ['all', '不限场地'],
            ['in', '室内'],
            ['out', '户外'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setPlace(k)}
            className={`rounded-full px-3 py-1 text-sm ${
              place === k ? 'bg-teal text-white' : 'border border-line bg-card'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-sm">
          <span>筛选人均 ≤</span>
          <span>¥{budget}</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={10}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-teal"
        />
      </div>
      <p className="text-xs text-muted">排序已结合你的天气与偏好，不是单纯列表。</p>
      {order.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
      {order.length === 0 && <p className="text-sm text-muted">没有符合筛选的活动。</p>}
    </div>
  )
}
