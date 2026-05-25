import { useState, useEffect } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { robots, conflictPredictions, trafficSignals } from '../data/mockData'

const SIGNAL_POSITIONS = [
  { ...trafficSignals[0], x: 300, y: 250 },
  { ...trafficSignals[1], x: 500, y: 250 },
  { ...trafficSignals[2], x: 300, y: 400 },
  { ...trafficSignals[3], x: 600, y: 180 },
]

export default function MultiRobot() {
  const [movingRobots, setMovingRobots] = useState(robots.map(r => ({ ...r })))
  const [showSpaceTime, setShowSpaceTime] = useState(false)

  // 模拟多机器人移动
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingRobots(prev => prev.map(r => {
        if (r.status === 'charging') return r
        return {
          ...r,
          x: Math.max(60, Math.min(740, r.x + (Math.random() - 0.5) * 6)),
          y: Math.max(60, Math.min(540, r.y + (Math.random() - 0.5) * 6)),
        }
      }))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const activeCount = movingRobots.filter(r => r.status === 'moving').length
  const deadlockRisk = conflictPredictions.filter(c => c.type === '死锁风险').length

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🤖 多机器人协调</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="运行机器人" value={activeCount} subtitle="正在移动" icon="🤖" color="blue" />
        <StatusCard title="冲突预测" value={conflictPredictions.length} subtitle="未来60s" icon="⚡" color="yellow" />
        <StatusCard title="死锁风险" value={deadlockRisk} subtitle="需处理" icon="🔒" color="red" />
        <StatusCard title="交通信号" value={trafficSignals.length} subtitle="控制点" icon="🚦" color="green" />
      </div>

      <div className="flex gap-4">
        <div>
          <HospitalMap
            robots={movingRobots}
            showSignals={true}
            signals={SIGNAL_POSITIONS}
          />
          <div className="mt-2 flex gap-2">
            <Button variant={showSpaceTime ? 'primary' : 'outline'} onClick={() => setShowSpaceTime(!showSpaceTime)}>
              {showSpaceTime ? '隐藏时空图' : '显示时空图'}
            </Button>
            <Button variant="warning">⚡ 手动让行</Button>
            <Button variant="danger">🔒 触发死锁解决</Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* 机器人状态卡片 */}
          <Panel title="机器人实时状态">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {movingRobots.map(r => (
                <div key={r.id} className="p-2 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-xs text-white font-medium">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>电量 {r.battery}%</span>
                    <span>速度 {r.speed}m/s</span>
                    <Badge color={r.status === 'moving' ? 'green' : r.status === 'charging' ? 'yellow' : 'gray'}>
                      {r.status === 'moving' ? '移动' : r.status === 'charging' ? '充电' : '空闲'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 时空地图 */}
          {showSpaceTime && (
            <Panel title="时空地图 (Space-Time)">
              <div className="h-40 bg-slate-900 rounded-lg relative overflow-hidden p-2">
                {/* Y轴 = 时间, X轴 = 空间 */}
                <div className="absolute left-6 top-2 bottom-6 w-px bg-slate-700" />
                <div className="absolute left-6 bottom-6 right-2 h-px bg-slate-700" />
                <span className="absolute left-0 bottom-2 text-xs text-slate-500">空间</span>
                <span className="absolute left-0 top-2 text-xs text-slate-500">时间</span>
                {/* 机器人轨迹线 */}
                {movingRobots.slice(0, 4).map((r, i) => {
                  const points = Array.from({ length: 20 }, (_, j) => ({
                    x: 30 + (r.x / 800) * 200 + Math.sin(j * 0.5) * 15,
                    y: 20 + j * 6,
                  }))
                  return (
                    <svg key={r.id} className="absolute inset-0 w-full h-full">
                      <polyline
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={r.color}
                        strokeWidth="1.5"
                      />
                    </svg>
                  )
                })}
                {/* 冲突区域 */}
                <div className="absolute bg-red-500/20 border border-red-500/40 rounded" style={{ left: 100, top: 60, width: 40, height: 30 }} />
                <div className="absolute bg-yellow-500/20 border border-yellow-500/40 rounded" style={{ left: 160, top: 80, width: 30, height: 20 }} />
              </div>
            </Panel>
          )}

          {/* 冲突预测 */}
          <Panel title="冲突预测">
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {conflictPredictions.map(cp => (
                <div key={cp.id} className="p-2 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white">{cp.type}</span>
                    <Badge color={cp.type === '死锁风险' ? 'red' : 'yellow'}>
                      ETA {cp.eta}s
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    {cp.robots.join(' & ')} · {cp.location}
                  </div>
                  <div className="text-xs text-green-400 mt-1">解决方案: {cp.resolution}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 交通信号 */}
          <Panel title="交通信号状态">
            <div className="space-y-1.5">
              {SIGNAL_POSITIONS.map(sig => (
                <div key={sig.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                  <span className="text-xs text-white">{sig.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{sig.direction}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      sig.status === 'green' ? 'bg-green-500' :
                      sig.status === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
