import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import { areaCostConfig } from "../data/mockData";

export default function CostMap() {
  const { map, rules } = useAppStore();
  const [configs, setConfigs] = useState(areaCostConfig);

  const updatePolicy = (idx, newPolicy) => {
    setConfigs((prev) => {
      const next = [...prev];
      const c = { ...next[idx] };
      c.policy = newPolicy;
      if (newPolicy.includes("禁止")) c.currentCost = 99;
      else if (newPolicy.includes("减速")) c.currentCost = c.baseCost * 1.5;
      else if (newPolicy.includes("限速")) c.currentCost = c.baseCost * 2.0;
      else if (newPolicy.includes("优先")) c.currentCost = c.baseCost * 0.5;
      else c.currentCost = c.baseCost;
      next[idx] = c;
      return next;
    });
  };

  const avgCost = (configs.reduce((a, b) => a + b.currentCost, 0) / configs.length).toFixed(2);
  const maxCost = Math.max(...configs.map((c) => c.currentCost));

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">🌡️ 区域代价</h2>
      <p className="text-slate-400 text-sm">基于语义区域的代价映射与策略配置，支持通行策略调整。</p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">区域数</div>
          <div className="text-2xl font-bold">{configs.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">平均代价</div>
          <div className="text-2xl font-bold">{avgCost}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">最高代价</div>
          <div className="text-2xl font-bold">{maxCost.toFixed(1)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">生效规则</div>
          <div className="text-2xl font-bold">{rules.filter((r) => r.enabled).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">区域策略配置</h3>
          <div className="space-y-2">
            {configs.map((c, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium text-slate-700">{c.area}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.currentCost > 2 ? "bg-red-100 text-red-700" : c.currentCost > 1.2 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    代价 {c.currentCost.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">策略:</span>
                  <select
                    value={c.policy}
                    onChange={(e) => updatePolicy(idx, e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1"
                  >
                    <option>正常通行</option>
                    <option>减速通行</option>
                    <option>限速通行</option>
                    <option>优先通行</option>
                    <option>禁止通行</option>
                    <option>隔离通行</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">基础</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.baseCost / 3) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">当前</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((c.currentCost / 3) * 100, 100)}%`,
                        backgroundColor: c.currentCost > 2 ? "#ef4444" : c.currentCost > 1.2 ? "#eab308" : "#22c55e",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">地图网格</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <div>网格尺寸: {map.cols} × {map.rows}</div>
            <div>墙壁数量: {map.walls.length}</div>
            <div>动态障碍: {map.dynamic.length}</div>
            <div>科室节点: {Object.keys(map.points).length}</div>
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-600 mb-2">生效中的交通规则</h4>
            <div className="space-y-1">
              {rules.filter((r) => r.enabled).map((r) => (
                <div key={r.id} className="text-xs text-slate-600 flex justify-between">
                  <span>{r.name}</span>
                  <span className="font-mono">权重: {r.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
