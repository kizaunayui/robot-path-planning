import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { PencilLine, Route, Repeat, Download, MapPin, Grid3X3, ShieldAlert, Crosshair, Flag, Ruler, RotateCw } from "lucide-react";

export default function MapOverview() {
  const { map, routes, bestRoute, validation, logs, replanCount } = useAppStore();
  const navigate = useNavigate();

  const startName = "药房";
  const endName = "消毒供应室";

  const stats = [
    { label: "地图尺寸", value: `${map.cols}×${map.rows}`, icon: Grid3X3, color: "text-blue-400" },
    { label: "可通行网格", value: validation.freeCells, icon: MapPin, color: "text-green-400" },
    { label: "静态障碍", value: validation.wallCells, icon: ShieldAlert, color: "text-slate-400" },
    { label: "动态障碍", value: map.dynamic.length, icon: ShieldAlert, color: "text-amber-400" },
    { label: "当前起点", value: startName, icon: Crosshair, color: "text-emerald-400" },
    { label: "当前终点", value: endName, icon: Flag, color: "text-red-400" },
    { label: "推荐路径长度", value: bestRoute ? `${bestRoute.length} 步` : "未计算", icon: Ruler, color: "text-purple-400" },
    { label: "重规划次数", value: replanCount, icon: RotateCw, color: "text-cyan-400" },
  ];

  const recentLogs = logs.slice(0, 10);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">路径规划总览</h2>
          <p className="text-slate-400 text-sm mt-1">
            医院院内物流场景 · 在线路径规划控制台
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Map Preview */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">地图预览</h3>
          <span className="text-xs text-slate-400">
            {map.cols}×{map.rows} 网格 · {Object.keys(map.points).length} 科室节点
          </span>
        </div>
        <HospitalMap
          mapData={map}
          routes={routes}
          bestRoute={bestRoute}
          highlightRoute={bestRoute}
          showLabels={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => navigate("/map-editor")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
        >
          <PencilLine className="w-4 h-4" />
          编辑地图
        </button>
        <button
          onClick={() => navigate("/pathplan")}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
        >
          <Route className="w-4 h-4" />
          计算路径
        </button>
        <button
          onClick={() => navigate("/replan")}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
        >
          <Repeat className="w-4 h-4" />
          模拟障碍
        </button>
        <button
          onClick={() => navigate("/rules")}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
        >
          <Download className="w-4 h-4" />
          导出路径
        </button>
      </div>

      {/* Recent Logs */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">最近路径规划日志</h3>
        {recentLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">暂无日志记录</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 font-mono text-xs w-16 shrink-0">{log.time}</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
