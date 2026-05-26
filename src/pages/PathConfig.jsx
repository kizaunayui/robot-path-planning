import { useState } from "react";
import { useAppStore } from "../store/AppStore";

const ALGORITHMS = [
  { id: "time", name: "时间优先", icon: "⏱️", desc: "最短到达时间，适合紧急任务" },
  { id: "smooth", name: "平稳优先", icon: "🛤️", desc: "最小转弯次数，保护货物安全" },
  { id: "energy", name: "能耗优先", icon: "⚡", desc: "最低电量消耗，延长续航" },
];

export default function PathConfig() {
  const { params, updateParams, planRoutes, routes, bestRoute, addLog } = useAppStore();
  const [saved, setSaved] = useState(false);

  const handleApply = () => {
    planRoutes();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    addLog("路径配置已应用并重规划");
  };

  const handleReplan = () => {
    planRoutes();
    addLog("手动触发路径重规划");
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">⚙️ 动态路径规划配置</h2>
      <p className="text-slate-400 text-sm">配置路径规划算法优先级、灵敏度和缓冲参数，实时生效。</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Algorithm selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">算法优先级</h3>
          <div className="grid grid-cols-3 gap-3">
            {ALGORITHMS.map((a) => (
              <div
                key={a.id}
                onClick={() => updateParams({ strategy: a.id })}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  params.strategy === a.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-medium text-sm text-slate-700">{a.name}</span>
                </div>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sensitivity & Buffer */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">路径规划灵敏度</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">灵敏度等级</span>
                <span className="text-slate-700 font-bold">{params.sensitivity}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={params.sensitivity}
                onChange={(e) => updateParams({ sensitivity: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 (迟钝)</span>
                <span>5 (敏感)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">缓冲距离</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">障碍物缓冲</span>
                <span className="text-slate-700 font-bold">{params.buffer}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={0.5}
                value={params.buffer}
                onChange={(e) => updateParams({ buffer: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0 (紧凑)</span>
                <span>3 (宽松)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">手动操作</h3>
          <div className="space-y-2">
            <button
              onClick={handleReplan}
              className="w-full px-4 py-2 rounded text-sm bg-yellow-500 text-white hover:bg-yellow-600"
            >
              🔄 手动重规划
            </button>
            <button
              onClick={handleApply}
              className="w-full px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              {saved ? "✅ 已保存" : "💾 应用算法配置"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">当前策略状态</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">算法</span>
              <span className="text-slate-700 font-medium">
                {ALGORITHMS.find((a) => a.id === params.strategy)?.name || params.strategy}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">灵敏度</span>
              <span className="text-slate-700">{params.sensitivity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">缓冲</span>
              <span className="text-slate-700">{params.buffer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">状态</span>
              <span className="text-green-600 font-medium">生效中</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">最优路径摘要</h3>
          {bestRoute ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">策略</span>
                <span className="text-slate-700">{bestRoute.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">长度</span>
                <span className="text-slate-700">{bestRoute.length} 步</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">转弯</span>
                <span className="text-slate-700">{bestRoute.turns} 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">评分</span>
                <span className="text-blue-600 font-bold">{bestRoute.score}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">请先规划路径</div>
          )}
        </div>
      </div>
    </div>
  );
}
