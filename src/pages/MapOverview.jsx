import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { pointColors, pointIcons } from "../data/mapData";

export default function MapOverview() {
  const { map, robots, routes, bestRoute, rules, validation } = useAppStore();
  const [showRobots, setShowRobots] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const robotDisplay = showRobots ? robots : [];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">🗺️ 地图总览</h2>
      <p className="text-slate-400 text-sm">
        基于网格的地图系统，{map.cols}×{map.rows} 网格，{validation.freeCells} 个自由格，
        {Object.keys(map.points).length} 个科室节点，{map.dynamic.length} 个动态障碍。
      </p>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap text-slate-300">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showRobots} onChange={() => setShowRobots(!showRobots)} className="accent-blue-500" />
          显示机器人 ({robots.length}台)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLabels} onChange={() => setShowLabels(!showLabels)} className="accent-blue-500" />
          显示标签
        </label>
      </div>

      {/* Map */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 shadow-lg">
        <HospitalMap
          mapData={map}
          robots={robotDisplay}
          routes={routes}
          bestRoute={bestRoute}
          showLabels={showLabels}
        />
      </div>

      {/* Points legend */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(map.points).map(([name, pos]) => (
          <div key={name} className="border border-slate-700 rounded p-3 text-sm bg-slate-800" style={{ borderLeftColor: pointColors[name], borderLeftWidth: 4 }}>
            <div className="font-semibold text-slate-200">
              {pointIcons[name]} {name}
            </div>
            <div className="text-slate-400 text-xs">坐标: ({pos[0]}, {pos[1]})</div>
          </div>
        ))}
      </div>

      {/* Robot status */}
      <div>
        <h3 className="font-bold mb-2 text-slate-200">🤖 机器人状态</h3>
        <div className="grid grid-cols-3 gap-2">
          {robots.map((r) => (
            <div key={r.id} className="border border-slate-700 rounded p-2 text-sm bg-slate-800">
              <div className="font-semibold text-slate-200">{r.name}</div>
              <div className="text-slate-400 text-xs">{r.id}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs text-white ${
                    r.status === "running"
                      ? "bg-green-500"
                      : r.status === "idle"
                      ? "bg-orange-500"
                      : r.status === "charging"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                >
                  {r.status === "running" ? "运行中" : r.status === "idle" ? "待机" : r.status === "charging" ? "充电中" : "故障"}
                </span>
                <span className="text-xs text-slate-400">🔋 {r.battery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active rules */}
      <div>
        <h3 className="font-bold mb-2 text-slate-200">🚦 生效中的规则</h3>
        <div className="flex flex-wrap gap-2">
          {rules.filter((r) => r.enabled).map((rule) => (
            <span key={rule.id} className="bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs border border-slate-600">
              {rule.name} (权重: {rule.weight})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
