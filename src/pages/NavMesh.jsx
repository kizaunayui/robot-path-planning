import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";

export default function NavMesh() {
  const { map, robots, validation } = useAppStore();
  const [showGrid, setShowGrid] = useState(true);

  // Simulated nav mesh stats based on map
  const triangleCount = Math.floor((map.cols * map.rows) / 8);
  const coverage = ((validation.freeCells / (map.cols * map.rows)) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">🔺 导航网格</h2>
      <p className="text-slate-400 text-sm">基于网格地图的导航分析，显示可通行区域和障碍分布。</p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">网格单元</div>
          <div className="text-2xl font-bold">{map.cols * map.rows}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">可通行</div>
          <div className="text-2xl font-bold">{validation.freeCells}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">障碍</div>
          <div className="text-2xl font-bold">{validation.wallCells + validation.dynamicObstacles}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">覆盖率</div>
          <div className="text-2xl font-bold">{coverage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200">地图网格</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
              显示网格线
            </label>
          </div>
          <HospitalMap mapData={map} robots={robots} showGrid={showGrid} />
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-3">网格统计</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">网格尺寸</span>
              <span className="text-slate-200 font-mono">{map.cols} × {map.rows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">总单元数</span>
              <span className="text-slate-200 font-mono">{map.cols * map.rows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">墙壁数量</span>
              <span className="text-slate-200 font-mono">{map.walls.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">动态障碍</span>
              <span className="text-slate-200 font-mono">{map.dynamic.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">科室节点</span>
              <span className="text-slate-200 font-mono">{Object.keys(map.points).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">可通行率</span>
              <span className="text-green-600 font-mono">{coverage}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700">
            <h4 className="text-xs font-bold text-slate-300 mb-2">机器人分布</h4>
            <div className="space-y-1">
              {robots.map((r) => (
                <div key={r.id} className="flex justify-between text-xs">
                  <span className="text-slate-300">{r.name}</span>
                  <span className="text-slate-400">({r.pos[0]}, {r.pos[1]})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
