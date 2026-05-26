import { useState } from "react";
import { useAppStore } from "../store/AppStore";

const RULE_TYPE_INFO = {
  priority_zone: { icon: "🏥", name: "优先通行区", color: "green" },
  avoid_zone: { icon: "🚫", name: "避让区域", color: "red" },
  smooth: { icon: "🛤️", name: "平稳优先", color: "yellow" },
  energy: { icon: "⚡", name: "节能模式", color: "blue" },
};

export default function TrafficRules() {
  const { rules, params, updateRules, updateParams, planRoutes, routes, addLog } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ id: "", name: "", type: "priority_zone", weight: 1.5, enabled: true });

  const handleToggle = (id) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    updateRules(updated);
  };

  const handleDelete = (id) => {
    const updated = rules.filter((r) => r.id !== id);
    updateRules(updated);
  };

  const handleAdd = () => {
    if (!newRule.name) return;
    const rule = {
      ...newRule,
      id: `R${Date.now()}`,
    };
    updateRules([...rules, rule]);
    setShowModal(false);
    setNewRule({ id: "", name: "", type: "priority_zone", weight: 1.5, enabled: true });
  };

  const handleWeightChange = (id, weight) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, weight: Number(weight) } : r));
    updateRules(updated);
  };

  const handleReplan = () => {
    const result = planRoutes();
    addLog("规则变更已触发路径重规划");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">🚦 交通规则管理</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReplan}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            🔄 重规划路径
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            ➕ 添加规则
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className="grid grid-cols-2 gap-4">
        {rules.map((rule) => {
          const info = RULE_TYPE_INFO[rule.type] || RULE_TYPE_INFO.priority_zone;
          const isActive = rule.enabled;
          return (
            <div
              key={rule.id}
              className={`bg-white border-l-4 rounded-lg p-4 shadow-sm transition ${
                isActive ? "border-l-blue-500" : "border-l-slate-300 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-bold text-slate-700">{rule.name}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isActive ? "已启用" : "已停用"}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div>类型: {info.name}</div>
                <div className="flex items-center gap-2">
                  <span>权重:</span>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={rule.weight}
                    onChange={(e) => handleWeightChange(rule.id, e.target.value)}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="font-mono w-8 text-right">{rule.weight}</span>
                </div>
                <div className="text-slate-400 text-xs">
                  {rule.type === "avoid_zone" && "影响区域: [18-22, 7-11] 污染区"}
                  {rule.type === "priority_zone" && "影响区域: [23-27, 2-6] 手术区"}
                  {rule.type === "smooth" && "全局平稳策略折扣"}
                  {rule.type === "energy" && "全局节能策略折扣"}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleToggle(rule.id)}
                  className={`px-3 py-1 rounded text-xs ${
                    isActive
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {isActive ? "停用" : "启用"}
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-3 py-1 rounded text-xs bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Path params */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">⚙️ 路径参数</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">策略</label>
            <select
              value={params.strategy}
              onChange={(e) => updateParams({ strategy: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="time">时间优先</option>
              <option value="smooth">平稳优先</option>
              <option value="energy">节能优先</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">灵敏度 ({params.sensitivity})</label>
            <input
              type="range"
              min={1}
              max={5}
              value={params.sensitivity}
              onChange={(e) => updateParams({ sensitivity: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">缓冲距离 ({params.buffer})</label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.5}
              value={params.buffer}
              onChange={(e) => updateParams({ buffer: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
          <div className="text-xs text-slate-500">总规则数</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{rules.filter((r) => r.enabled).length}</div>
          <div className="text-xs text-slate-500">已启用</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-400">{rules.filter((r) => !r.enabled).length}</div>
          <div className="text-xs text-slate-500">已停用</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{routes.filter((r) => r.reachable).length}</div>
          <div className="text-xs text-slate-500">可达路径</div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">添加交通规则</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">规则类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(RULE_TYPE_INFO).map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => setNewRule((r) => ({ ...r, type }))}
                      className={`p-2 rounded text-xs text-center border transition ${
                        newRule.type === type ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-lg">{info.icon}</div>
                      <div>{info.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">规则名称</label>
                <input
                  value={newRule.name}
                  onChange={(e) => setNewRule((r) => ({ ...r, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="如: ICU限速"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">权重 ({newRule.weight})</label>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={newRule.weight}
                  onChange={(e) => setNewRule((r) => ({ ...r, weight: Number(e.target.value) }))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-sm bg-slate-100 hover:bg-slate-200">
                取消
              </button>
              <button onClick={handleAdd} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
