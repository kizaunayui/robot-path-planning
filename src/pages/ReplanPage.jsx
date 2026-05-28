import { useState, useCallback } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { Repeat, AlertTriangle, RotateCcw, ArrowRight, Clock, Battery, Ruler, Zap } from "lucide-react";

export default function ReplanPage() {
  const {
    floorMap, currentFloor, setCurrentFloor, routes, bestRoute, previousRoute,
    replanCount, replanHistory, replan, planRoutes, addLog,
  } = useAppStore();

  const [highlightRoute, setHighlightRoute] = useState(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [obstacleCount, setObstacleCount] = useState(3);
  const [comparing, setComparing] = useState(false);

  // 生成随机障碍位置（在当前路径的当前楼层段上）
  const generateObstaclesOnPath = useCallback(() => {
    if (!bestRoute || !bestRoute.path || bestRoute.path.length < 5) {
      addLog("请先计算路径，再模拟动态障碍");
      return [];
    }

    // 获取当前楼层的路径节点
    const path = bestRoute.path;
    const floorNodes = path.filter((p) => {
      if (p.floor) return p.floor === currentFloor;
      return true;
    });

    if (floorNodes.length < 3) {
      addLog("当前楼层路径太短，无法生成障碍");
      return [];
    }

    const obstacles = [];
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
      obstacles.push(node.pos || node);
    }
    return obstacles;
  }, [bestRoute, obstacleCount, addLog, currentFloor]);

  const handleSimulateObstacle = () => {
    const obstacles = generateObstaclesOnPath();
    if (obstacles.length === 0) return;

    setComparing(true);
    setShowPrevious(true);

    replan(obstacles);

    setTimeout(() => {
      setComparing(false);
    }, 5000);
  };

  const handleManualReplan = () => {
    planRoutes();
    addLog("手动触发路径重规划");
  };

  const latestHistory = replanHistory[0];

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-slate-100">动态障碍与重规划</h2>
      <p className="text-slate-400 text-sm">
        模拟动态障碍突然出现在当前楼层路径上，自动检测路径阻断并触发实时重规划。支持跨楼层电梯绕行。
      </p>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">障碍数量</label>
          <input
            type="number"
            min={1}
            max={8}
            value={obstacleCount}
            onChange={(e) => setObstacleCount(Number(e.target.value))}
            className="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">障碍楼层</label>
          <div className="flex gap-1">
            {['1F', '2F', '3F'].map((fid) => (
              <button
                key={fid}
                onClick={() => setCurrentFloor(fid)}
                className={`px-3 py-2 rounded text-sm transition ${
                  currentFloor === fid
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {fid}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSimulateObstacle}
          className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2 rounded hover:bg-amber-700 text-sm font-medium"
        >
          <AlertTriangle className="w-4 h-4" />
          模拟动态障碍
        </button>
        <button
          onClick={handleManualReplan}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          <Repeat className="w-4 h-4" />
          手动重规划
        </button>
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium ${
            showPrevious ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {showPrevious ? "隐藏旧路径" : "显示旧路径对比"}
        </button>
        <div className="ml-auto text-sm text-slate-400">
          重规划次数: <span className="text-cyan-400 font-bold">{replanCount}</span>
        </div>
      </div>

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
              <span className="text-yellow-400 ml-2">🛗 含{bestRoute.elevatorCount}次电梯换乘</span>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">地图视图</h3>
          <div className="flex items-center gap-4 text-xs text-slate-400">
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
        </div>
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
      </div>

      {/* Stats: before vs after */}
      {latestHistory && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">重规划统计（最近一次）</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3" /> 路径长度变化
              </div>
              <div className="text-lg font-bold text-white">
                {latestHistory.oldLength} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {latestHistory.newLength}
              </div>
              <div className={`text-xs font-medium ${latestHistory.lengthDiff > 0 ? "text-red-400" : latestHistory.lengthDiff < 0 ? "text-green-400" : "text-slate-400"}`}>
                {latestHistory.lengthDiff > 0 ? `+${latestHistory.lengthDiff}` : latestHistory.lengthDiff} 步
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 预计耗时变化
              </div>
              <div className="text-lg font-bold text-white">
                {latestHistory.oldTime} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {latestHistory.newTime}
              </div>
              <div className="text-xs text-slate-400">分钟</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Battery className="w-3 h-3" /> 电量消耗变化
              </div>
              <div className="text-lg font-bold text-white">
                {latestHistory.oldEnergy} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {latestHistory.newEnergy}
              </div>
              <div className="text-xs text-slate-400">单位</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> 障碍数量
              </div>
              <div className="text-lg font-bold text-amber-400">{latestHistory.obstacleCount}</div>
              <div className="text-xs text-slate-400">新增动态障碍</div>
            </div>
          </div>
        </div>
      )}

      {/* Replan History Log */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">重规划日志</h3>
        {replanHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">暂无重规划记录，请先计算路径后模拟动态障碍。</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {replanHistory.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 bg-slate-700/50 rounded-lg p-3 text-sm">
                <span className="text-slate-500 font-mono text-xs w-16 shrink-0">{entry.time}</span>
                <span className="text-slate-300">
                  障碍 +{entry.obstacleCount} | 路径 {entry.oldLength}→{entry.newLength} 步
                  {entry.lengthDiff > 0 && <span className="text-red-400"> (+{entry.lengthDiff})</span>}
                  {entry.lengthDiff < 0 && <span className="text-green-400"> ({entry.lengthDiff})</span>}
                </span>
                <span className="text-slate-500 text-xs ml-auto">
                  耗时 {entry.oldTime}→{entry.newTime}min | 能耗 {entry.oldEnergy}→{entry.newEnergy}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
