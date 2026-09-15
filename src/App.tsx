import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Detail } from './pages/Detail'
import { Discover } from './pages/Discover'
import { Footprints } from './pages/Footprints'
import { Home } from './pages/Home'
import { Onboarding } from './pages/Onboarding'
import { Profile } from './pages/Profile'
import { Squad } from './pages/Squad'
import { StoreProvider, useStore } from './store'

function Gate({ children }: { children: ReactNode }) {
  const { prefs } = useStore()
  if (!prefs.onboarded) return <Navigate to="/welcome" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/welcome" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <Gate>
              <Home />
            </Gate>
          }
        />
        <Route
          path="/discover"
          element={
            <Gate>
              <Discover />
            </Gate>
          }
        />
        <Route
          path="/activity/:id"
          element={
            <Gate>
              <Detail />
            </Gate>
          }
        />
        <Route
          path="/squad"
          element={
            <Gate>
              <Squad />
            </Gate>
          }
        />
        <Route
          path="/prints"
          element={
            <Gate>
              <Footprints />
            </Gate>
          }
        />
        <Route
          path="/me"
          element={
            <Gate>
              <Profile />
            </Gate>
          }
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </BrowserRouter>
  )
}
