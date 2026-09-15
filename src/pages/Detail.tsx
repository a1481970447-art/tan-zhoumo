import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { activityMap, TYPE_LABEL } from '../data/activities'
import { useStore } from '../store'

const moods = ['值', '还行', '累', '想再去']

export function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const activity = id ? activityMap[id] : undefined
  const { addCheckin, prefs, createSquad, activeSquad, vote } = useStore()
  const [mood, setMood] = useState('值')
  const [note, setNote] = useState('')
  const [spend, setSpend] = useState(activity?.cost ?? 0)
  const [people, setPeople] = useState(prefs.people)
  const [saved, setSaved] = useState(false)

  if (!activity) {
    return <p className="text-muted">活动不存在。</p>
  }

  const checkin = () => {
    addCheckin({
      activityId: activity.id,
      mood,
      note,
      spend: Number(spend) || 0,
      people,
      date: new Date().toISOString(),
    })
    setSaved(true)
  }

  const startSquad = () => {
    if (!activeSquad) createSquad(`${prefs.nickname}的小队`)
    vote(activity.id)
    nav('/squad')
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => nav(-1)} className="text-sm text-muted">
        ← 返回
      </button>
      <p className="text-xs tracking-widest text-teal">
        {TYPE_LABEL[activity.type]} · {activity.district}
      </p>
      <h1 className="font-serif text-3xl">{activity.title}</h1>
      <p className="text-muted">{activity.summary}</p>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-card p-3">
          <p className="text-muted">人均</p>
          <p className="font-serif text-lg">¥{activity.cost}</p>
        </div>
        <div className="rounded-xl bg-card p-3">
          <p className="text-muted">时长</p>
          <p className="font-serif text-lg">{activity.durationHours}h</p>
        </div>
        <div className="rounded-xl bg-card p-3">
          <p className="text-muted">场地</p>
          <p className="font-serif text-lg">{activity.indoor ? '室内' : '户外'}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-card p-4 text-sm">
        <p>集合：{activity.meetupStation}</p>
        <p className="mt-1">开放：{activity.hours}</p>
        <p className="mt-1">建议人数 {activity.minPeople}–{activity.maxPeople}</p>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {activity.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p className="rounded-2xl bg-sand/30 p-4 text-sm">避坑：{activity.tips}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={startSquad}
          className="flex-1 rounded-2xl bg-teal py-3 text-white"
        >
          拉人组队投票
        </button>
        <Link
          to="/squad"
          className="flex-1 rounded-2xl border border-line bg-card py-3 text-center"
        >
          查看小队
        </Link>
      </div>

      <section className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-xl">打卡这趟</h2>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`rounded-full px-3 py-1 text-sm ${
                mood === m ? 'bg-stamp text-white' : 'bg-paper'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <input
          className="w-full rounded-xl border border-line px-3 py-2 text-sm"
          placeholder="一句话记录"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            实际花费
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            同行人数
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={checkin}
          className="w-full rounded-2xl bg-ink py-3 text-white"
        >
          {saved ? '已盖章，去足迹看' : '盖章打卡'}
        </button>
        {saved && (
          <Link to="/prints" className="block text-center text-sm text-teal">
            打开足迹
          </Link>
        )}
      </section>
    </div>
  )
}
