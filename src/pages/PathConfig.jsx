import { useState } from 'react'
import { Panel, Button, Badge } from '../components/StatusCard'

const ALGORITHMS = [
  { id: 'time', name: '时间优先', icon: '⏱️', desc: '最短到达时间，适合紧急任务' },
  { id: 'smooth', name: '平稳优先', icon: '🛤️', desc: '最小加速度变化，保护货物安全' },
  { id: 'energy', name: '能耗优先', icon: '⚡', desc: '最低电量消耗，延长续航' },
  { id: 'safety', name: '安全优先', icon: '🛡️', desc: '最大安全距离，避免碰撞风险' },
]

const AVOIDANCE_LEVELS = [
  { value: 'high', label: '高', desc: '遇到障碍物立即停车重规划' },
  { value: 'medium', label: '中', desc: '提前减速，必要时绕行' },
  { value: 'low', label: '低', desc: '仅在碰撞风险高时避让' },
]

export default function PathConfig() {
  const [algorithm, setAlgorithm] = useState('time')
  const [sensitivity, setSensitivity] = useState(5)
  const [avoidance, setAvoidance] = useState('medium')
  const [intervention, setIntervention] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentStrategy, setCurrentStrategy] = useState({
    algorithm: '时间优先', sensitivity: 5, avoidance: '中', intervention: false, status: '生效中', updatedAt: '2026-05-26 00:30',
  })

  const handleApply = () => {
    const algo = ALGORITHMS.find(a => a.id === algorithm)
    const avd = AVOIDANCE_LEVELS.find(a => a.value === avoidance)
    setCurrentStrategy({
      algorithm: algo.name, sensitivity, avoidance: avd.label, intervention, status: '生效中', updatedAt: new Date().toLocaleString('zh-CN'),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReplan = () => {
    alert('已触发路径重规划，所有活跃任务将重新计算路径。')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">⚙️ 动态路径规划配置</h2>
      <p className="text-slate-400 text-sm">配置路径规划算法优先级、灵敏度和干预策略，实时生效。</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Algorithm selection */}
        <Panel title="算法优先级">
          <div className="grid grid-cols-2 gap-3">
            {ALGORITHMS.map(a => (
              <div key={a.id} onClick={() => setAlgorithm(a.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  algorithm === a.id ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-medium text-sm text-white">{a.name}</span>
                </div>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Sensitivity & Avoidance */}
        <div className="space-y-4">
          <Panel title="路径规划灵敏度">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">灵敏度等级</span>
                <span className="text-white font-bold">{sensitivity}</span>
              </div>
              <input type="range" min={1} max={10} value={sensitivity} onChange={e => setSensitivity(Number(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 (迟钝)</span><span>10 (敏感)</span>
              </div>
            </div>
          </Panel>

          <Panel title="规避物优先级">
            <div className="flex gap-3">
              {AVOIDANCE_LEVELS.map(a => (
                <button key={a.value} onClick={() => setAvoidance(a.value)}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    avoidance === a.value ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}>
                  <div className="font-medium text-sm text-white">{a.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{a.desc}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Intervention & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="人工干预模式">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">干预控制</div>
              <div className="text-xs text-slate-400">开启后可手动控制机器人路径</div>
            </div>
            <button onClick={() => setIntervention(!intervention)}
              className={`relative w-12 h-6 rounded-full transition-colors ${intervention ? 'bg-blue-600' : 'bg-slate-600'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${intervention ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Panel>

        <Panel title="手动操作">
          <div className="space-y-2">
            <Button variant="warning" onClick={handleReplan} className="w-full">🔄 手动重规划</Button>
            <Button variant="primary" onClick={handleApply} className="w-full">
              {saved ? '✅ 已保存' : '💾 应用算法配置'}
            </Button>
          </div>
        </Panel>

        <Panel title="当前策略状态">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">算法</span>
              <span className="text-white">{currentStrategy.algorithm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">灵敏度</span>
              <span className="text-white">{currentStrategy.sensitivity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">规避</span>
              <span className="text-white">{currentStrategy.avoidance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">干预</span>
              <Badge color={currentStrategy.intervention ? 'green' : 'gray'}>{currentStrategy.intervention ? '已开启' : '已关闭'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">状态</span>
              <Badge color="green">{currentStrategy.status}</Badge>
            </div>
            <div className="text-xs text-slate-500 mt-2">更新于 {currentStrategy.updatedAt}</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
