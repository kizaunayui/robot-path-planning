import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Panel, ToolbarButton, StatCard } from "../components/ui";
import { Eraser, Plus, AlertTriangle, Dices, Trash2, RotateCcw, CheckCircle, XCircle, MapPin, Grid3X3, ShieldAlert, Building2 } from "lucide-react";

const TOOLS = [
  { id: "wall", icon: Plus, label: "绘制墙壁" },
  { id: "dynamic", icon: AlertTriangle, label: "动态障碍" },
  { id: "erase", icon: Eraser, label: "擦除" },
];

export default function MapEditor() {
  const { floorMap, currentFloor, setCurrentFloor, updateMap, allValidations, resetState, rules } = useAppStore();
  const [tool, setTool] = useState("wall");

  const handleCellClick = useCallback(
    (cell) => {
      if (tool === "wall") updateMap("wall", cell);
      else if (tool === "dynamic") updateMap("dynamic", cell);
      else if (tool === "erase") updateMap("erase", cell);
    },
    [tool, updateMap]
  );

  const currentValidation = allValidations?.[currentFloor] || {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">地图编辑</h1>
        <p className="text-slate-500 text-xs mt-1">
          绘制静态障碍与动态障碍，编辑结果将影响后续路径规划。支持分楼层编辑。
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 rounded-lg border border-slate-700/60 p-3 flex items-center gap-2 flex-wrap">
        {TOOLS.map((t) => (
          <ToolbarButton
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={tool === t.id}
            onClick={() => setTool(t.id)}
          />
        ))}
        <span className="w-px h-6 bg-slate-700 mx-1" />
        <ToolbarButton icon={Dices} label="随机动态障碍" variant="amber" onClick={() => updateMap("randomDynamic", 5)} />
        <ToolbarButton icon={Trash2} label="清除动态障碍" variant="orange" onClick={() => updateMap("clearDynamic")} />
        <ToolbarButton icon={Trash2} label="清除所有障碍" variant="red" onClick={() => updateMap("clearAll")} />
        <ToolbarButton icon={RotateCcw} label="恢复默认" variant="slate" onClick={resetState} />
      </div>

      {/* Map */}
      <Panel title={`${currentFloor} 楼层地图`}>
        <HospitalMap
          floorMap={floorMap}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          editMode={tool}
          onCellClick={handleCellClick}
          rules={rules}
          showLabels={true}
          showGrid={true}
          showFloorTabs={true}
        />
      </Panel>

      {/* Validation Stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label={`自由格 (${currentFloor})`} value={currentValidation.freeCells} icon={Grid3X3} color="text-blue-400" />
        <StatCard label="墙壁格" value={currentValidation.wallCells} icon={Building2} color="text-slate-300" />
        <StatCard label="动态障碍" value={currentValidation.dynamicObstacles} icon={ShieldAlert} color="text-amber-400" />
        <StatCard label="科室节点" value={currentValidation.points} icon={MapPin} color="text-green-400" />
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-700/60 flex items-center justify-center gap-2">
          {currentValidation.connected ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-lg font-bold ${currentValidation.connected ? "text-green-400" : "text-red-400"}`}>
            {currentValidation.connected ? "可达" : "不可达"}
          </span>
        </div>
      </div>

      {/* All floors overview */}
      <Panel title="各楼层概览">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['1F', '2F', '3F'].map((fid) => {
            const v = allValidations?.[fid];
            if (!v) return null;
            const fdata = floorMap[fid];
            return (
              <div key={fid} className="bg-slate-800/60 rounded-lg p-3 text-xs space-y-1">
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
                    <span key={name} className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
