import { useState } from 'react';

const RULE_TYPES = [
  { id: 'speed_limit', name: '区域限速', icon: '🏃', color: 'blue' },
  { id: 'one_way', name: '单行通道', icon: '➡️', color: 'green' },
  { id: 'yield', name: '路口让行', icon: '⏸️', color: 'yellow' },
  { id: 'no_entry', name: '禁行区域', icon: '🚫', color: 'red' },
  { id: 'emergency', name: '紧急优先', icon: '🚑', color: 'purple' },
  { id: 'time_control', name: '时间段管控', icon: '⏰', color: 'orange' },
];

export default function TrafficRules() {
  const [rules, setRules] = useState([
    { id: 'R001', type: 'speed_limit', name: '药房限速', area: '药房区', value: '0.5m/s', status: 'active', created: '2024-01-15' },
    { id: 'R002', type: 'no_entry', name: '手术区禁行', area: '手术区', value: 'R1,R3除外', status: 'active', created: '2024-01-16' },
    { id: 'R003', type: 'emergency', name: '急诊优先', area: '急诊区', value: '优先级最高', status: 'active', created: '2024-01-17' },
    { id: 'R004', type: 'one_way', name: '走廊单行', area: '走廊A-B', value: 'A→B方向', status: 'inactive', created: '2024-01-18' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ type: 'speed_limit', name: '', area: '', value: '' });

  const handleAdd = () => {
    if (!newRule.name || !newRule.area) return alert('请填写规则名称和区域');
    setRules(prev => [...prev, {
      id: `R${String(prev.length + 1).padStart(3, '0')}`,
      ...newRule,
      status: 'active',
      created: new Date().toISOString().slice(0, 10),
    }]);
    setShowModal(false);
    setNewRule({ type: 'speed_limit', name: '', area: '', value: '' });
  };

  const toggleStatus = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
  };

  const typeInfo = (type) => RULE_TYPES.find(t => t.id === type) || RULE_TYPES[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">🚦 交通规则管理</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          ➕ 添加规则
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rules.map(rule => {
          const info = typeInfo(rule.type);
          const isActive = rule.status === 'active';
          return (
            <div key={rule.id} className={`bg-white border-l-4 rounded-lg p-4 shadow-sm ${isActive ? `border-l-${info.color}-500` : 'border-l-slate-300 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-bold text-slate-700">{rule.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {isActive ? '已发布' : '已停用'}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div>类型: {info.name}</div>
                <div>区域: {rule.area}</div>
                <div>参数: {rule.value}</div>
                <div className="text-slate-400">创建: {rule.created}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleStatus(rule.id)}
                  className={`px-3 py-1 rounded text-xs ${isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                  {isActive ? '停用' : '发布'}
                </button>
                <button onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                  className="px-3 py-1 rounded text-xs bg-slate-100 text-slate-500 hover:bg-slate-200">删除</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">添加交通规则</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">规则类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {RULE_TYPES.map(t => (
                    <button key={t.id} onClick={() => setNewRule(r => ({ ...r, type: t.id }))}
                      className={`p-2 rounded text-xs text-center border transition ${newRule.type === t.id ? `border-${t.color}-500 bg-${t.color}-50` : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="text-lg">{t.icon}</div>
                      <div>{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">规则名称</label>
                <input value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="如: 药房限速" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">适用区域</label>
                <input value={newRule.area} onChange={e => setNewRule(r => ({ ...r, area: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="如: 药房区" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">参数值</label>
                <input value={newRule.value} onChange={e => setNewRule(r => ({ ...r, value: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="如: 0.5m/s" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-sm bg-slate-100 hover:bg-slate-200">取消</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">确认添加</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
          <div className="text-xs text-slate-500">总规则数</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{rules.filter(r => r.status === 'active').length}</div>
          <div className="text-xs text-slate-500">已发布</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-400">{rules.filter(r => r.status === 'inactive').length}</div>
          <div className="text-xs text-slate-500">已停用</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{rules.filter(r => r.type === 'no_entry').length}</div>
          <div className="text-xs text-slate-500">禁行规则</div>
        </div>
      </div>
    </div>
  );
}
