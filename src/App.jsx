import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'

const MapOverview = lazy(() => import('./pages/MapOverview'))
const MapEditor = lazy(() => import('./pages/MapEditor'))
const PathPlan = lazy(() => import('./pages/PathPlan'))
const ReplanPage = lazy(() => import('./pages/ReplanPage'))
const RulesExport = lazy(() => import('./pages/RulesExport'))

function PageFallback() {
  return <div role="status" className="grid min-h-[40vh] place-items-center text-sm text-slate-500">正在加载功能模块…</div>
}

export default function App() {
  return (
    <AppStoreProvider>
    <HashRouter>
        <Layout>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<MapOverview />} />
              <Route path="/map-editor" element={<MapEditor />} />
              <Route path="/pathplan" element={<PathPlan />} />
              <Route path="/replan" element={<ReplanPage />} />
              <Route path="/rules" element={<RulesExport />} />
            </Routes>
          </Suspense>
        </Layout>
    </HashRouter>
    </AppStoreProvider>
  )
}
