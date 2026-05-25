import { useState, useEffect, useRef } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { collisionAlerts, robots } from '../data/mockData'

export default function Collision() {
  const [movingRobots, setMovingRobots] = useState(robots.map(r => ({ ...r })))
  const [showCones, setShowCones] = useState(true)
  const [alerts, setAlerts] = useState(collisionAlerts)
  const [activeAlert, setActiveAlert] = useState(null)
  const animRef = useRef(null)

  // 模拟机器人移动
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingRobots(prev => prev.map(r => ({
        ...r,
        x: r.x + (Math.random() - 0.5) * 4,
        y: r.y + (Math.random() - 0.5) * 4,
      })))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // 碰撞锥数据
  const collisionCones = showCones ? [
    { x: 300, y: 250, dx: 1, dy: 0, spread: 0.4 },
    { x: 500, y: 300, dx: -0.7, dy: -0.7, spread: 0.3 },
  ] : []

  // 模拟碰撞预警弹窗
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAlert = collisionAlerts[Math.floor(Math.random() * collisionAlerts.length)]
      setActiveAlert(randomAlert)
      setTimeout(() => setActiveAlert(null), 3000)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const riskColors = { high: 'red', medium: 'yellow', low: 'green' }
  const riskLabels = { high: '高危', medium: '中危', low: '低危' }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">⚠️ 碰撞预测与避障</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="预警总数" value={alerts.length} subtitle="累计告警" icon="⚠️" color="red" />
        <StatusCard title="高危预警" value={alerts.filter(a => a.risk === 'high').length} subtitle="需立即处理" icon="🔴" color="red" />
        <StatusCard title="动态障碍" value={collisionCones.length} subtitle="碰撞锥" icon="🔺" color="yellow" />
        <StatusCard title="避障成功率" value="97.3%" subtitle="近24小时" icon="✅" color="green" />
      </div>

      {/* 碰撞预警弹窗 */}
      {activeAlert && (
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
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div>
          <HospitalMap
            robots={movingRobots}
            collisionCones={collisionCones}
            showCollisionCones={showCones}
          />
          <div className="mt-2 flex gap-2">
            <Button variant={showCones ? 'primary' : 'outline'} onClick={() => setShowCones(!showCones)}>
              {showCones ? '隐藏碰撞锥' : '显示碰撞锥'}
            </Button>
            <Button variant="warning" onClick={() => setActiveAlert(alerts[Math.floor(Math.random() * alerts.length)])}>
              模拟预警
            </Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* DWA采样点可视化 */}
          <Panel title="DWA 采样空间">
            <div className="h-40 bg-slate-900 rounded-lg relative overflow-hidden">
              {/* 模拟DWA采样点 */}
              {Array.from({ length: 30 }, (_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const r = 30 + Math.random() * 40
                const cx = 120 + Math.cos(angle) * r
                const cy = 70 + Math.sin(angle) * r
                const valid = Math.random() > 0.3
                return (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${valid ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ left: cx, top: cy }}
                  />
                )
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full" />
              <div className="absolute bottom-1 left-2 text-xs text-slate-500">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1" />可行
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full mx-1 ml-3" />碰撞
              </div>
            </div>
          </Panel>

          {/* 预警列表 */}
          <Panel title="预警记录">
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700"
                  onClick={() => setActiveAlert(alert)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{alert.time}</span>
                    <Badge color={riskColors[alert.risk]}>{riskLabels[alert.risk]}</Badge>
                  </div>
                  <div className="text-xs text-white">{alert.type} - {alert.location}</div>
                  <div className="text-xs text-slate-500">
                    {alert.robots.join(' & ')} · 距离 {alert.distance}m
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
