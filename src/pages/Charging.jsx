import { useState, useEffect } from "react";
import { useAppStore } from "../store/AppStore";
import { chargingStations } from "../data/mockData";

export default function Charging() {
  const { robots, updateRobot } = useAppStore();
  const [stations, setStations] = useState(chargingStations);

  // Simulate battery changes
  useEffect(() => {
    const interval = setInterval(() => {
      // We can't directly mutate store robots, but we can track battery locally for display
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCharge = (robotId) => {
    updateRobot(robotId, { status: "charging" });
    const availableStation = stations.find((s) => s.status === "available");
    if (availableStation) {
      setStations((prev) =>
        prev.map((s) => (s.id === availableStation.id ? { ...s, status: "occupied", robotId } : s))
      );
    }
  };

  const avgBattery = (robots.reduce((a, b) => a + b.battery, 0) / robots.length).toFixed(0);
  const lowBatteryCount = robots.filter((r) => r.battery < 30).length;
  const availableStations = stations.filter((s) => s.status === "available").length;

  const getWorkIndex = (battery, status) => {
    if (status === "charging") return "充电中";
    if (battery > 70) return "优";
    if (battery > 40) return "良";
    if (battery > 20) return "差";
    return "危险";
  };

  const batteryColor = (b) => (b > 50 ? "#22c55e" : b > 20 ? "#eab308" : "#ef4444");

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">🔋 充电管理</h2>
      <p className="text-slate-400 text-sm">机器人电量监控与充电桩调度。</p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">平均电量</div>
          <div className="text-2xl font-bold">{avgBattery}%</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">低电量</div>
          <div className="text-2xl font-bold">{lowBatteryCount}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">可用充电桩</div>
          <div className="text-2xl font-bold">{availableStations}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">充电中</div>
          <div className="text-2xl font-bold">{robots.filter((r) => r.status === "charging").length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Robot battery gauges */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">机器人电量仪表盘</h3>
          <div className="grid grid-cols-2 gap-3">
            {robots.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: r.status === "running" ? "#4caf50" : r.status === "charging" ? "#ffc107" : "#9e9e9e",
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700">{r.name}</span>
                </div>
                <div className="flex items-center justify-center mb-2">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={batteryColor(r.battery)}
                        strokeWidth="8"
                        strokeDasharray={`${r.battery * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-700">{r.battery}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      getWorkIndex(r.battery, r.status) === "优"
                        ? "bg-green-100 text-green-700"
                        : getWorkIndex(r.battery, r.status) === "良"
                        ? "bg-blue-100 text-blue-700"
                        : getWorkIndex(r.battery, r.status) === "充电中"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    可工作: {getWorkIndex(r.battery, r.status)}
                  </span>
                </div>
                {r.status !== "charging" && r.battery < 50 && (
                  <button
                    onClick={() => handleCharge(r.id)}
                    className="w-full mt-2 px-3 py-1.5 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    🔌 调度充电
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Charging stations */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">充电桩状态</h3>
            <div className="space-y-2">
              {stations.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-slate-700">🔌 {s.name}</div>
                      <div className="text-xs text-slate-500">{s.location}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.status === "available"
                          ? "bg-green-100 text-green-700"
                          : s.status === "occupied"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status === "available" ? "空闲" : s.status === "occupied" ? "占用" : "故障"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    功率: {s.power}W {s.robotId && `| 机器人: ${s.robotId}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">智能充电建议</h3>
            <div className="space-y-2">
              {robots
                .filter((r) => r.battery < 50 && r.status !== "charging")
                .sort((a, b) => a.battery - b.battery)
                .map((r) => (
                  <div key={r.id} className="p-2 bg-red-50 rounded-lg flex items-center justify-between border border-red-200">
                    <span className="text-xs text-slate-700">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-medium">{r.battery}%</span>
                      <button
                        onClick={() => handleCharge(r.id)}
                        className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600"
                      >
                        立即充电
                      </button>
                    </div>
                  </div>
                ))}
              {robots.filter((r) => r.battery < 50 && r.status !== "charging").length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm">✅ 所有机器人电量充足</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
