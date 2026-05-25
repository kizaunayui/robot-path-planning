import { useState, useEffect } from 'react'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { robots, chargingStations } from '../data/mockData'

export default function Charging() {
  const [robotList, setRobotList] = useState(robots)
  const [stations, setStations] = useState(chargingStations)

  // 模拟电量变化
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotList(prev => prev.map(r => {
        if (r.status === 'charging') {
          return { ...r, battery: Math.min(100, r.battery + 1) }
        }
        return { ...r, battery: Math.max(0, r.battery - (Math.random() > 0.7 ? 1 : 0)) }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleCharge = (robotId) => {
    setRobotList(prev => prev.map(r =>
      r.id === robotId ? { ...r, status: 'charging' } : r
    ))
    // 占用一个充电桩
    const availableStation = stations.find(s => s.status === 'available')
    if (availableStation) {
      setStations(prev => prev.map(s =>
        s.id === availableStation.id ? { ...s, status: 'occupied', robotId } : s
      ))
    }
  }

  const avgBattery = (robotList.reduce((a, b) => a + b.battery, 0) / robotList.length).toFixed(0)
  const lowBatteryCount = robotList.filter(r => r.battery < 30).length
  const availableStations = stations.filter(s => s.status === 'available').length

  const getWorkIndex = (battery, status) => {
    if (status === 'charging') return '充电中'
    if (battery > 70) return '优'
    if (battery > 40) return '良'
    if (battery > 20) return '差'
    return '危险'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🔋 充电调度</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="平均电量" value={`${avgBattery}%`} subtitle="全机平均" icon="🔋" color="blue" />
        <StatusCard title="低电量" value={lowBatteryCount} subtitle="需充电" icon="🪫" color="red" />
        <StatusCard title="可用充电桩" value={availableStations} subtitle={`共${stations.length}个`} icon="🔌" color="green" />
        <StatusCard title="充电中" value={robotList.filter(r => r.status === 'charging').length} subtitle="正在充电" icon="⚡" color="yellow" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 机器人电量仪表盘 */}
        <Panel title="机器人电量仪表盘">
          <div className="grid grid-cols-2 gap-3">
            {robotList.map(r => (
              <div key={r.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-sm text-white font-medium">{r.id}</span>
                </div>
                {/* 电量仪表 */}
                <div className="flex items-center justify-center mb-2">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={r.battery > 50 ? '#22c55e' : r.battery > 20 ? '#eab308' : '#ef4444'}
                        strokeWidth="8"
                        strokeDasharray={`${r.battery * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{r.battery}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge color={
                    getWorkIndex(r.battery, r.status) === '优' ? 'green' :
                    getWorkIndex(r.battery, r.status) === '良' ? 'blue' :
                    getWorkIndex(r.battery, r.status) === '充电中' ? 'yellow' :
                    getWorkIndex(r.battery, r.status) === '差' ? 'orange' : 'red'
                  }>
                    可工作: {getWorkIndex(r.battery, r.status)}
                  </Badge>
                </div>
                {r.status !== 'charging' && r.battery < 50 && (
                  <Button
                    variant="warning"
                    size="xs"
                    onClick={() => handleCharge(r.id)}
                    className="w-full mt-2"
                  >
                    🔌 调度充电
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* 充电桩状态 */}
        <div className="space-y-3">
          <Panel title="充电桩状态">
            <div className="space-y-2">
              {stations.map(s => (
                <div key={s.id} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔌</span>
                      <div>
                        <div className="text-sm text-white font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.location}</div>
                      </div>
                    </div>
                    <Badge color={s.status === 'available' ? 'green' : s.status === 'occupied' ? 'yellow' : 'red'}>
                      {s.status === 'available' ? '空闲' : s.status === 'occupied' ? '占用' : '故障'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>功率: {s.power}W</span>
                    {s.robotId && <span>机器人: {s.robotId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 充电建议 */}
          <Panel title="智能充电建议">
            <div className="space-y-2">
              {robotList
                .filter(r => r.battery < 50 && r.status !== 'charging')
                .sort((a, b) => a.battery - b.battery)
                .map(r => (
                  <div key={r.id} className="p-2 bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-white">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">{r.battery}%</span>
                      <Button variant="danger" size="xs" onClick={() => handleCharge(r.id)}>
                        立即充电
                      </Button>
                    </div>
                  </div>
                ))}
              {robotList.filter(r => r.battery < 50 && r.status !== 'charging').length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm">
                  ✅ 所有机器人电量充足
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
