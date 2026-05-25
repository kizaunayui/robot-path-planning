import { useState, useEffect } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { diagnosticLogs, uwbStations, robots } from '../data/mockData'

export default function Diagnostics() {
  const [logs, setLogs] = useState(diagnosticLogs)
  const [selectedRobot, setSelectedRobot] = useState(null)
  const [confidence, setConfidence] = useState(92)
  const [movingRobots, setMovingRobots] = useState(robots.map(r => ({ ...r })))

  // 模拟机器人微动
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingRobots(prev => prev.map(r => ({
        ...r,
        x: r.x + (Math.random() - 0.5) * 2,
        y: r.y + (Math.random() - 0.5) * 2,
      })))
      setConfidence(prev => Math.max(70, Math.min(99, prev + (Math.random() - 0.5) * 3)))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 模拟新日志
  useEffect(() => {
    const types = ['battery', 'path', 'sensor', 'navigation', 'collision', 'motor', 'communication']
    const levels = ['info', 'warning', 'error']
    const messages = [
      '定位精度正常', '路径偏差已修正', '传感器数据正常', '通信延迟<10ms',
      '电机温度偏高', '陀螺仪校准完成', '激光雷达信号稳定'
    ]
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        robot: `R${Math.floor(Math.random() * 6) + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      }
      setLogs(prev => [newLog, ...prev.slice(0, 19)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const levelColors = { info: 'blue', warning: 'yellow', error: 'red', critical: 'red' }
  const levelLabels = { info: '信息', warning: '警告', error: '错误', critical: '严重' }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📍 定位与诊断</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="UWB基站" value={uwbStations.length} subtitle="定位基础设施" icon="📡" color="blue" />
        <StatusCard title="定位置信度" value={`${confidence.toFixed(0)}%`} subtitle="当前精度" icon="🎯" color="green" />
        <StatusCard title="错误日志" value={logs.filter(l => l.level === 'error').length} subtitle="需处理" icon="❌" color="red" />
        <StatusCard title="警告日志" value={logs.filter(l => l.level === 'warning').length} subtitle="需关注" icon="⚠️" color="yellow" />
      </div>

      <div className="flex gap-4">
        {/* 地图 with UWB */}
        <div>
          <HospitalMap
            robots={movingRobots}
            showUWB={true}
            uwbStations={uwbStations}
          />
          {/* 定位置信度指示器 */}
          <div className="mt-2 p-2 bg-slate-800 rounded-lg flex items-center gap-3">
            <span className="text-xs text-slate-400">定位置信度:</span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                  backgroundColor: confidence > 85 ? '#22c55e' : confidence > 70 ? '#eab308' : '#ef4444'
                }}
              />
            </div>
            <span className="text-sm text-white font-mono">{confidence.toFixed(1)}%</span>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* UWB三角定位 */}
          <Panel title="UWB三角定位">
            <div className="h-40 bg-slate-900 rounded-lg relative">
              {/* 模拟三角定位 */}
              <svg viewBox="0 0 300 160" className="w-full h-full">
                {/* 基站位置 */}
                <circle cx="50" cy="30" r="6" fill="#22c55e" />
                <text x="50" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB1</text>
                <circle cx="150" cy="20" r="6" fill="#22c55e" />
                <text x="150" y="10" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB2</text>
                <circle cx="250" cy="30" r="6" fill="#22c55e" />
                <text x="250" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB3</text>
                <circle cx="50" cy="130" r="6" fill="#22c55e" />
                <text x="50" y="148" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB4</text>
                <circle cx="150" cy="140" r="6" fill="#22c55e" />
                <text x="150" y="155" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB5</text>
                <circle cx="250" cy="130" r="6" fill="#22c55e" />
                <text x="250" y="148" textAnchor="middle" fill="#94a3b8" fontSize="8">UWB6</text>
                {/* 距离线 */}
                <line x1="50" y1="30" x2="155" y2="85" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                <line x1="150" y1="20" x2="155" y2="85" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                <line x1="250" y1="30" x2="155" y2="85" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                {/* 估计位置 */}
                <circle cx="155" cy="85" r="8" fill="#3b82f6" opacity="0.8" />
                <circle cx="155" cy="85" r="15" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
                <text x="170" y="88" fill="#60a5fa" fontSize="9">估计位置</text>
              </svg>
            </div>
          </Panel>

          {/* 诊断日志 */}
          <Panel title="诊断日志">
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-slate-700 ${
                    log.level === 'error' ? 'bg-red-900/20' :
                    log.level === 'warning' ? 'bg-yellow-900/20' : 'bg-slate-800'
                  }`}
                  onClick={() => setSelectedRobot(log.robot)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">{log.time}</span>
                      <Badge color={levelColors[log.level]}>{levelLabels[log.level]}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{log.robot}</span>
                  </div>
                  <div className="text-xs text-white">{log.message}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
