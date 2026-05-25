import { useState, useEffect } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { useAppStore } from '../store/AppStore'

export default function MultiRobot() {
  const { robots, conflictPredictions, resolveConflict, triggerDeadlockResolve, trafficSignals, toggleSignal } = useAppStore()
  const [movingRobots, setMovingRobots] = useState(robots.map(r => ({ ...r })))
  const [showSpaceTime, setShowSpaceTime] = useState(false)
  const [actionLog, setActionLog] = useState([])

  // Sync with store
  useEffect(() => {
    setMovingRobots(robots.map(r => ({ ...r })))
  }, [robots])

  // Simulate movement
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

  const addLog = (msg) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setActionLog(prev => [...prev.slice(-19), { time, msg }])
  }

  const activeCount = movingRobots.filter(r => r.status === 'moving' || r.status === 'running').length
  const unresolvedDeadlocks = conflictPredictions.filter(c => c.type === '死锁风险' && !c.resolved).length
  const unresolvedConflicts = conflictPredictions.filter(c => !c.resolved).length

  const handleYield = () => {
    // Resolve the first unresolved non-deadlock conflict
    const target = conflictPredictions.find(c => !c.resolved && c.type !== '死锁风险')
    if (target) {
      resolveConflict(target.id)
      addLog(`手动让行: ${target.robots.join(' & ')} 在 ${target.location} 的 ${target.type} 已解决`)
    } else if (conflictPredictions.some(c => !c.resolved)) {
      const any = conflictPredictions.find(c => !c.resolved)
      resolveConflict(any.id)
      addLog(`手动让行: ${any.robots.join(' & ')} 在 ${any.location} 的冲突已解决`)
    } else {
      addLog('当前无待处理冲突')
    }
  }

  const handleDeadlockResolve = () => {
    if (unresolvedDeadlocks === 0) {
      addLog('当前无死锁风险')
      return
    }
    triggerDeadlockResolve()
    addLog(`触发死锁解决: 所有死锁风险已标记为已解决`)
  }

  const handleToggleSignal = (signalId) => {
    toggleSignal(signalId)
    const sig = trafficSignals.find(s => s.id === signalId)
    const nextStatus = sig ? ({ green: 'yellow', yellow: 'red', red: 'green' }[sig.status] || 'green') : 'green'
    addLog(`信号 ${sig?.location || signalId} 切换为 ${nextStatus === 'green' ? '绿灯' : nextStatus === 'yellow' ? '黄灯' : '红灯'}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🤖 多机器人协调</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="运行机器人" value={activeCount} subtitle="正在移动" icon="🤖" color="blue" />
        <StatusCard title="冲突预测" value={unresolvedConflicts} subtitle="待处理" icon="⚡" color="yellow" />
        <StatusCard title="死锁风险" value={unresolvedDeadlocks} subtitle="需处理" icon="🔒" color="red" />
        <StatusCard title="交通信号" value={trafficSignals.length} subtitle="控制点" icon="🚦" color="green" />
      </div>

      <div className="flex gap-4">
        <div>
          <HospitalMap robots={movingRobots} showSignals={true} signals={trafficSignals.map((s, i) => ({ ...s, x: s.x || 300 + i * 100, y: s.y || 250 }))} />
          <div className="mt-2 flex gap-2">
            <Button variant={showSpaceTime ? 'primary' : 'outline'} onClick={() => setShowSpaceTime(!showSpaceTime)}>
              {showSpaceTime ? '隐藏时空图' : '显示时空图'}
            </Button>
            <Button variant="warning" onClick={handleYield}>⚡ 手动让行</Button>
            <Button variant="danger" onClick={handleDeadlockResolve}>🔒 触发死锁解决</Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* Robot status */}
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
                    <Badge color={r.status === 'moving' || r.status === 'running' ? 'green' : r.status === 'charging' ? 'yellow' : 'gray'}>
                      {r.status === 'moving' || r.status === 'running' ? '移动' : r.status === 'charging' ? '充电' : '空闲'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Space-time map */}
          {showSpaceTime && (
            <Panel title="时空地图 (Space-Time)">
              <div className="h-40 bg-slate-900 rounded-lg relative overflow-hidden p-2">
                <div className="absolute left-6 top-2 bottom-6 w-px bg-slate-700" />
                <div className="absolute left-6 bottom-6 right-2 h-px bg-slate-700" />
                <span className="absolute left-0 bottom-2 text-xs text-slate-500">空间</span>
                <span className="absolute left-0 top-2 text-xs text-slate-500">时间</span>
                {movingRobots.slice(0, 4).map((r) => {
                  const points = Array.from({ length: 20 }, (_, j) => ({
                    x: 30 + (r.x / 800) * 200 + Math.sin(j * 0.5) * 15,
                    y: 20 + j * 6,
                  }))
                  return (
                    <svg key={r.id} className="absolute inset-0 w-full h-full">
                      <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={r.color} strokeWidth="1.5" />
                    </svg>
                  )
                })}
                {/* Conflict zones */}
                {conflictPredictions.filter(c => !c.resolved).map((c, i) => (
                  <div key={c.id} className={`absolute rounded ${c.type === '死锁风险' ? 'bg-red-500/20 border border-red-500/40' : 'bg-yellow-500/20 border border-yellow-500/40'}`}
                    style={{ left: 80 + i * 70, top: 50 + i * 20, width: 40, height: 30 }} />
                ))}
              </div>
            </Panel>
          )}

          {/* Conflict predictions */}
          <Panel title="冲突预测">
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {conflictPredictions.map(cp => (
                <div key={cp.id} className={`p-2 rounded-lg transition-all ${cp.resolved ? 'bg-slate-800/50 opacity-60' : 'bg-slate-800'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white">{cp.type}</span>
                    <div className="flex items-center gap-1">
                      <Badge color={cp.resolved ? 'green' : cp.type === '死锁风险' ? 'red' : 'yellow'}>
                        {cp.resolved ? '已解决' : `ETA ${cp.eta}s`}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{cp.robots.join(' & ')} · {cp.location}</div>
                  {!cp.resolved && <div className="text-xs text-green-400 mt-1">方案: {cp.resolution}</div>}
                  {cp.resolved && <div className="text-xs text-green-500 mt-1">✅ 已按方案解决</div>}
                </div>
              ))}
            </div>
          </Panel>

          {/* Traffic signals */}
          <Panel title="交通信号状态">
            <div className="space-y-1.5">
              {trafficSignals.map(sig => (
                <div key={sig.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                  <span className="text-xs text-white">{sig.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{sig.direction}</span>
                    <button onClick={() => handleToggleSignal(sig.id)}
                      className={`w-4 h-4 rounded-full cursor-pointer transition-all hover:scale-125 ${
                        sig.status === 'green' ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                        sig.status === 'red' ? 'bg-red-500 shadow-red-500/50 shadow-lg' :
                        'bg-yellow-500 shadow-yellow-500/50 shadow-lg'
                      }`} title="点击切换" />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Action log */}
          {actionLog.length > 0 && (
            <Panel title="操作日志">
              <div className="max-h-32 overflow-y-auto space-y-1">
                {actionLog.map((l, i) => (
                  <div key={i} className="text-xs flex gap-2">
                    <span className="text-slate-500 font-mono w-14 shrink-0">[{l.time}]</span>
                    <span className="text-slate-300">{l.msg}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
