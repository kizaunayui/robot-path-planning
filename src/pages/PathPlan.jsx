import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Panel, RouteMetricCard } from "../components/ui";
import { strategyColors, allPoints, floors } from "../data/mapData";
import { Play, ArrowRight, Building2 } from "lucide-react";

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

  const renderSegmentInfo = (route) => {
    if (!route?.segments || route.segments.length === 0) return null;
    return (
      <div className="space-y-2">
        {route.segments.map((seg, i) => {
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
                {startName} <ArrowRight className="w-3 h-3 inline text-slate-600" /> {endName}
              </span>
              <span className="text-slate-500 ml-auto">距离: {seg.length}格</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">多楼层路径规划</h1>
        <p className="text-slate-500 text-xs mt-1">
          三策略 A* 路径计算：时间优先、平稳优先、节能优先。支持跨楼层路径，自动经电梯换乘。
        </p>
      </div>

      {/* Controls */}
      <Panel title="规划参数">
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">起点</label>
            <select
              value={task.start}
              onChange={(e) => setTask({ ...task, start: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            >
              {allPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.floor} - {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">终点</label>
            <select
              value={task.end}
              onChange={(e) => setTask({ ...task, end: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            >
              {allPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.floor} - {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">货物类型</label>
            <select
              value={task.cargo}
              onChange={(e) => setTask({ ...task, cargo: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            >
              {cargoTypes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">优先级</label>
            <select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            >
              {priorityLevels.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">灵敏度</label>
            <input
              type="range"
              min={1}
              max={5}
              value={params.sensitivity}
              onChange={(e) => updateParams({ sensitivity: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-center text-slate-500">{params.sensitivity}</div>
          </div>
          <button
            onClick={handlePlan}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500 transition text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            开始规划
          </button>
        </div>
      </Panel>

      {/* Map + Routes side by side */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map */}
        <div className="col-span-8">
          <Panel title="地图视图">
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
          </Panel>
        </div>

        {/* Route comparison */}
        <div className="col-span-4 space-y-3">
          {routes.length > 0 ? (
            routes.map((route) => (
              <RouteMetricCard
                key={route.strategy}
                route={route}
                isSelected={selectedStrategy === route.strategy}
                isBest={bestRoute && route.strategy === bestRoute.strategy}
                onClick={() => handleSelectRoute(route)}
              />
            ))
          ) : (
            <Panel>
              <p className="text-slate-600 text-sm text-center py-8">请先设置起终点并点击"开始规划"</p>
            </Panel>
          )}
        </div>
      </div>

      {/* Path segment details */}
      {selectedRoute?.reachable && (
        <Panel title={`路径楼层分段 — ${selectedRoute.name}`}>
          {selectedRoute.segments && selectedRoute.segments.length > 1 && (
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-400">
              <span>跨层次数: <span className="text-yellow-400 font-bold">{selectedRoute.elevatorCount || 0}</span></span>
              <span>电梯换乘: <span className="text-yellow-400 font-bold">{selectedRoute.elevatorCount || 0}</span></span>
              <span>总距离: <span className="text-blue-400 font-bold">{selectedRoute.length}格</span> (含跨层代价)</span>
            </div>
          )}
          {renderSegmentInfo(selectedRoute)}

          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <h4 className="text-xs font-semibold text-slate-500 mb-2">路径节点序列</h4>
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
                      <Building2 className="w-3 h-3 text-yellow-500" />
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        pointName
                          ? "bg-blue-500/20 text-blue-400 font-bold"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {pointName ? `${floor}-${pointName}` : `(${pos[0]},${pos[1]})`}
                    </span>
                    {i < selectedRoute.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                  </span>
                );
              })}
            </div>
          </div>
        </Panel>
      )}

      {/* Active rules */}
      <Panel title="生效规则">
        <div className="flex flex-wrap gap-2">
          {rules.filter((r) => r.enabled).map((rule) => (
            <span key={rule.id} className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs border border-slate-700/60">
              {rule.name} (权重: {rule.weight}) {rule.floors ? `[${rule.floors.join(',')}]` : ''}
            </span>
          ))}
          {rules.filter((r) => r.enabled).length === 0 && (
            <span className="text-slate-600 text-xs">无生效规则</span>
          )}
        </div>
      </Panel>
    </div>
  );
}
