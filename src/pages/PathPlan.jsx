import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { strategyColors, allPoints, floors } from "../data/mapData";
import { Route, Play, ArrowRight, Zap, Clock, RotateCw, Battery, Star, Building2 } from "lucide-react";

export default function PathPlan() {
  const {
    floorMap, currentFloor, setCurrentFloor, task, routes, bestRoute, rules, params,
    setTask, planRoutes, updateParams, cargoTypes, priorityLevels,
  } = useAppStore();

  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [highlightRoute, setHighlightRoute] = useState(null);

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

  // 找起终点的显示名
  const getPointLabel = (pointId) => {
    const p = allPoints.find((ap) => ap.id === pointId);
    if (p) return `${p.floor} - ${p.name}`;
    return pointId;
  };

  // 按楼层分组显示路径段
  const renderSegmentInfo = (route) => {
    if (!route?.segments || route.segments.length === 0) return null;

    return (
      <div className="space-y-2">
        {route.segments.map((seg, i) => {
          const floorName = floors.find((f) => f.id === seg.floor)?.name || seg.floor;
          // 找起点和终点的科室名
          const startPt = Object.entries(floorMap[seg.floor]?.points || {}).find(
            ([, p]) => p[0] === seg.start[0] && p[1] === seg.start[1]
          );
          const endPt = Object.entries(floorMap[seg.floor]?.points || {}).find(
            ([, p]) => p[0] === seg.end[0] && p[1] === seg.end[1]
          );
          const startName = startPt ? startPt[0] : `(${seg.start[0]},${seg.start[1]})`;
          const endName = endPt ? endPt[0] : `(${seg.end[0]},${seg.end[1]})`;

          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="px-2 py-1 rounded font-bold text-white"
                style={{ backgroundColor: seg.floor === '1F' ? '#3b82f6' : seg.floor === '2F' ? '#10b981' : '#f59e0b' }}
              >
                {seg.floor}
              </span>
              <span className="text-slate-300">
                {startName} <ArrowRight className="w-3 h-3 inline text-slate-500" /> {endName}
              </span>
              <span className="text-slate-500 ml-auto">距离: {seg.length}格</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-slate-100">多楼层路径规划</h2>
      <p className="text-slate-400 text-sm">
        三策略 A* 路径计算：时间优先、平稳优先、节能优先。支持跨楼层路径，自动经电梯换乘。
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
              {allPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.floor} - {p.name}</option>
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
              {allPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.floor} - {p.name}</option>
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
          floorMap={floorMap}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          routes={routes}
          bestRoute={bestRoute}
          highlightRoute={highlightRoute}
          showVisited={true}
          showFloorTabs={true}
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
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> 电梯换乘</span>
                    <span className="font-medium">{route.elevatorCount || 0} 次</span>
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

      {/* Path segment details */}
      {selectedRoute?.reachable && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            路径楼层分段 — {selectedRoute.name}
          </h3>
          {selectedRoute.segments && selectedRoute.segments.length > 1 && (
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-400">
              <span>跨层次数: <span className="text-yellow-400 font-bold">{selectedRoute.elevatorCount || 0}</span></span>
              <span>电梯换乘: <span className="text-yellow-400 font-bold">{selectedRoute.elevatorCount || 0}</span></span>
              <span>总距离: <span className="text-blue-400 font-bold">{selectedRoute.length}格</span> (含跨层代价)</span>
            </div>
          )}
          {renderSegmentInfo(selectedRoute)}

          <div className="mt-4 pt-3 border-t border-slate-700">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">路径节点序列</h4>
            <div className="flex flex-wrap gap-1">
              {selectedRoute.path.map((node, i) => {
                const floor = node.floor || currentFloor;
                const pos = node.pos || node;
                const pointName = Object.entries(floorMap[floor]?.points || {}).find(
                  ([, p]) => p[0] === pos[0] && p[1] === pos[1]
                )?.[0];
                const isFloorChange = i > 0 && node.floor && selectedRoute.path[i - 1].floor !== node.floor;

                return (
                  <span key={i} className="flex items-center gap-1">
                    {isFloorChange && (
                      <span className="text-yellow-500 font-bold text-xs">🛗</span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        pointName
                          ? "bg-blue-500/20 text-blue-400 font-bold"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {pointName ? `${floor}-${pointName}` : `(${pos[0]},${pos[1]})`}
                    </span>
                    {i < selectedRoute.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-500" />}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">生效规则</h3>
        <div className="flex flex-wrap gap-2">
          {rules.filter((r) => r.enabled).map((rule) => (
            <span key={rule.id} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs border border-slate-600">
              {rule.name} (权重: {rule.weight}) {rule.floors ? `[${rule.floors.join(',')}]` : ''}
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
