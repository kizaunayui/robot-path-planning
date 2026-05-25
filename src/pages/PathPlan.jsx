import { useState, useRef, useCallback } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { pathResults, hospitalMap, robots } from '../data/mockData'

export default function PathPlan() {
  const [algorithm, setAlgorithm] = useState('A*')
  const [selectedPath, setSelectedPath] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const [clickMode, setClickMode] = useState(null) // 'start' | 'end'
  const [isAnimating, setIsAnimating] = useState(false)
  const [animatedNodes, setAnimatedNodes] = useState([])
  const [smoothIterations, setSmoothIterations] = useState(0)
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
    const path = pathResults.find(p => p.algorithm === algorithm) || pathResults[0]
    setSelectedPath(path)
    animatePath(path.coords || path.nodes)
    // 模拟平滑迭代
    let iter = 0
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📐 路径规划</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="支持算法" value="3" subtitle="A*/RRT*/混合" icon="🧮" color="blue" />
        <StatusCard title="已规划路径" value={pathResults.length} subtitle="累计" icon="📐" color="green" />
        <StatusCard title="平均路径长" value={`${(pathResults.reduce((a, b) => a + b.length, 0) / pathResults.length).toFixed(0)}m`} subtitle="所有算法" icon="📏" color="purple" />
        <StatusCard title="平滑迭代" value={smoothIterations} subtitle="梯度下降" icon="📈" color="yellow" />
      </div>

      <div className="flex gap-4">
        {/* 地图 */}
        <div>
          <HospitalMap
            robots={robots.slice(0, 2)}
            paths={paths}
            onClick={handleMapClick}
          />
          {/* 起终点标注 */}
          {startPoint && (
            <div className="mt-1 text-xs text-green-400">起点: ({startPoint[0]}, {startPoint[1]})</div>
          )}
          {endPoint && (
            <div className="text-xs text-red-400">终点: ({endPoint[0]}, {endPoint[1]})</div>
          )}
        </div>

        {/* 控制面板 */}
        <div className="w-72 space-y-3">
          {/* 算法选择 */}
          <Panel title="算法选择">
            <div className="space-y-2">
              {['A*', 'RRT*', '混合算法'].map(algo => (
                <label key={algo} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="algorithm"
                    checked={algorithm === algo}
                    onChange={() => setAlgorithm(algo)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-slate-300">{algo}</span>
                </label>
              ))}
            </div>
          </Panel>

          {/* 起终点选择 */}
          <Panel title="起终点设置">
            <div className="space-y-2">
              <Button
                variant={clickMode === 'start' ? 'success' : 'outline'}
                onClick={() => setClickMode(clickMode === 'start' ? null : 'start')}
                className="w-full"
              >
                {clickMode === 'start' ? '📍 点击地图选择起点...' : '🟢 设置起点'}
              </Button>
              <Button
                variant={clickMode === 'end' ? 'danger' : 'outline'}
                onClick={() => setClickMode(clickMode === 'end' ? null : 'end')}
                className="w-full"
              >
                {clickMode === 'end' ? '📍 点击地图选择终点...' : '🔴 设置终点'}
              </Button>
              <Button variant="primary" onClick={handlePlan} disabled={isAnimating} className="w-full">
                {isAnimating ? '⏳ 规划中...' : '▶️ 开始规划'}
              </Button>
            </div>
          </Panel>

          {/* 路径指标 */}
          {selectedPath && (
            <Panel title="路径指标">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">算法</span>
                  <Badge color="blue">{selectedPath.algorithm}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">起终点</span>
                  <span className="text-white">{selectedPath.from} → {selectedPath.to}</span>
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
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${selectedPath.smoothness * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">{(selectedPath.smoothness * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {/* 平滑迭代进度 */}
                <div className="mt-2">
                  <div className="text-xs text-slate-500 mb-1">梯度下降迭代</div>
                  <div className="w-full h-2 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${smoothIterations * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* 历史路径 */}
          <Panel title="历史路径">
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {pathResults.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700"
                  onClick={() => { setSelectedPath(p); animatePath(p.coords || p.nodes) }}
                >
                  <div>
                    <div className="text-xs text-white">{p.from} → {p.to}</div>
                    <div className="text-xs text-slate-500">{p.algorithm} · {p.length}m</div>
                  </div>
                  <Badge color={p.algorithm === 'A*' ? 'blue' : p.algorithm === 'RRT*' ? 'purple' : 'green'}>
                    {p.algorithm}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
