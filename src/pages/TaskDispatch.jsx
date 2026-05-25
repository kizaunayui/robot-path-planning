import { useState, useMemo } from 'react'
import { Panel, Button, Badge } from '../components/StatusCard'
import { useAppStore } from '../store/AppStore'

const LOCATIONS = ['药房', '住院部3楼', 'ICU', '手术室', '检验科', '消毒中心', '主大厅', '废物处理间']
const CARGO_TYPES = ['药品', '样本', '器械', '废物']
const PRIORITIES = [
  { value: 'critical', label: '紧急', color: 'red' },
  { value: 'high', label: '高', color: 'orange' },
  { value: 'normal', label: '中', color: 'blue' },
  { value: 'low', label: '低', color: 'gray' },
]

// Deterministic path generation based on from/to
function generatePaths(from, to) {
  const seed = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const base = 80 + (seed % 120)
  return [
    { id: 'A', label: 'A 最优路径', color: 'green', distance: base, time: Math.round(base * 0.07), energy: Math.round(base * 0.13), risk: '低', desc: '经主大厅直达，路径最短' },
    { id: 'B', label: 'B 备用路径', color: 'yellow', distance: Math.round(base * 1.55), time: Math.round(base * 0.11), energy: Math.round(base * 0.19), risk: '中', desc: '绕行走廊，避开高峰区域' },
    { id: 'C', label: 'C 应急路径', color: 'red', distance: Math.round(base * 2.1), time: Math.round(base * 0.16), energy: Math.round(base * 0.26), risk: '低', desc: '经电梯间迂回，最安全但最远' },
  ]
}

export default function TaskDispatch() {
  const { robots, activeTasks, dispatchTask, addDispatchLog, dispatchLogs } = useAppStore()
  const [form, setForm] = useState({ from: '', to: '', cargoType: '药品', item: '', priority: 'normal', requirement: '' })
  const [showPaths, setShowPaths] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedRobot, setSelectedRobot] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const mockPaths = useMemo(() => {
    if (form.from && form.to && form.from !== form.to) return generatePaths(form.from, form.to)
    return []
  }, [form.from, form.to])

  const handleCalculate = () => {
    if (!form.from || !form.to) { alert('请选择起点和终点'); return }
    if (form.from === form.to) { alert('起点和终点不能相同'); return }
    setShowPaths(true)
    setSelectedPath(null)
    setSelectedRobot('')
  }

  const handleDispatch = () => {
    if (!selectedPath || !selectedRobot) { alert('请选择路径和机器人'); return }
    const pathInfo = mockPaths.find(p => p.id === selectedPath)
    const robotInfo = robots.find(r => r.id === selectedRobot)
    const newTask = {
      id: `AT${String(activeTasks.length + 1).padStart(3, '0')}`,
      from: form.from, to: form.to, cargo: `${form.cargoType}-${form.item || '未指定'}`,
      path: selectedPath, robot: selectedRobot, status: '已派发', progress: 0,
    }
    dispatchTask(newTask)
    addDispatchLog(`任务 ${newTask.id} 已派发: ${form.from}→${form.to}, 路径${selectedPath}, 机器人${selectedRobot}(${robotInfo?.name || ''})`)
    setShowPaths(false); setSelectedPath(null); setSelectedRobot(''); setForm({ from: '', to: '', cargoType: '药品', item: '', priority: 'normal', requirement: '' })
    alert(`任务已派发给 ${robotInfo?.name || selectedRobot}`)
  }

  const availableRobots = robots.filter(r => r.status !== 'charging' && r.status !== 'error')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📦 任务即时派发</h2>
      <p className="text-slate-400 text-sm">创建运输任务，系统计算并推荐三条路径供选择，派发后进入活跃队列。</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <Panel title="创建运输任务">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">起点</label>
                <select value={form.from} onChange={e => update('from', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                  <option value="">选择起点</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">终点</label>
                <select value={form.to} onChange={e => update('to', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                  <option value="">选择终点</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">货物类型</label>
                <select value={form.cargoType} onChange={e => update('cargoType', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                  {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">具体物品</label>
                <input value={form.item} onChange={e => update('item', e.target.value)} placeholder="如：抗生素" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">优先级</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} onClick={() => update('priority', p.value)}
                    className={`px-3 py-1 rounded text-xs font-medium ${form.priority === p.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">特殊要求</label>
              <input value={form.requirement} onChange={e => update('requirement', e.target.value)} placeholder="如：需冷链运输" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500" />
            </div>
            <Button variant="primary" onClick={handleCalculate} className="w-full">🔍 计算并推荐路径</Button>
          </div>
        </Panel>

        {/* Path results */}
        <Panel title="路径推荐结果">
          {!showPaths ? (
            <div className="text-center text-slate-500 py-12">请先填写任务信息并点击"计算并推荐路径"</div>
          ) : (
            <div className="space-y-3">
              {mockPaths.map(p => (
                <div key={p.id} onClick={() => setSelectedPath(p.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPath === p.id
                      ? p.color === 'green' ? 'border-green-500 bg-green-900/20' : p.color === 'yellow' ? 'border-yellow-500 bg-yellow-900/20' : 'border-red-500 bg-red-900/20'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{p.label}</span>
                    <Badge color={p.color === 'green' ? 'green' : p.color === 'yellow' ? 'yellow' : 'red'}>风险{p.risk}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-400">
                    <div>距离: <span className="text-white">{p.distance}m</span></div>
                    <div>时间: <span className="text-white">{p.time}min</span></div>
                    <div>电量: <span className="text-white">{p.energy}%</span></div>
                    <div className="col-span-1">{p.desc}</div>
                  </div>
                </div>
              ))}

              {selectedPath && (
                <div className="mt-3">
                  <label className="block text-xs text-slate-400 mb-1">选择机器人</label>
                  <select value={selectedRobot} onChange={e => setSelectedRobot(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                    <option value="">选择机器人</option>
                    {availableRobots.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.id}) - 🔋{r.battery}%</option>
                    ))}
                  </select>
                  <Button variant="success" onClick={handleDispatch} className="w-full mt-3">🚀 派发任务</Button>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* Active tasks */}
      <Panel title={`活跃任务队列 (${activeTasks.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="p-2 text-left text-slate-300">任务ID</th>
                <th className="p-2 text-left text-slate-300">起点</th>
                <th className="p-2 text-left text-slate-300">终点</th>
                <th className="p-2 text-left text-slate-300">货物</th>
                <th className="p-2 text-left text-slate-300">路径</th>
                <th className="p-2 text-left text-slate-300">机器人</th>
                <th className="p-2 text-left text-slate-300">状态</th>
                <th className="p-2 text-left text-slate-300">进度</th>
              </tr>
            </thead>
            <tbody>
              {activeTasks.map(t => (
                <tr key={t.id} className="border-t border-slate-700">
                  <td className="p-2 text-white">{t.id}</td>
                  <td className="p-2">{t.from}</td>
                  <td className="p-2">{t.to}</td>
                  <td className="p-2">{t.cargo}</td>
                  <td className="p-2"><Badge color={t.path === 'A' ? 'green' : t.path === 'B' ? 'yellow' : 'red'}>{t.path}</Badge></td>
                  <td className="p-2">{t.robot}</td>
                  <td className="p-2"><Badge color={t.status === '执行中' ? 'blue' : t.status === '已派发' ? 'yellow' : 'green'}>{t.status}</Badge></td>
                  <td className="p-2">
                    <div className="w-20 bg-slate-700 rounded h-2">
                      <div className="bg-blue-500 h-2 rounded transition-all" style={{ width: `${t.progress}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Dispatch logs */}
      {dispatchLogs.length > 0 && (
        <Panel title={`派发日志 (${dispatchLogs.length})`}>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {dispatchLogs.map((l, i) => (
              <div key={i} className="text-xs flex gap-2">
                <span className="text-slate-500 font-mono w-16 shrink-0">[{l.time}]</span>
                <span className="text-slate-300">{l.msg}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
