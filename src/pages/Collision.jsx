import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../store/AppStore";
import { collisionAlerts as initialAlerts } from "../data/mockData";

export default function Collision() {
  const { map, robots } = useAppStore();
  const [alerts, setAlerts] = useState(initialAlerts.map((a) => ({ ...a, handled: false })));
  const [activeAlert, setActiveAlert] = useState(null);

  const handleResolve = (alertId) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, handled: true } : a)));
    setActiveAlert(null);
  };

  const handleSimulateAlert = () => {
    const locations = ["药房", "检验科", "手术室", "住院区A", "电梯厅", "消毒供应室"];
    const types = ["正面碰撞", "交叉碰撞", "追尾风险", "静态障碍"];
    const riskLevels = ["high", "medium", "low"];
    const robotPairs = [
      ["R1", "R2"],
      ["R3", "R5"],
      ["R1", "R6"],
      ["R2", "R3"],
    ];
    const pair = robotPairs[Math.floor(Math.random() * robotPairs.length)];
    const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const newAlert = {
      id: `CA${Date.now()}`,
      robot: pair[0],
      other: pair[1],
      location: locations[Math.floor(Math.random() * locations.length)],
      time: new Date().toTimeString().slice(0, 8),
      distance: (1 + Math.random() * 3).toFixed(1),
      action: risk === "high" ? "紧急制动" : risk === "medium" ? "减速避让" : "速度调整",
      risk,
      type: types[Math.floor(Math.random() * types.length)],
      handled: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setActiveAlert(newAlert);
    setTimeout(() => setActiveAlert(null), 3000);
  };

  const stats = useMemo(() => {
    const total = alerts.length;
    const high = alerts.filter((a) => a.risk === "high").length;
    const handled = alerts.filter((a) => a.handled).length;
    const rate = total > 0 ? ((handled / total) * 100).toFixed(1) : "100.0";
    return { total, high, handled, rate };
  }, [alerts]);

  const riskColors = { high: "red", medium: "yellow", low: "green" };
  const riskLabels = { high: "高危", medium: "中危", low: "低危" };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">⚠️ 碰撞预警</h2>
      <p className="text-slate-400 text-sm">
        实时监测机器人间碰撞风险，支持预警管理和冲突解决。
      </p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">预警总数</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">高危预警</div>
          <div className="text-2xl font-bold">{stats.high}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">已处理</div>
          <div className="text-2xl font-bold">{stats.handled}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">避障成功率</div>
          <div className="text-2xl font-bold">{stats.rate}%</div>
        </div>
      </div>

      {/* Alert popup */}
      {activeAlert && !activeAlert.handled && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <span className="text-red-800 font-bold">碰撞预警</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${riskColors[activeAlert.risk]}-100 text-${riskColors[activeAlert.risk]}-700`}>
                {riskLabels[activeAlert.risk]}
              </span>
            </div>
            <div className="text-sm text-red-700">
              <div>位置: {activeAlert.location}</div>
              <div>类型: {activeAlert.type}</div>
              <div>距离: {activeAlert.distance}m</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleResolve(activeAlert.id)} className="px-3 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-700">
                ✅ 已处理
              </button>
              <button onClick={() => setActiveAlert(null)} className="px-3 py-1 rounded text-xs bg-slate-200 text-slate-200 hover:bg-slate-300">
                忽略
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 items-start">
        {/* Map */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200">地图视图</h3>
            <button onClick={handleSimulateAlert} className="px-3 py-1.5 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600">
              ⚠️ 模拟预警
            </button>
          </div>
          <div className="text-sm text-slate-300 space-y-1">
            <div>地图: {map.cols}×{map.rows} | 机器人: {robots.length}台</div>
            <div>墙壁: {map.walls.length} | 动态障碍: {map.dynamic.length}</div>
          </div>

          {/* DWA visualization */}
          <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="text-xs font-bold text-slate-300 mb-2">DWA 采样空间</h4>
            <div className="h-32 relative flex items-center justify-center">
              <div className="w-24 h-24 relative">
                {Array.from({ length: 20 }, (_, i) => {
                  const angle = (i / 20) * Math.PI * 2;
                  const r = 20 + Math.random() * 20;
                  const valid = Math.random() > 0.3;
                  return (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${valid ? "bg-green-400" : "bg-red-400"}`}
                      style={{
                        left: 48 + Math.cos(angle) * r,
                        top: 48 + Math.sin(angle) * r,
                      }}
                    />
                  );
                })}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full" />
              </div>
              <div className="ml-4 text-xs text-slate-400 space-y-1">
                <div>🟢 可行采样点</div>
                <div>🔴 碰撞采样点</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert list */}
        <div className="w-96 bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-3">预警记录 ({alerts.length})</h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-lg cursor-pointer transition-all ${
                  alert.handled ? "bg-slate-800 opacity-60" : "bg-slate-800 border border-slate-700 hover:bg-slate-800"
                }`}
                onClick={() => !alert.handled && setActiveAlert(alert)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{alert.time}</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      alert.risk === "high" ? "bg-red-100 text-red-700" : alert.risk === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    }`}>
                      {riskLabels[alert.risk]}
                    </span>
                    {alert.handled && <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">已处理</span>}
                  </div>
                </div>
                <div className="text-xs text-slate-200">{alert.type} - {alert.location}</div>
                <div className="text-xs text-slate-400">
                  {alert.robot} & {alert.other} · 距离 {alert.distance}m
                </div>
                {!alert.handled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(alert.id);
                    }}
                    className="mt-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    ✅ 标记处理
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
