import { useState, useMemo } from 'react'
import HospitalMap from '../components/HospitalMap'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { areaCostConfig, hospitalMap, robots } from '../data/mockData'

export default function CostMap() {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [configs, setConfigs] = useState(areaCostConfig)

  const costMap = useMemo(() => {
    const map = {}
    configs.forEach(c => {
      const areaEntry = Object.values(hospitalMap.areaTypes).find(v => v.name === c.area)
      if (areaEntry) map[areaEntry.id] = c.currentCost
    })
    return map
  }, [configs])

  const updatePolicy = (idx, newPolicy) => {
    setConfigs(prev => {
      const next = [...prev]
      const c = { ...next[idx] }
      c.policy = newPolicy
      // 根据策略调整代价
      if (newPolicy.includes('禁止')) c.currentCost = 99
      else if (newPolicy.includes('减速')) c.currentCost = c.baseCost * 1.5
      else if (newPolicy.includes('限速')) c.currentCost = c.baseCost * 2.0
      else if (newPolicy.includes('优先')) c.currentCost = c.baseCost * 0.5
      else c.currentCost = c.baseCost
      next[idx] = c
      return next
    })
  }

  const avgCost = (configs.reduce((a, b) => a + b.currentCost, 0) / configs.length).toFixed(2)
  const maxCost = Math.max(...configs.map(c => c.currentCost))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🌡️ 区域代价</h2>
      <p className="text-slate-400 text-sm">基于语义区域的代价映射与策略配置，支持热力图实时渲染和通行策略调整。</p>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="区域数" value={configs.length} subtitle="语义区域" icon="🗺️" color="blue" />
        <StatusCard title="平均代价" value={avgCost} subtitle="综合系数" icon="📊" color="purple" />
        <StatusCard title="最高代价" value={maxCost.toFixed(1)} subtitle="限制区域" icon="🔴" color="red" />
        <StatusCard title="热力图" value={showHeatmap ? '开启' : '关闭'} subtitle="实时渲染" icon="🌡️" color="green" />
      </div>

      <div className="flex gap-4">
        <div>
          <HospitalMap
            robots={robots.slice(0, 2)}
            showHeatmap={showHeatmap}
            costMap={costMap}
          />
          <div className="mt-2 flex gap-2">
            <Button variant={showHeatmap ? 'primary' : 'outline'} onClick={() => setShowHeatmap(!showHeatmap)}>
              {showHeatmap ? '关闭热力图' : '开启热力图'}
            </Button>
          </div>
        </div>

        <div className="w-80 space-y-3">
          {/* 区域策略配置 */}
          <Panel title="区域策略配置">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {configs.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                      <span className="text-sm text-white font-medium">{c.area}</span>
                    </div>
                    <Badge color={c.currentCost > 2 ? 'red' : c.currentCost > 1.2 ? 'yellow' : 'green'}>
                      代价 {c.currentCost.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">策略:</span>
                    <select
                      value={c.policy}
                      onChange={(e) => updatePolicy(idx, e.target.value)}
                      className="flex-1 text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                    >
                      <option>正常通行</option>
                      <option>减速通行</option>
                      <option>限速通行</option>
                      <option>优先通行</option>
                      <option>禁止通行</option>
                      <option>隔离通行</option>
                      <option>排队等待</option>
                      <option>授权通行</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">基础</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(c.baseCost / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">当前</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((c.currentCost / 3) * 100, 100)}%`,
                          backgroundColor: c.currentCost > 2 ? '#ef4444' : c.currentCost > 1.2 ? '#eab308' : '#22c55e'
                        }}
                      />
                    </div>
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
