import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MapOverview from './pages/MapOverview'
import PathPlan from './pages/PathPlan'
import Collision from './pages/Collision'
import NavMesh from './pages/NavMesh'
import MultiRobot from './pages/MultiRobot'
import TaskAllocation from './pages/TaskAllocation'
import CostMap from './pages/CostMap'
import HISPolicy from './pages/HISPolicy'
import Charging from './pages/Charging'
import Diagnostics from './pages/Diagnostics'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MapOverview />} />
          <Route path="/pathplan" element={<PathPlan />} />
          <Route path="/collision" element={<Collision />} />
          <Route path="/navmesh" element={<NavMesh />} />
          <Route path="/multi-robot" element={<MultiRobot />} />
          <Route path="/tasks" element={<TaskAllocation />} />
          <Route path="/costmap" element={<CostMap />} />
          <Route path="/his" element={<HISPolicy />} />
          <Route path="/charging" element={<Charging />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
