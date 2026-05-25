import { useState, useRef, useCallback, useMemo } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { pathResults, hospitalMap } from '../data/mockData'
import { useAppStore } from '../store/AppStore'

// Generate path coords based on start/end points
function generatePathCoords(start, end, algorithm) {
  const [sx, sy] = start
  const [ex, ey] = end
  const points = []
  const steps = algorithm === 'RRT*' ? 20 : algorithm === '混合算法' ? 16 : 12
  const jitter = algorithm === 'RRT*' ? 40 : algorithm === '混合算法' ? 20 : 8
  // Seed based on algorithm
  const seedOffset = algorithm === 'A*' ? 0 : algorithm === 'RRT*' ? 137 : 42
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = sx + (ex - sx) * t + (i > 0 && i < steps ? Math.sin((i + seedOffset) * 1.3) * jitter : 0)
    const y = sy + (ey - sy) * t + (i > 0 && i < steps ? Math.cos((i + seedOffset) * 0.9) * jitter : 0)
    points.push([Math.round(Math.max(50, Math.min(750, x))), Math.round(Math.max(50, Math.min(550, y)))])
  }
  return points
}

function generatePathResult(algorithm, start, end) {
  const coords = generatePathCoords(start, end, algorithm)
  let totalLen = 0
  for (let i = 1; i < coords.length; i++) {
    totalLen += Math.sqrt((coords[i][0] - coords[i-1][0])**2 + (coords[i][1] - coords[i-1][1])**2)
  }
  totalLen = Math.round(totalLen / 10 * 10) / 10
  const multipliers = { 'A*': { time: 0.85, energy: 1.0, smooth: 0.9, rel: 0.93 }, 'RRT*': { time: 1.2, energy: 1.3, smooth: 0.75, rel: 0.85 }, '混合算法': { time: 1.0, energy: 1.1, smooth: 0.85, rel: 0.90 } }
  const m = multipliers[algorithm] || multipliers['A*']
  return {
    id: `gen_${algorithm}`,
    algorithm,
    from: `(${start[0]},${start[1]})`,
    to: `(${end[0]},${end[1]})`,
    nodes: coords.map((_, i) => `gen_${i}`),
    coords,
    length: totalLen,
    time: Math.round(totalLen * m.time),
    energy: Math.round(totalLen * m.energy * 10) / 10,
    reliability: m.rel,
    smoothness: m.smooth,
  }
}

export default function PathPlan() {
  const { robots } = useAppStore()
  const [algorithm, setAlgorithm] = useState('A*')
  const [selectedPath, setSelectedPath] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const [clickMode, setClickMode] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animatedNodes, setAnimatedNodes] = useState([])
  const [smoothIterations, setSmoothIterations] = useState(0)
  const [plannedPaths, setPlannedPaths] = useState([])
  const animRef = useRef(null)

  const handleMapClick = (x, y) => {
    if (clickMode === 'start') {
      setStartPoint([x, y])
      setClickMode(null)
    } else if (clickMode === 'end') {
      setEndPoint([x, y])
      setClickMode(null)
    }
  }

  const animatePath = useCallback((nodes) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setIsAnimating(true)
    setAnimatedNodes([])
    let idx = 0
    const step = () => {
      idx++
      setAnimatedNodes(nodes.slice(0, idx + 1))
      if (idx < nodes.length - 1) {
        setTimeout(() => requestAnimationFrame(step), 200)
      } else {
        setIsAnimating(false)
      }
    }
    requestAnimationFrame(step)
  }, [])

  const handlePlan = () => {
    const start = startPoint || [200, 300]
    const end = endPoint || [600, 400]

    // Generate paths for all 3 algorithms
    const results = ['A*', 'RRT*', '混合算法'].map(algo => generatePathResult(algo, start, end))
    setPlannedPaths(results)

    const path = results.find(p => p.algorithm === algorithm) || results[0]
    setSelectedPath(path)
    animatePath(path.coords)

    let iter = 0
    setSmoothIterations(0)
    const smoothInterval = setInterval(() => {
      iter += 1
      setSmoothIterations(iter)
      if (iter >= 10) clearInterval(smoothInterval)
    }, 300)
  }

  const paths = []
  if (animatedNodes.length > 1) {
    paths.push({ nodes: animatedNodes, color: '#3b82f6', width: 3 })
  }

  const displayPaths = plannedPaths.length > 0 ? plannedPaths : pathResults

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📐 路径规划</h2>
      <p className="text-slate-400 text-sm">支持 A*/RRT*/混合算法三种路径规划，点击地图设置起终点，实时对比不同算法的路径效果。</p>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="支持算法" value="3" subtitle="A*/RRT*/混合" icon="🧮" color="blue" />
        <StatusCard title="已规划路径" value={plannedPaths.length || pathResults.length} subtitle="本次/累计" icon="📐" color="green" />
        <StatusCard title="平均路径长" value={`${(displayPaths.reduce((a, b) => a + b.length, 0) / displayPaths.length).toFixed(0)}m`} subtitle="所有算法" icon="📏" color="purple" />
        <StatusCard title="平滑迭代" value={smoothIterations} subtitle="梯度下降" icon="📈" color="yellow" />
      </div>

      <div className="flex gap-4">
        <div>
          <HospitalMap
            robots={robots.slice(0, 2)}
            paths={paths}
            onClick={handleMapClick}
          />
          {startPoint && (
            <div className="mt-1 text-xs text-green-400">起点: ({startPoint[0]}, {startPoint[1]})</div>
          )}
          {endPoint && (
            <div className="text-xs text-red-400">终点: ({endPoint[0]}, {endPoint[1]})</div>
          )}
        </div>

        <div className="w-72 space-y-3">
          <Panel title="算法选择">
            <div className="space-y-2">
              {['A*', 'RRT*', '混合算法'].map(algo => (
                <label key={algo} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="algorithm" checked={algorithm === algo} onChange={() => { setAlgorithm(algo); if (plannedPaths.length) { const p = plannedPaths.find(pp => pp.algorithm === algo); if (p) { setSelectedPath(p); animatePath(p.coords) }}}} className="accent-blue-500" />
                  <span className="text-sm text-slate-300">{algo}</span>
                  {algo === 'A*' && <span className="text-xs text-slate-500 ml-auto">最短距离</span>}
                  {algo === 'RRT*' && <span className="text-xs text-slate-500 ml-auto">随机探索</span>}
                  {algo === '混合算法' && <span className="text-xs text-slate-500 ml-auto">综合优化</span>}
                </label>
              ))}
            </div>
          </Panel>

          <Panel title="起终点设置">
            <div className="space-y-2">
              <Button variant={clickMode === 'start' ? 'success' : 'outline'} onClick={() => setClickMode(clickMode === 'start' ? null : 'start')} className="w-full">
                {clickMode === 'start' ? '📍 点击地图选择起点...' : '🟢 设置起点'}
              </Button>
              <Button variant={clickMode === 'end' ? 'danger' : 'outline'} onClick={() => setClickMode(clickMode === 'end' ? null : 'end')} className="w-full">
                {clickMode === 'end' ? '📍 点击地图选择终点...' : '🔴 设置终点'}
              </Button>
              <Button variant="primary" onClick={handlePlan} disabled={isAnimating} className="w-full">
                {isAnimating ? '⏳ 规划中...' : '▶️ 开始规划'}
              </Button>
              {(startPoint || endPoint) && (
                <Button variant="outline" onClick={() => { setStartPoint(null); setEndPoint(null); setPlannedPaths([]); setSelectedPath(null); setSmoothIterations(0) }} className="w-full text-xs">
                  🔄 重置起终点
                </Button>
              )}
            </div>
          </Panel>

          {/* Path comparison when all 3 are planned */}
          {plannedPaths.length === 3 && (
            <Panel title="三算法对比">
              <div className="space-y-2">
                {plannedPaths.map(p => (
                  <div key={p.algorithm} onClick={() => { setAlgorithm(p.algorithm); setSelectedPath(p); animatePath(p.coords) }}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${selectedPath?.algorithm === p.algorithm ? 'bg-blue-900/30 border border-blue-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white font-medium">{p.algorithm}</span>
                      <Badge color={p.algorithm === 'A*' ? 'blue' : p.algorithm === 'RRT*' ? 'purple' : 'green'}>{p.length}m</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">时间 {p.time}s · 平滑 {(p.smoothness*100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {selectedPath && (
            <Panel title="路径指标">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">算法</span>
                  <Badge color="blue">{selectedPath.algorithm}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">起终点</span>
                  <span className="text-white text-xs">{selectedPath.from} → {selectedPath.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">路径长度</span>
                  <span className="text-white font-mono">{selectedPath.length}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">预估时间</span>
                  <span className="text-white font-mono">{selectedPath.time}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">平滑度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedPath.smoothness * 100}%` }} />
                    </div>
                    <span className="text-white text-xs">{(selectedPath.smoothness * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-slate-500 mb-1">梯度下降迭代</div>
                  <div className="w-full h-2 bg-slate-700 rounded-full">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${smoothIterations * 10}%` }} />
                  </div>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="历史路径">
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {displayPaths.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700"
                  onClick={() => { setSelectedPath(p); animatePath(p.coords || p.nodes) }}>
                  <div>
                    <div className="text-xs text-white">{p.from} → {p.to}</div>
                    <div className="text-xs text-slate-500">{p.algorithm} · {p.length}m</div>
                  </div>
                  <Badge color={p.algorithm === 'A*' ? 'blue' : p.algorithm === 'RRT*' ? 'purple' : 'green'}>{p.algorithm}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
