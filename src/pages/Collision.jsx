import { useState, useEffect, useRef, useMemo } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { useAppStore } from '../store/AppStore'

export default function Collision() {
  const { robots, collisionAlerts, handleCollisionAlert, addCollisionAlert } = useAppStore()
  const [movingRobots, setMovingRobots] = useState(robots.map(r => ({ ...r })))
  const [showCones, setShowCones] = useState(true)
  const [activeAlert, setActiveAlert] = useState(null)

  // Sync with store robots
  useEffect(() => {
    setMovingRobots(robots.map(r => ({ ...r })))
  }, [robots])

  // Simulate robot movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingRobots(prev => prev.map(r => ({
        ...r,
        x: Math.max(60, Math.min(740, r.x + (Math.random() - 0.5) * 4)),
        y: Math.max(60, Math.min(540, r.y + (Math.random() - 0.5) * 4)),
      })))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const collisionCones = showCones ? [
    { x: 300, y: 250, dx: 1, dy: 0, spread: 0.4 },
    { x: 500, y: 300, dx: -0.7, dy: -0.7, spread: 0.3 },
  ] : []

  // Compute stats from store data
  const stats = useMemo(() => {
    const total = collisionAlerts.length
    const high = collisionAlerts.filter(a => a.risk === 'high').length
    const handled = collisionAlerts.filter(a => a.handled).length
    const rate = total > 0 ? ((handled / total) * 100).toFixed(1) : '100.0'
    return { total, high, handled, rate }
  }, [collisionAlerts])

  const handleSimulateAlert = () => {
    const locations = ['主大厅', 'ICU走廊', '药房入口', '住院部走廊', '手术区', '电梯间']
    const types = ['正面碰撞', '交叉碰撞', '追尾风险', '静态障碍', '转弯冲突']
    const riskLevels = ['high', 'medium', 'low']
    const robotPairs = [
      ['R001', 'R002'], ['R003', 'R004'], ['R001', 'R006'], ['R002', 'R003'], ['R004', 'R006'],
    ]
    const pair = robotPairs[Math.floor(Math.random() * robotPairs.length)]
    const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const newAlert = {
      id: `CA${String(collisionAlerts.length + 1).padStart(2, '0')}`,
      robot: pair[0], other: pair[1], robots: pair,
      location: locations[Math.floor(Math.random() * locations.length)],
      time: new Date().toTimeString().slice(0, 8),
      distance: (1 + Math.random() * 3).toFixed(1),
      action: risk === 'high' ? '紧急制动' : risk === 'medium' ? '减速避让' : '速度调整',
      risk,
      type: types[Math.floor(Math.random() * types.length)],
      handled: false,
    }
    addCollisionAlert(newAlert)
    setActiveAlert(newAlert)
    setTimeout(() => setActiveAlert(null), 3000)
  }

  const handleResolve = (alertId) => {
    handleCollisionAlert(alertId)
    setActiveAlert(null)
  }

  const riskColors = { high: 'red', medium: 'yellow', low: 'green' }
  const riskLabels = { high: '高危', medium: '中危', low: '低危' }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">⚠️ 碰撞预警</h2>
      <p className="text-slate-400 text-sm">实时监测机器人间碰撞风险，支持 DWA 局部避障和碰撞锥可视化，预警自动弹窗提醒。</p>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="预警总数" value={stats.total} subtitle="累计告警" icon="⚠️" color="red" />
        <StatusCard title="高危预警" value={stats.high} subtitle="需立即处理" icon="🔴" color="red" />
        <StatusCard title="动态障碍" value={collisionCones.length} subtitle="碰撞锥" icon="🔺" color="yellow" />
        <StatusCard title="避障成功率" value={`${stats.rate}%`} subtitle="已处理/总数" icon="✅" color="green" />
      </div>

      {/* Alert popup */}
      {activeAlert && !activeAlert.handled && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-900/90 border border-red-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <span className="text-white font-bold">碰撞预警</span>
              <Badge color={riskColors[activeAlert.risk]}>{riskLabels[activeAlert.risk]}</Badge>
            </div>
            <div className="text-sm text-red-200">
              <div>位置: {activeAlert.location}</div>
              <div>类型: {activeAlert.type}</div>
              <div>距离: {activeAlert.distance}m</div>
              <div>机器人: {activeAlert.robots.join(', ')}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="success" size="sm" onClick={() => handleResolve(activeAlert.id)}>✅ 已处理</Button>
              <Button variant="outline" size="sm" onClick={() => setActiveAlert(null)}>忽略</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div>
          <HospitalMap robots={movingRobots} collisionCones={collisionCones} showCollisionCones={showCones} />
          <div className="mt-2 flex gap-2">
            <Button variant={showCones ? 'primary' : 'outline'} onClick={() => setShowCones(!showCones)}>
              {showCones ? '隐藏碰撞锥' : '显示碰撞锥'}
            </Button>
            <Button variant="warning" onClick={handleSimulateAlert}>⚠️ 模拟预警</Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* DWA sampling */}
          <Panel title="DWA 采样空间">
            <div className="h-40 bg-slate-900 rounded-lg relative overflow-hidden">
              {Array.from({ length: 30 }, (_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const r = 30 + Math.random() * 40
                const cx = 120 + Math.cos(angle) * r
                const cy = 70 + Math.sin(angle) * r
                const valid = Math.random() > 0.3
                return (
                  <div key={i} className={`absolute w-2 h-2 rounded-full ${valid ? 'bg-green-400' : 'bg-red-400'}`} style={{ left: cx, top: cy }} />
                )
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full" />
              <div className="absolute bottom-1 left-2 text-xs text-slate-500">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1" />可行
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full mx-1 ml-3" />碰撞
              </div>
            </div>
          </Panel>

          {/* Alert list */}
          <Panel title={`预警记录 (${collisionAlerts.length})`}>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {collisionAlerts.map(alert => (
                <div key={alert.id}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${alert.handled ? 'bg-slate-800/50 opacity-60' : 'bg-slate-800 hover:bg-slate-700'}`}
                  onClick={() => !alert.handled && setActiveAlert(alert)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{alert.time}</span>
                    <div className="flex items-center gap-1">
                      <Badge color={riskColors[alert.risk]}>{riskLabels[alert.risk]}</Badge>
                      {alert.handled && <Badge color="green">已处理</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-white">{alert.type} - {alert.location}</div>
                  <div className="text-xs text-slate-500">
                    {alert.robots.join(' & ')} · 距离 {alert.distance}m
                  </div>
                  {!alert.handled && (
                    <Button variant="success" size="xs" className="mt-1" onClick={(e) => { e.stopPropagation(); handleResolve(alert.id) }}>
                      ✅ 标记处理
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
