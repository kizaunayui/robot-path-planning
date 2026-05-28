import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Eraser, Plus, AlertTriangle, Dices, Trash2, RotateCcw, CheckCircle, XCircle } from "lucide-react";

const TOOLS = [
  { id: "wall", icon: Plus, label: "绘制墙壁" },
  { id: "dynamic", icon: AlertTriangle, label: "动态障碍" },
  { id: "erase", icon: Eraser, label: "擦除" },
];

export default function MapEditor() {
  const { floorMap, currentFloor, setCurrentFloor, updateMap, validation, allValidations, resetState } = useAppStore();

  const [tool, setTool] = useState("wall");

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

  const currentValidation = allValidations?.[currentFloor] || validation;
  const currentMapData = floorMap[currentFloor];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">地图编辑</h2>
      <p className="text-slate-400 text-sm">
        绘制静态障碍与动态障碍，编辑结果将影响后续路径规划。支持分楼层编辑。
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

      {/* Map with floor tabs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <HospitalMap
          floorMap={floorMap}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          editMode={tool}
          onCellClick={handleCellClick}
          showLabels={true}
          showGrid={true}
          showFloorTabs={true}
        />
      </div>

      {/* Validation per floor */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{currentValidation.freeCells}</div>
          <div className="text-xs text-slate-400">自由格 ({currentFloor})</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-300">{currentValidation.wallCells}</div>
          <div className="text-xs text-slate-400">墙壁格</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{currentValidation.dynamicObstacles}</div>
          <div className="text-xs text-slate-400">动态障碍</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{currentValidation.points}</div>
          <div className="text-xs text-slate-400">科室节点</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {currentValidation.connected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <span className={`text-lg font-bold ${currentValidation.connected ? "text-green-400" : "text-red-400"}`}>
              {currentValidation.connected ? "可达" : "不可达"}
            </span>
          </div>
          <div className="text-xs text-slate-400">连通性</div>
        </div>
      </div>

      {/* All floors overview */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">各楼层概览</h3>
        <div className="grid grid-cols-3 gap-4">
          {['1F', '2F', '3F'].map((fid) => {
            const v = allValidations?.[fid];
            if (!v) return null;
            const fdata = floorMap[fid];
            return (
              <div key={fid} className="bg-slate-700/50 rounded-lg p-3 text-xs space-y-1">
                <div className="font-bold text-white text-sm mb-2">{fid}</div>
                <div className="flex justify-between text-slate-400">
                  <span>科室</span>
                  <span className="text-green-400">{v.points}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>动态障碍</span>
                  <span className="text-amber-400">{v.dynamicObstacles}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>连通</span>
                  <span className={v.connected ? "text-green-400" : "text-red-400"}>
                    {v.connected ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(fdata.points).map((name) => (
                    <span key={name} className="bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
