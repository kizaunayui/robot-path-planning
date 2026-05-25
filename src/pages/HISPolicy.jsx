import { useState } from 'react'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { hisPolicies, cargoRisks } from '../data/mockData'

export default function HISPolicy() {
  const [policies, setPolicies] = useState(hisPolicies)

  const togglePolicy = (id) => {
    setPolicies(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ))
  }

  const activeCount = policies.filter(p => p.status === 'active').length
  const priorityColors = { critical: 'red', high: 'orange', normal: 'blue' }
  const riskColors = { critical: 'red', high: 'orange', medium: 'yellow', low: 'green' }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">⚙️ HIS动态策略 & 货物风险</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="活跃策略" value={activeCount} subtitle={`共${policies.length}条`} icon="⚙️" color="blue" />
        <StatusCard title="紧急策略" value={policies.filter(p => p.priority === 'critical' && p.status === 'active').length} subtitle="正在执行" icon="🔴" color="red" />
        <StatusCard title="货物类型" value={cargoRisks.length} subtitle="风险评估" icon="📦" color="purple" />
        <StatusCard title="高风险货物" value={cargoRisks.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length} subtitle="需特殊处理" icon="⚠️" color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* HIS策略配置 */}
        <Panel title="HIS策略配置">
          <div className="space-y-2">
            {policies.map(p => (
              <div key={p.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge color={priorityColors[p.priority]}>
                      {p.priority === 'critical' ? '关键' : p.priority === 'high' ? '高' : '普通'}
                    </Badge>
                    <span className={`text-xs ${p.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                      {p.status === 'active' ? '● 激活' : '○ 未激活'}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePolicy(p.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      p.status === 'active' ? 'bg-green-600' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      p.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="text-sm text-white mb-1">{p.trigger}</div>
                <div className="text-xs text-slate-400">→ {p.action}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 货物风险评估 */}
        <Panel title="货物风险评估">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {cargoRisks.map((cargo, idx) => (
              <div key={idx} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cargo.icon}</span>
                    <span className="text-sm text-white font-medium">{cargo.type}</span>
                  </div>
                  <Badge color={riskColors[cargo.riskLevel]}>
                    {cargo.riskLevel === 'critical' ? '极高' : cargo.riskLevel === 'high' ? '高' : cargo.riskLevel === 'medium' ? '中' : '低'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {cargo.constraints.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="text-slate-600">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                {/* 风险条 */}
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: cargo.riskLevel === 'critical' ? '100%' : cargo.riskLevel === 'high' ? '75%' : cargo.riskLevel === 'medium' ? '50%' : '25%',
                      backgroundColor: cargo.riskLevel === 'critical' ? '#ef4444' : cargo.riskLevel === 'high' ? '#f97316' : cargo.riskLevel === 'medium' ? '#eab308' : '#22c55e'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
