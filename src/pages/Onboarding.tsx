import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { ActivityType, Priority } from '../types'

const interestOptions: { id: ActivityType; label: string }[] = [
  { id: 'exhibition', label: '展览' },
  { id: 'market', label: '市集' },
  { id: 'show', label: '演出' },
  { id: 'hike', label: '徒步' },
  { id: 'food', label: '逛吃' },
]

const priorities: { id: Priority; label: string; desc: string }[] = [
  { id: 'save', label: '更省钱', desc: '免费和低消优先' },
  { id: 'fresh', label: '更新鲜', desc: '少一点人挤人' },
  { id: 'photo', label: '更好拍', desc: '出片优先' },
]

export function Onboarding() {
  const { prefs, setPrefs } = useStore()
  const nav = useNavigate()
  const [budget, setBudget] = useState(prefs.budget)
  const [people, setPeople] = useState(prefs.people)
  const [interests, setInterests] = useState<ActivityType[]>(prefs.interests)
  const [priority, setPriority] = useState<Priority>(prefs.priority)
  const [nickname, setNickname] = useState(prefs.nickname)

  const toggle = (id: ActivityType) => {
    setInterests((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    )
  }

  const done = () => {
    setPrefs({
      ...prefs,
      budget,
      people,
      interests: interests.length ? interests : ['market'],
      priority,
      nickname: nickname.trim() || '周末游客',
      onboarded: true,
    })
    nav('/')
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-xs tracking-widest text-teal">30 秒问卷</p>
        <h1 className="mt-1 font-serif text-3xl">这周末，你想怎么玩？</h1>
        <p className="mt-2 text-sm text-muted">
          信息不在多，而在给你一个能出发的主推荐。城市先定为深圳。
        </p>
      </div>

      <label className="block">
        <span className="text-sm">怎么称呼你</span>
        <input
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>

      <div>
        <div className="flex justify-between text-sm">
          <span>人均预算上限</span>
          <span className="font-serif">¥{budget}</span>
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

      <div>
        <div className="flex justify-between text-sm">
          <span>默认同行人数</span>
          <span>{people} 人</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="mt-2 w-full accent-teal"
        />
      </div>

      <div>
        <p className="text-sm">感兴趣的类型（可多选）</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {interestOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                interests.includes(o.id) ? 'bg-teal text-white' : 'bg-card border border-line'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm">更在意</p>
        {priorities.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPriority(p.id)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
              priority === p.id ? 'border-teal bg-teal/10' : 'border-line bg-card'
            }`}
          >
            <span className="font-medium">{p.label}</span>
            <span className="text-sm text-muted">{p.desc}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={done}
        className="w-full rounded-2xl bg-teal py-3 font-medium text-white"
      >
        生成本周末方案
      </button>
    </div>
  )
}
