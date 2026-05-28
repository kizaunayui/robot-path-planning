import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Eraser, Plus, AlertTriangle, Dices, Trash2, Save, RotateCcw, CheckCircle, XCircle } from "lucide-react";

const TOOLS = [
  { id: "wall", icon: Plus, label: "绘制墙壁" },
  { id: "dynamic", icon: AlertTriangle, label: "动态障碍" },
  { id: "erase", icon: Eraser, label: "擦除" },
];

export default function MapEditor() {
  const { map, updateMap, resizeMap, randomMap, resetState, validation } = useAppStore();
  const [tool, setTool] = useState("wall");
  const [resizeCols, setResizeCols] = useState(map.cols);
  const [resizeRows, setResizeRows] = useState(map.rows);
  const [density, setDensity] = useState(16);

  const handleCellClick = useCallback(
    (cell) => {
      if (tool === "wall") {
        updateMap("wall", cell);
      } else if (tool === "dynamic") {
        updateMap("dynamic", cell);
      } else if (tool === "erase") {
        updateMap("erase", cell);
      }
    },
    [tool, updateMap]
  );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">地图编辑</h2>
      <p className="text-slate-400 text-sm">
        绘制静态障碍与动态障碍，编辑结果将影响后续路径规划。
      </p>

      {/* Toolbar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 flex items-center gap-2 flex-wrap">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                tool === t.id ? "bg-blue-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
        <span className="w-px h-6 bg-slate-600 mx-1" />
        <button
          onClick={() => updateMap("randomDynamic", 5)}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Dices className="w-4 h-4" />
          随机动态障碍
        </button>
        <button
          onClick={() => updateMap("clearDynamic")}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Trash2 className="w-4 h-4" />
          清除动态障碍
        </button>
        <button
          onClick={() => updateMap("clearAll")}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="w-4 h-4" />
          清除所有障碍
        </button>
        <button
          onClick={resetState}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-slate-600 hover:bg-slate-500 text-white"
        >
          <RotateCcw className="w-4 h-4" />
          恢复默认
        </button>
      </div>

      {/* Resize & Random */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">地图设置</h3>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">列数 (16-60)</label>
            <input
              type="number"
              min={16}
              max={60}
              value={resizeCols}
              onChange={(e) => setResizeCols(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">行数 (12-40)</label>
            <input
              type="number"
              min={12}
              max={40}
              value={resizeRows}
              onChange={(e) => setResizeRows(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            onClick={() => resizeMap(resizeCols, resizeRows)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            调整尺寸
          </button>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">障碍密度 (0-42%)</label>
            <input
              type="number"
              min={0}
              max={42}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            onClick={() => randomMap(resizeCols, resizeRows, density)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            随机地图
          </button>
          <div className="text-xs text-slate-400">
            当前: {map.cols}×{map.rows} | 墙壁: {map.walls.length} | 动态: {map.dynamic.length}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <HospitalMap
          mapData={map}
          editMode={tool}
          onCellClick={handleCellClick}
          showLabels={true}
          showGrid={true}
        />
      </div>

      {/* Validation */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{validation.freeCells}</div>
          <div className="text-xs text-slate-400">自由格</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-300">{validation.wallCells}</div>
          <div className="text-xs text-slate-400">墙壁格</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{validation.dynamicObstacles}</div>
          <div className="text-xs text-slate-400">动态障碍</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{validation.points}</div>
          <div className="text-xs text-slate-400">科室节点</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {validation.connected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <span className={`text-lg font-bold ${validation.connected ? "text-green-400" : "text-red-400"}`}>
              {validation.connected ? "可达" : "不可达"}
            </span>
          </div>
          <div className="text-xs text-slate-400">起点→终点连通性</div>
        </div>
      </div>
    </div>
  );
}
