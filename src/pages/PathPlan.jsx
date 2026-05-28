import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { strategyColors, strategyNames } from "../data/mapData";

export default function PathPlan() {
  const { map, task, routes, bestRoute, rules, params, setTask, planRoutes, updateParams, addLog } = useAppStore();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [highlightRoute, setHighlightRoute] = useState(null);

  const pointNames = Object.keys(map.points);

  const handlePlan = () => {
    if (!task.start || !task.end) return;
    if (task.start === task.end) return;
    const result = planRoutes();
    // Auto-select best route
    if (result.bestRoute) {
      setSelectedStrategy(result.bestRoute.strategy);
      setHighlightRoute(result.bestRoute);
    }
  };

  const handleSelectRoute = (route) => {
    setSelectedStrategy(route.strategy);
    setHighlightRoute(route);
  };

  const selectedRoute = routes.find((r) => r.strategy === selectedStrategy) || bestRoute;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">📐 路径规划</h2>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 shadow-sm">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">起点</label>
            <select
              value={task.start}
              onChange={(e) => setTask({ ...task, start: e.target.value })}
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
            >
              {pointNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">终点</label>
            <select
              value={task.end}
              onChange={(e) => setTask({ ...task, end: e.target.value })}
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
            >
              {pointNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">策略</label>
            <select
              value={params.strategy}
              onChange={(e) => updateParams({ strategy: e.target.value })}
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="time">时间优先</option>
              <option value="smooth">平稳优先</option>
              <option value="energy">节能优先</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">灵敏度</label>
            <input
              type="range"
              min={1}
              max={5}
              value={params.sensitivity}
              onChange={(e) => updateParams({ sensitivity: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-center text-slate-400">{params.sensitivity}</div>
          </div>
          <button
            onClick={handlePlan}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
          >
            🚀 开始规划
          </button>
        </div>
      </div>

      {/* Map with routes */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
        <HospitalMap
          mapData={map}
          routes={routes}
          bestRoute={bestRoute}
          highlightRoute={highlightRoute}
          showVisited={true}
        />
      </div>

      {/* Three route cards */}
      {routes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {routes.map((route) => {
            const color = strategyColors[route.strategy];
            const isSelected = selectedStrategy === route.strategy;
            const isBest = bestRoute && route.strategy === bestRoute.strategy;
            return (
              <div
                key={route.strategy}
                onClick={() => handleSelectRoute(route)}
                className={`cursor-pointer bg-slate-800 border-2 rounded-lg p-4 shadow-sm transition ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold" style={{ color }}>
                    {route.name}
                  </div>
                  {isBest && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">最优</span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>可达性</span>
                    <span className={route.reachable ? "text-green-600" : "text-red-600"}>
                      {route.reachable ? "✅ 可达" : "❌ 不可达"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>路径长度</span>
                    <span className="font-medium">{route.length} 步</span>
                  </div>
                  <div className="flex justify-between">
                    <span>转弯次数</span>
                    <span className="font-medium">{route.turns} 次</span>
                  </div>
                  <div className="flex justify-between">
                    <span>预计时间</span>
                    <span className="font-medium">{route.estimatedMinutes} 分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span>能耗</span>
                    <span className="font-medium">{route.energy} 单位</span>
                  </div>
                  <div className="flex justify-between">
                    <span>综合评分</span>
                    <span className="font-bold text-blue-600">{route.score}</span>
                  </div>
                </div>
                {isSelected && <div className="mt-2 text-xs text-blue-600 font-medium text-center">✅ 已选中高亮</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Path details */}
      {selectedRoute?.reachable && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-2">
            📍 路径节点序列 — {selectedRoute.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {selectedRoute.path.map((cell, i) => {
              const pointName = Object.entries(map.points).find(
                ([, p]) => p[0] === cell[0] && p[1] === cell[1]
              )?.[0];
              return (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      pointName
                        ? "bg-blue-100 text-blue-700 font-bold"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {pointName || `(${cell[0]},${cell[1]})`}
                  </span>
                  {i < selectedRoute.path.length - 1 && <span className="text-slate-400">→</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Active rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-2">🚦 生效规则</h3>
        <div className="flex flex-wrap gap-2">
          {rules.filter((r) => r.enabled).map((rule) => (
            <span key={rule.id} className="bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs">
              {rule.name} (权重: {rule.weight})
            </span>
          ))}
          {rules.filter((r) => r.enabled).length === 0 && (
            <span className="text-slate-400 text-xs">无生效规则</span>
          )}
        </div>
      </div>
    </div>
  );
}
