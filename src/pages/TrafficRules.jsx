import { useState } from 'react'
import { Panel, Button, Badge } from '../components/StatusCard'

const RULE_TYPES = [
  { value: 'speed_limit', label: '区域限速' },
  { value: 'one_way', label: '单行通道' },
  { value: 'yield', label: '路口让行' },
  { value: 'priority', label: '特殊任务优先通道' },
  { value: 'time_rule', label: '时间段规则' },
  { value: 'restricted', label: '管控区域' },
]

const STATUS_LABELS = {
  draft: { label: '草稿', color: 'gray' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
}

const INITIAL_RULES = [
  { id: 'TR001', name: 'ICU走廊限速', type: 'speed_limit', area: 'ICU走廊', detail: '限速0.5m/s', status: 'active', createdAt: '2026-05-20' },
  { id: 'TR002', name: '手术区单行道', type: 'one_way', area: '手术区走廊', detail: '仅允许从北向南通行', status: 'active', createdAt: '2026-05-20' },
  { id: 'TR003', name: '大厅北门让行', type: 'yield', area: '主大厅北门', detail: '右侧来车优先', status: 'active', createdAt: '2026-05-21' },
  { id: 'TR004', name: '急救任务优先通道', type: 'priority', area: '主大厅→ICU', detail: '急救任务可占用对向车道', status: 'draft', createdAt: '2026-05-22' },
  { id: 'TR005', name: '夜间药房管控', type: 'time_rule', area: '药房入口', detail: '22:00-06:00 禁止通行', status: 'inactive', createdAt: '2026-05-23' },
  { id: 'TR006', name: '污染区准入管控', type: 'restricted', area: '污染区走廊', detail: '需授权码+防护等级≥2', status: 'active', createdAt: '2026-05-24' },
]

export default function TrafficRules() {
  const [rules, setRules] = useState(INITIAL_RULES)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'speed_limit', area: '', detail: '' })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setEditId(null); setForm({ name: '', type: 'speed_limit', area: '', detail: '' }); setShowModal(true)
  }

  const openEdit = (rule) => {
    setEditId(rule.id); setForm({ name: rule.name, type: rule.type, area: rule.area, detail: rule.detail }); setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.area || !form.detail) { alert('请填写完整信息'); return }
    if (editId) {
      setRules(prev => prev.map(r => r.id === editId ? { ...r, ...form } : r))
    } else {
      const newRule = {
        id: `TR${String(rules.length + 1).padStart(3, '0')}`,
        ...form, status: 'draft', createdAt: new Date().toISOString().slice(0, 10),
      }
      setRules(prev => [...prev, newRule])
    }
    setShowModal(false)
  }

  const toggleStatus = (id) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r
      if (r.status === 'draft') return { ...r, status: 'active' }
      if (r.status === 'active') return { ...r, status: 'inactive' }
      return { ...r, status: 'draft' }
    }))
  }

  const typeLabel = (type) => RULE_TYPES.find(t => t.value === type)?.label || type

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🚦 交通规则管理</h2>
          <p className="text-slate-400 text-sm">管理医院内机器人交通规则，支持区域限速、单行道、让行等规则配置。</p>
        </div>
        <Button variant="primary" onClick={openAdd}>➕ 添加规则集</Button>
      </div>

      <Panel title={`规则集列表 (${rules.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="p-2 text-left text-slate-300">规则ID</th>
                <th className="p-2 text-left text-slate-300">名称</th>
                <th className="p-2 text-left text-slate-300">类型</th>
                <th className="p-2 text-left text-slate-300">区域</th>
                <th className="p-2 text-left text-slate-300">规则详情</th>
                <th className="p-2 text-left text-slate-300">状态</th>
                <th className="p-2 text-left text-slate-300">创建日期</th>
                <th className="p-2 text-left text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-t border-slate-700">
                  <td className="p-2 text-white">{r.id}</td>
                  <td className="p-2 text-white font-medium">{r.name}</td>
                  <td className="p-2"><Badge color="blue">{typeLabel(r.type)}</Badge></td>
                  <td className="p-2">{r.area}</td>
                  <td className="p-2 text-slate-300">{r.detail}</td>
                  <td className="p-2">
                    <Badge color={STATUS_LABELS[r.status].color}>{STATUS_LABELS[r.status].label}</Badge>
                  </td>
                  <td className="p-2 text-slate-400">{r.createdAt}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="xs" onClick={() => openEdit(r)}>编辑</Button>
                      <Button variant={r.status === 'active' ? 'danger' : 'success'} size="xs" onClick={() => toggleStatus(r.id)}>
                        {r.status === 'draft' ? '发布' : r.status === 'active' ? '停用' : '重置'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        <Panel className="text-center">
          <div className="text-2xl font-bold text-gray-400">{rules.filter(r => r.status === 'draft').length}</div>
          <div className="text-xs text-slate-400">草稿</div>
        </Panel>
        <Panel className="text-center">
          <div className="text-2xl font-bold text-green-400">{rules.filter(r => r.status === 'active').length}</div>
          <div className="text-xs text-slate-400">已发布</div>
        </Panel>
        <Panel className="text-center">
          <div className="text-2xl font-bold text-red-400">{rules.filter(r => r.status === 'inactive').length}</div>
          <div className="text-xs text-slate-400">已停用</div>
        </Panel>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-[480px] border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-4">{editId ? '编辑规则' : '添加规则集'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">规则名称</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white" placeholder="如：ICU限速规则" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">规则类型</label>
                <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                  {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">适用区域</label>
                <input value={form.area} onChange={e => update('area', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white" placeholder="如：ICU走廊" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">规则详情</label>
                <input value={form.detail} onChange={e => update('detail', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white" placeholder="如：限速0.5m/s" />
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
              <Button variant="primary" onClick={handleSave}>{editId ? '保存修改' : '创建规则'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
