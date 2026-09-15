import { Link } from 'react-router-dom'
import { TYPE_LABEL } from '../data/activities'
import type { Activity } from '../types'

export function ActivityCard({
  activity,
  reasons,
  featured,
}: {
  activity: Activity
  reasons?: string[]
  featured?: boolean
}) {
  return (
    <Link
      to={`/activity/${activity.id}`}
      className={`block rounded-2xl border border-line bg-card p-4 shadow-sm ${
        featured ? 'ring-2 ring-teal/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-teal">
            {TYPE_LABEL[activity.type]} · {activity.district}
          </p>
          <h3 className="mt-1 font-serif text-xl">{activity.title}</h3>
          <p className="mt-1 text-sm text-muted">{activity.subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-lg">¥{activity.cost}</p>
          <p className="text-[11px] text-muted">人均</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(reasons?.length ? reasons : activity.tags).slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted">
            {t}
          </span>
        ))}
        <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted">
          {activity.indoor ? '室内' : '户外'} · {activity.durationHours}h
        </span>
      </div>
    </Link>
  )
}
