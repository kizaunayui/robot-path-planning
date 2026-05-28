import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'
import MapOverview from './pages/MapOverview'
import MapEditor from './pages/MapEditor'
import PathPlan from './pages/PathPlan'
import ReplanPage from './pages/ReplanPage'
import RulesExport from './pages/RulesExport'

export default function App() {
  return (
    <AppStoreProvider>
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MapOverview />} />
          <Route path="/map-editor" element={<MapEditor />} />
          <Route path="/pathplan" element={<PathPlan />} />
          <Route path="/replan" element={<ReplanPage />} />
          <Route path="/rules" element={<RulesExport />} />
        </Routes>
      </Layout>
    </HashRouter>
    </AppStoreProvider>
  )
}
