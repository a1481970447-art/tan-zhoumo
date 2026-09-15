import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/', label: '本周末', end: true },
  { to: '/discover', label: '发现' },
  { to: '/squad', label: '组队' },
  { to: '/prints', label: '足迹' },
  { to: '/me', label: '我的' },
]

export function Layout() {
  const { pathname } = useLocation()
  const hideNav = pathname === '/welcome'

  return (
    <div className={`mx-auto min-h-svh max-w-lg bg-paper text-ink md:max-w-2xl ${hideNav ? 'pb-8' : 'pb-24'}`}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/80 bg-paper/90 px-5 py-3 backdrop-blur">
        <div>
          <p className="font-serif text-lg tracking-wide">探周末</p>
          <p className="text-xs text-muted">深圳 · 大学生周末出发指南</p>
        </div>
        <span className="stamp rounded-sm px-2 py-1 text-[10px]">SZ</span>
      </header>
      <main className="px-5 py-4">
        <Outlet />
      </main>
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-between px-2 py-2 md:max-w-2xl">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex-1 rounded-lg py-2 text-center text-sm ${
                    isActive ? 'bg-teal text-white' : 'text-muted'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
