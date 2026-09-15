import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { activityMap, TYPE_LABEL } from '../data/activities'
import { useStore } from '../store'

export function Squad() {
  const { prefs, ranked, activeSquad, createSquad, joinSquad, vote, memberId } = useStore()
  const [params] = useSearchParams()
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const joinedFromUrl = useRef(false)

  useEffect(() => {
    const q = params.get('squad')
    if (q && !joinedFromUrl.current) {
      joinedFromUrl.current = true
      joinSquad(q, prefs.nickname)
    }
  }, [joinSquad, params, prefs.nickname])

  const voted = useMemo(() => {
    if (!activeSquad) return []
    return Object.entries(activeSquad.votes)
      .map(([id, ids]) => ({ id, n: ids.length, picked: ids.includes(memberId) }))
      .sort((a, b) => b.n - a.n)
  }, [activeSquad, memberId])

  const share = async () => {
    if (!activeSquad) return
    const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/squad?squad=${activeSquad.code}`
    const text = `探周末组队口令 ${activeSquad.code} ${url}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const avg =
    voted.length === 0
      ? 0
      : Math.round(
          voted.reduce((s, v) => s + (activityMap[v.id]?.cost ?? 0) * v.n, 0) /
            Math.max(1, voted.reduce((s, v) => s + v.n, 0)),
        )

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl">组队出发</h1>
      <p className="text-sm text-muted">
        口令组队、投票选点。Demo 数据存在这台浏览器，把链接发给队友可在同机演示完整流。
      </p>

      {!activeSquad && (
        <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
          <button
            type="button"
            onClick={() => createSquad(`${prefs.nickname}的小队`)}
            className="w-full rounded-2xl bg-teal py-3 text-white"
          >
            创建小队
          </button>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-line px-3 py-2 uppercase"
              placeholder="口令 如 SZ-4K29"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              onClick={() => joinSquad(code, prefs.nickname)}
              className="rounded-xl bg-ink px-4 text-white"
            >
              加入
            </button>
          </div>
        </div>
      )}

      {activeSquad && (
        <>
          <section className="rounded-2xl bg-ink px-4 py-4 text-paper">
            <p className="text-xs opacity-70">{activeSquad.name}</p>
            <p className="font-serif text-3xl tracking-widest">{activeSquad.code}</p>
            <p className="mt-2 text-sm">
              {activeSquad.members.length} 人 · 投票均价约 ¥{avg || '—'}
            </p>
            <p className="mt-1 text-xs opacity-70">
              成员：{activeSquad.members.map((m) => m.name).join('、')}
            </p>
            <button
              type="button"
              onClick={share}
              className="mt-3 w-full rounded-xl bg-teal py-2 text-sm text-white"
            >
              {copied ? '已复制分享文案' : '复制口令与链接'}
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl">投票榜</h2>
            {voted.length === 0 && (
              <p className="text-sm text-muted">还没人投票。从下面候选里点选。</p>
            )}
            {voted.map((v) => {
              const a = activityMap[v.id]
              if (!a) return null
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => vote(v.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-left"
                >
                  <span>
                    <span className="text-xs text-teal">{TYPE_LABEL[a.type]}</span>
                    <span className="ml-2">{a.title}</span>
                    <span className="ml-2 text-xs text-muted">{a.meetupStation}</span>
                  </span>
                  <span className={`text-sm ${v.picked ? 'text-stamp' : 'text-muted'}`}>
                    {v.n} 票
                  </span>
                </button>
              )
            })}
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl">候选（结合本周推荐）</h2>
            {ranked.slice(0, 8).map((r) => (
              <div
                key={r.activity.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3"
              >
                <Link to={`/activity/${r.activity.id}`} className="min-w-0">
                  <p className="truncate">{r.activity.title}</p>
                  <p className="text-xs text-muted">
                    ¥{r.activity.cost} · {r.activity.meetupStation}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => vote(r.activity.id)}
                  className="shrink-0 rounded-full bg-teal px-3 py-1 text-sm text-white"
                >
                  {(activeSquad.votes[r.activity.id] ?? []).includes(memberId)
                    ? '取消'
                    : '投票'}
                </button>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
