import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { StatCard, Panel, LogList } from "../components/ui";
import { PencilLine, Route, Repeat, Download, MapPin, Grid3X3, ShieldAlert, Crosshair, Flag, Ruler, RotateCw, Building2 } from "lucide-react";
import { floors } from "../data/mapData";

export default function MapOverview() {
  const {
    floorMap, currentFloor, setCurrentFloor, routes, bestRoute,
    allValidations, logs, replanCount, task, rules,
  } = useAppStore();
  const navigate = useNavigate();

  const totalPoints = Object.values(floorMap).reduce((sum, f) => sum + Object.keys(f.points).length, 0);
  const totalDynamic = Object.values(floorMap).reduce((sum, f) => sum + f.dynamic.length, 0);

  const stats = [
    { label: "楼层数", value: "3 层", icon: Building2, color: "text-blue-400" },
    { label: "总科室数", value: totalPoints, icon: MapPin, color: "text-green-400" },
    { label: "地图尺寸", value: "30×20", icon: Grid3X3, color: "text-slate-300" },
    { label: "动态障碍", value: totalDynamic, icon: ShieldAlert, color: "text-amber-400" },
    { label: "当前起点", value: task.start, icon: Crosshair, color: "text-emerald-400" },
    { label: "当前终点", value: task.end, icon: Flag, color: "text-red-400" },
    { label: "推荐路径长度", value: bestRoute ? `${bestRoute.length} 步` : "未计算", icon: Ruler, color: "text-purple-400" },
    { label: "重规划次数", value: replanCount, icon: RotateCw, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">机器人在线实时路径规划软件</h1>
          <p className="text-slate-500 text-xs mt-1">
            机器人在线实时路径规划 · 多楼层地图 · 动态障碍重规划
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Map Preview */}
      <Panel title="地图预览" actions={
        <span className="text-xs text-slate-500">
          {currentFloor} · {Object.keys(floorMap[currentFloor]?.points || {}).length} 科室节点
        </span>
      }>
        <HospitalMap
          floorMap={floorMap}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          routes={routes}
          bestRoute={bestRoute}
          highlightRoute={bestRoute}
          rules={rules}
          showLabels={true}
          showFloorTabs={true}
        />
      </Panel>

      {/* Floor info cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {floors.map((f) => {
          const fv = allValidations?.[f.id];
          return (
            <div
              key={f.id}
              onClick={() => { setCurrentFloor(f.id); navigate('/map-editor'); }}
              className="cursor-pointer bg-slate-900 border border-slate-700/60 rounded-lg p-4 hover:border-slate-500 transition"
            >
              <div className="text-sm font-bold text-white mb-1">{f.name}</div>
              <div className="text-xs text-slate-500 mb-2">{f.description}</div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-400">{fv?.points || 0} 科室</span>
                <span className="text-amber-400">{fv?.dynamicObstacles || 0} 动态障碍</span>
                <span className={fv?.connected ? "text-green-400" : "text-red-400"}>
                  {fv?.connected ? "✓ 连通" : "✗ 不通"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          onClick={() => navigate("/map-editor")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded text-sm font-medium transition"
        >
          <PencilLine className="w-4 h-4" />
          编辑地图
        </button>
        <button
          onClick={() => navigate("/pathplan")}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded text-sm font-medium transition"
        >
          <Route className="w-4 h-4" />
          跨楼层规划
        </button>
        <button
          onClick={() => navigate("/replan")}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded text-sm font-medium transition"
        >
          <Repeat className="w-4 h-4" />
          模拟障碍
        </button>
        <button
          onClick={() => navigate("/rules")}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded text-sm font-medium transition"
        >
          <Download className="w-4 h-4" />
          导出路径
        </button>
      </div>

      {/* Recent Logs */}
      <Panel title="最近路径规划日志">
        <LogList logs={logs} maxItems={10} emptyText="暂无日志记录" />
      </Panel>
    </div>
  );
}
