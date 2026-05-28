import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { strategyColors } from "../data/mapData";
import { Route, Play, ArrowRight, Zap, Clock, RotateCw, Battery, Star } from "lucide-react";

export default function PathPlan() {
  const { map, task, routes, bestRoute, rules, params, setTask, planRoutes, updateParams, cargoTypes, priorityLevels } = useAppStore();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [highlightRoute, setHighlightRoute] = useState(null);

  const pointNames = Object.keys(map.points);

  const handlePlan = () => {
    if (!task.start || !task.end || task.start === task.end) return;
    const result = planRoutes();
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
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-slate-100">路径规划</h2>
      <p className="text-slate-400 text-sm">
        三策略 A* 路径计算：时间优先、平稳优先、节能优先，支持货物类型和优先级影响路径代价。
      </p>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">起点</label>
            <select
              value={task.start}
              onChange={(e) => setTask({ ...task, start: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
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
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            >
              {pointNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">货物类型</label>
            <select
              value={task.cargo}
              onChange={(e) => setTask({ ...task, cargo: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            >
              {cargoTypes.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">优先级</label>
            <select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: Number(e.target.value) })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            >
              {priorityLevels.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
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
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            开始规划
          </button>
        </div>
      </div>

      {/* Map with routes */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
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
                className={`cursor-pointer bg-slate-800 border-2 rounded-lg p-4 transition ${
                  isSelected ? "border-blue-500 bg-slate-700/50" : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold" style={{ color }}>
                    {route.name}
                  </div>
                  {isBest && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      最优
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Route className="w-3 h-3" /> 路径长度</span>
                    <span className="font-medium">{route.length} 步</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> 转弯次数</span>
                    <span className="font-medium">{route.turns} 次</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 预计耗时</span>
                    <span className="font-medium">{route.estimatedMinutes} 分钟</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> 电量消耗</span>
                    <span className="font-medium">{route.energy} 单位</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-600 pt-2">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 综合评分</span>
                    <span className="font-bold text-blue-400">{route.score}</span>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 text-xs text-blue-400 font-medium text-center bg-blue-500/10 rounded py-1">
                    已选中高亮
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Path details */}
      {selectedRoute?.reachable && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            路径节点序列 — {selectedRoute.name}
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
                        ? "bg-blue-500/20 text-blue-400 font-bold"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {pointName || `(${cell[0]},${cell[1]})`}
                  </span>
                  {i < selectedRoute.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-500" />}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Active rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">生效规则</h3>
        <div className="flex flex-wrap gap-2">
          {rules.filter((r) => r.enabled).map((rule) => (
            <span key={rule.id} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs border border-slate-600">
              {rule.name} (权重: {rule.weight})
            </span>
          ))}
          {rules.filter((r) => r.enabled).length === 0 && (
            <span className="text-slate-500 text-xs">无生效规则</span>
          )}
        </div>
      </div>
    </div>
  );
}
