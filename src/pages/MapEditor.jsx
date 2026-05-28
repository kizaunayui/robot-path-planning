import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";

const TOOLS = [
  { id: "wall", icon: "🧱", label: "绘制墙壁" },
  { id: "dynamic", icon: "⚠️", label: "动态障碍" },
  { id: "erase", icon: "🗑️", label: "擦除" },
  { id: "randomDynamic", icon: "🎲", label: "随机动态" },
];

export default function MapEditor() {
  const { map, updateMap, resizeMap, randomMap, resetState, validation } = useAppStore();
  const [tool, setTool] = useState("wall");
  const [resizeCols, setResizeCols] = useState(map.cols);
  const [resizeRows, setResizeRows] = useState(map.rows);
  const [density, setDensity] = useState(16);
  const [savedMsg, setSavedMsg] = useState("");

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

  const handleRandomDynamic = () => {
    updateMap("randomDynamic", 5);
  };

  const handleSave = () => {
    localStorage.setItem("pathplan_map", JSON.stringify(map));
    setSavedMsg("已保存到本地存储");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const handleLoad = () => {
    try {
      const data = JSON.parse(localStorage.getItem("pathplan_map"));
      if (data) {
        // Triggers re-render through store
        window.location.reload();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">🗺️ 地图编辑器</h2>

      {/* Toolbar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 shadow-sm flex items-center gap-2 flex-wrap">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTool(t.id);
              if (t.id === "randomDynamic") handleRandomDynamic();
            }}
            className={`px-3 py-2 rounded text-sm transition ${
              tool === t.id ? "bg-blue-600 text-white" : "bg-slate-700 hover:bg-slate-200 text-slate-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <span className="w-px h-6 bg-slate-300 mx-1" />
        <button onClick={handleSave} className="px-3 py-2 rounded text-sm bg-green-100 hover:bg-green-200 text-green-700">
          💾 保存
        </button>
        <button onClick={handleLoad} className="px-3 py-2 rounded text-sm bg-blue-100 hover:bg-blue-200 text-blue-700">
          📂 加载
        </button>
        <button onClick={resetState} className="px-3 py-2 rounded text-sm bg-red-100 hover:bg-red-200 text-red-700">
          🔄 恢复默认
        </button>
        {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
      </div>

      {/* Resize & Random */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-3">📐 地图设置</h3>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">列数 (16-60)</label>
            <input
              type="number"
              min={16}
              max={60}
              value={resizeCols}
              onChange={(e) => setResizeCols(Number(e.target.value))}
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
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
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => resizeMap(resizeCols, resizeRows)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            📐 调整尺寸
          </button>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">障碍密度 (0-42%)</label>
            <input
              type="number"
              min={0}
              max={42}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => randomMap(resizeCols, resizeRows, density)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            🎲 随机地图
          </button>
          <div className="text-xs text-slate-400">
            当前: {map.cols}×{map.rows} | 墙壁: {map.walls.length} | 动态: {map.dynamic.length}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
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
          <div className="text-2xl font-bold text-blue-600">{validation.freeCells}</div>
          <div className="text-xs text-slate-400">自由格</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-300">{validation.wallCells}</div>
          <div className="text-xs text-slate-400">墙壁格</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{validation.dynamicObstacles}</div>
          <div className="text-xs text-slate-400">动态障碍</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{validation.points}</div>
          <div className="text-xs text-slate-400">科室节点</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${validation.connected ? "text-green-600" : "text-red-600"}`}>
            {validation.connected ? "✅" : "❌"}
          </div>
          <div className="text-xs text-slate-400">连通性</div>
        </div>
      </div>
    </div>
  );
}
