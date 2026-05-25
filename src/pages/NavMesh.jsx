import { useState } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { navMeshTriangles, feasibilityResults, robots } from '../data/mockData'

export default function NavMesh() {
  const [showMesh, setShowMesh] = useState(true)
  const [showFeasibility, setShowFeasibility] = useState(false)
  const [results, setResults] = useState([])

  const handleSimulate = () => {
    setShowFeasibility(true)
    setResults(feasibilityResults)
  }

  const passCount = feasibilityResults.filter(r => r.status === 'pass').length
  const conflictCount = feasibilityResults.filter(r => r.status === 'conflict').length

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🔺 导航网格</h2>
      <p className="text-slate-400 text-sm">基于 Delaunay 三角剖分构建导航网格，支持路径可行性仿真和冲突检测。</p>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="三角形数" value={navMeshTriangles.length} subtitle="网格单元" icon="🔺" color="blue" />
        <StatusCard title="可行路径" value={passCount} subtitle="仿真通过" icon="✅" color="green" />
        <StatusCard title="冲突路径" value={conflictCount} subtitle="需优化" icon="❌" color="red" />
        <StatusCard title="覆盖率" value="94.2%" subtitle="可通行区域" icon="📊" color="purple" />
      </div>

      <div className="flex gap-4">
        <div>
          <HospitalMap
            robots={robots.slice(0, 2)}
            showNavMesh={showMesh}
            navMeshTriangles={navMeshTriangles}
          />
          <div className="mt-2 flex gap-2">
            <Button variant={showMesh ? 'primary' : 'outline'} onClick={() => setShowMesh(!showMesh)}>
              {showMesh ? '隐藏网格' : '显示网格'}
            </Button>
            <Button variant="success" onClick={handleSimulate}>
              🔍 路径可行性仿真
            </Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* 网格信息 */}
          <Panel title="网格统计">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">三角剖分算法</span>
                <span className="text-white">Delaunay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">三角形数量</span>
                <span className="text-white font-mono">{navMeshTriangles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">顶点数量</span>
                <span className="text-white font-mono">{navMeshTriangles.length * 3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">平均边长</span>
                <span className="text-white font-mono">~120px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">最小角度</span>
                <span className="text-white font-mono">28.5°</span>
              </div>
            </div>
          </Panel>

          {/* 仿真结果 */}
          {showFeasibility && (
            <Panel title="仿真结果">
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {results.map(r => (
                  <div key={r.id} className="p-2 bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white">{r.path}</span>
                      <Badge color={r.status === 'pass' ? 'green' : r.status === 'conflict' ? 'red' : 'yellow'}>
                        {r.status === 'pass' ? '通过' : r.status === 'conflict' ? '冲突' : '警告'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">{r.detail}</div>
                    {r.conflicts > 0 && (
                      <div className="text-xs text-red-400 mt-1">冲突点: {r.conflicts}处</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">总路径</span>
                  <span className="text-white">{results.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">通过率</span>
                  <span className="text-green-400">{((passCount / results.length) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
