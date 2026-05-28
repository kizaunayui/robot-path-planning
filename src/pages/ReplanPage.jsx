import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Panel, MetricCompare, LogList } from "../components/ui";
import { Repeat, AlertTriangle, RotateCcw, Clock, Battery, Ruler, Zap, Building2, MapPin } from "lucide-react";

export default function ReplanPage() {
  const {
    floorMap, currentFloor, setCurrentFloor, routes, bestRoute, previousRoute,
    replanCount, replanHistory, replan, planRoutes, addLog,
  } = useAppStore();

  const [highlightRoute, setHighlightRoute] = useState(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [obstacleCount, setObstacleCount] = useState(3);
  const [comparing, setComparing] = useState(false);
  const [blockInfo, setBlockInfo] = useState(null);

  const generateObstaclesOnPath = useCallback(() => {
    if (!bestRoute || !bestRoute.path || bestRoute.path.length < 5) {
      addLog("请先计算路径，再模拟动态障碍");
      return { obstacles: [], blockedNodes: [] };
    }
    const path = bestRoute.path;
    const floorNodes = path.filter((p) => {
      if (p.floor) return p.floor === currentFloor;
      return true;
    });
    if (floorNodes.length < 3) {
      addLog("当前楼层路径太短，无法生成障碍");
      return { obstacles: [], blockedNodes: [] };
    }
    const obstacles = [];
    const blockedNodes = [];
    const startIdx = Math.floor(floorNodes.length * 0.2);
    const endIdx = Math.floor(floorNodes.length * 0.8);
    const used = new Set();
    for (let i = 0; i < obstacleCount && i < (endIdx - startIdx); i++) {
      let idx;
      do {
        idx = startIdx + Math.floor(Math.random() * (endIdx - startIdx));
      } while (used.has(idx));
      used.add(idx);
      const node = floorNodes[idx];
      const pos = node.pos || node;
      obstacles.push(pos);
      blockedNodes.push({ floor: currentFloor, pos });
    }
    return { obstacles, blockedNodes };
  }, [bestRoute, obstacleCount, addLog, currentFloor]);

  const handleSimulateObstacle = () => {
    const { obstacles, blockedNodes } = generateObstaclesOnPath();
    if (obstacles.length === 0) return;
    setBlockInfo({
      floor: currentFloor,
      obstacles,
      blockedNodes,
      message: `旧路径在 ${currentFloor} (${obstacles.map(o => o.join(", ")).join("), (")}) 节点被动态障碍阻断`,
    });
    setComparing(true);
    setShowPrevious(true);
    replan(obstacles);
    setTimeout(() => setComparing(false), 5000);
  };

  const handleManualReplan = () => {
    planRoutes();
    addLog("手动触发路径重规划");
  };

  const latestHistory = replanHistory[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">动态障碍与重规划</h1>
        <p className="text-slate-500 text-xs mt-1">
          模拟动态障碍突然出现在当前楼层路径上，自动检测路径阻断并触发实时重规划。支持跨楼层电梯绕行。
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 rounded-lg border border-slate-700/60 p-4 flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">障碍数量</label>
          <input
            type="number"
            min={1}
            max={8}
            value={obstacleCount}
            onChange={(e) => setObstacleCount(Number(e.target.value))}
            className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">障碍楼层</label>
          <div className="flex gap-1">
            {['1F', '2F', '3F'].map((fid) => (
              <button
                key={fid}
                onClick={() => setCurrentFloor(fid)}
                className={`px-3 py-2 rounded text-sm transition ${
                  currentFloor === fid
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {fid}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSimulateObstacle}
          className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2 rounded hover:bg-amber-500 text-sm font-medium"
        >
          <AlertTriangle className="w-4 h-4" />
          模拟动态障碍
        </button>
        <button
          onClick={handleManualReplan}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-500 text-sm font-medium"
        >
          <Repeat className="w-4 h-4" />
          手动重规划
        </button>
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium ${
            showPrevious ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {showPrevious ? "隐藏旧路径" : "显示旧路径对比"}
        </button>
        <div className="ml-auto text-sm text-slate-400">
          重规划次数: <span className="text-cyan-400 font-bold">{replanCount}</span>
        </div>
      </div>

      {/* Block info panel */}
      {blockInfo && (
        <Panel title="阻断信息" className="border-amber-500/40">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">路径阻断已检测</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-slate-500 mb-1">阻断楼层</div>
                <span className="px-2 py-1 rounded font-bold text-white" style={{ backgroundColor: blockInfo.floor === '1F' ? '#3b82f6' : blockInfo.floor === '2F' ? '#10b981' : '#f59e0b' }}>
                  {blockInfo.floor}
                </span>
              </div>
              <div>
                <div className="text-slate-500 mb-1">新增障碍坐标</div>
                <div className="text-amber-400 font-mono">
                  {blockInfo.obstacles.map((o, i) => `(${o[0]}, ${o[1]}`).join('), ')}{')'}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">阻断节点数</div>
                <div className="text-red-400 font-bold">{blockInfo.blockedNodes.length} 个</div>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded p-2 text-xs text-slate-300">
              <MapPin className="w-3 h-3 inline text-amber-400 mr-1" />
              {blockInfo.message}
            </div>
            <button
              onClick={() => setBlockInfo(null)}
              className="text-xs text-slate-500 hover:text-white"
            >
              清除阻断信息
            </button>
          </div>
        </Panel>
      )}

      {/* Comparison indicator */}
      {comparing && previousRoute && bestRoute && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div className="text-sm text-amber-300">
            <span className="font-bold">路径阻断已检测</span> — 旧路径长度 {previousRoute.length} 步 → 新路径 {bestRoute.length} 步
            {bestRoute.length > previousRoute.length && (
              <span className="text-red-400 ml-2">(+{bestRoute.length - previousRoute.length} 步)</span>
            )}
            {bestRoute.elevatorCount > 0 && (
              <span className="text-yellow-400 ml-2">含{bestRoute.elevatorCount}次电梯换乘</span>
            )}
          </div>
        </div>
      )}

      {/* Map + Stats */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <Panel
            title="地图视图"
            actions={
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 bg-green-500 rounded" /> 当前路径
                </span>
                {showPrevious && previousRoute && (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-slate-500 rounded" /> 旧路径
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-amber-500 rounded" /> 动态障碍
                </span>
              </div>
            }
          >
            <HospitalMap
              floorMap={floorMap}
              currentFloor={currentFloor}
              onFloorChange={setCurrentFloor}
              routes={showPrevious && previousRoute ? [...routes, { ...previousRoute, strategy: "previous" }] : routes}
              bestRoute={bestRoute}
              highlightRoute={highlightRoute || bestRoute}
              showLabels={true}
              showFloorTabs={true}
            />
          </Panel>
        </div>

        {/* Right side: comparison stats */}
        <div className="col-span-4 space-y-4">
          {latestHistory ? (
            <Panel title="重规划统计（最近一次）">
              <div className="space-y-4">
                <MetricCompare
                  label="路径长度变化"
                  icon={Ruler}
                  oldVal={latestHistory.oldLength}
                  newVal={latestHistory.newLength}
                  unit="步"
                  diff={latestHistory.lengthDiff}
                />
                <MetricCompare
                  label="预计耗时变化"
                  icon={Clock}
                  oldVal={latestHistory.oldTime}
                  newVal={latestHistory.newTime}
                  unit="分钟"
                />
                <MetricCompare
                  label="电量消耗变化"
                  icon={Battery}
                  oldVal={latestHistory.oldEnergy}
                  newVal={latestHistory.newEnergy}
                  unit="单位"
                />
                <MetricCompare
                  label="电梯换乘次数变化"
                  icon={Building2}
                  oldVal={latestHistory.oldElevatorCount || 0}
                  newVal={latestHistory.newElevatorCount || 0}
                  unit="次"
                  diff={(latestHistory.newElevatorCount || 0) - (latestHistory.oldElevatorCount || 0)}
                />
                <div className="text-center pt-2 border-t border-slate-700/60">
                  <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> 新增障碍数量
                  </div>
                  <div className="text-lg font-bold text-amber-400">{latestHistory.obstacleCount}</div>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="重规划统计">
              <p className="text-slate-600 text-xs text-center py-6">请先计算路径后模拟动态障碍</p>
            </Panel>
          )}

          {/* Replan History Log */}
          <Panel title="重规划日志">
            {replanHistory.length === 0 ? (
              <p className="text-slate-600 text-xs">暂无重规划记录</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {replanHistory.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 bg-slate-800/60 rounded p-2 text-xs">
                    <span className="text-slate-600 font-mono w-14 shrink-0">{entry.time}</span>
                    <span className="text-slate-400 truncate">
                      障碍 +{entry.obstacleCount} | {entry.oldLength}→{entry.newLength} 步
                      {entry.lengthDiff > 0 && <span className="text-red-400"> (+{entry.lengthDiff})</span>}
                      {entry.lengthDiff < 0 && <span className="text-green-400"> ({entry.lengthDiff})</span>}
                      {entry.newElevatorCount !== undefined && (
                        <span className="text-yellow-400 ml-1">🛗{entry.oldElevatorCount||0}→{entry.newElevatorCount||0}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
