import { useState, useEffect } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";

export default function Diagnostics() {
  const { map, robots, logs, validation } = useAppStore();
  const [diagLogs, setDiagLogs] = useState([]);
  const [confidence, setConfidence] = useState(92);

  // Simulate live diagnostic logs
  useEffect(() => {
    const types = ["battery", "path", "sensor", "navigation", "motor", "communication"];
    const levels = ["info", "warning", "error"];
    const messages = [
      "定位精度正常",
      "路径偏差已修正",
      "传感器数据正常",
      "通信延迟<10ms",
      "电机温度偏高",
      "陀螺仪校准完成",
      "激光雷达信号稳定",
      "电池健康度良好",
      "地图匹配成功",
    ];
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        robot: `R${Math.floor(Math.random() * 6) + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      };
      setDiagLogs((prev) => [newLog, ...prev.slice(0, 19)]);
      setConfidence((prev) => Math.max(70, Math.min(99, prev + (Math.random() - 0.5) * 3)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const levelColors = { info: "blue", warning: "yellow", error: "red" };
  const levelLabels = { info: "信息", warning: "警告", error: "错误" };

  const errorCount = diagLogs.filter((l) => l.level === "error").length;
  const warningCount = diagLogs.filter((l) => l.level === "warning").length;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">📍 诊断</h2>
      <p className="text-slate-400 text-sm">系统诊断日志与地图状态监控，实时显示定位置信度和传感器状态。</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">地图自由格</span>
            <span className="text-xl">🗺️</span>
          </div>
          <div className="text-2xl font-bold">{validation.freeCells}</div>
          <div className="text-xs opacity-70 mt-1">可通行区域</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">定位置信度</span>
            <span className="text-xl">🎯</span>
          </div>
          <div className="text-2xl font-bold">{confidence.toFixed(0)}%</div>
          <div className="text-xs opacity-70 mt-1">当前精度</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">错误日志</span>
            <span className="text-xl">❌</span>
          </div>
          <div className="text-2xl font-bold">{errorCount}</div>
          <div className="text-xs opacity-70 mt-1">需处理</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">警告日志</span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold">{warningCount}</div>
          <div className="text-xs opacity-70 mt-1">需关注</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-2">🗺️ 地图状态</h3>
          <HospitalMap mapData={map} robots={robots} />
          {/* Confidence bar */}
          <div className="mt-2 p-2 bg-slate-700 rounded-lg flex items-center gap-3">
            <span className="text-xs text-slate-400">定位置信度:</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                  backgroundColor: confidence > 85 ? "#22c55e" : confidence > 70 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
            <span className="text-sm text-slate-200 font-mono">{confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Diagnostic logs */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-2">📋 诊断日志</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {diagLogs.length === 0 ? (
              <div className="text-slate-400 text-sm">等待日志...</div>
            ) : (
              diagLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg ${
                    log.level === "error"
                      ? "bg-red-50"
                      : log.level === "warning"
                      ? "bg-yellow-50"
                      : "bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">{log.time}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.level === "error"
                            ? "bg-red-100 text-red-600"
                            : log.level === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {levelLabels[log.level]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{log.robot}</span>
                  </div>
                  <div className="text-xs text-slate-200">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Robot diagnostics */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-3">🤖 机器人诊断</h3>
        <div className="grid grid-cols-3 gap-3">
          {robots.map((r) => (
            <div key={r.id} className="border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-slate-200">{r.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs text-white ${
                    r.status === "running" ? "bg-green-500" : r.status === "idle" ? "bg-orange-500" : "bg-blue-500"
                  }`}
                >
                  {r.status === "running" ? "运行中" : r.status === "idle" ? "待机" : "充电中"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>电量</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.battery}%`,
                          backgroundColor: r.battery > 60 ? "#4caf50" : r.battery > 30 ? "#ff9800" : "#f44336",
                        }}
                      />
                    </div>
                    <span>{r.battery}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>速度</span>
                  <span>{r.speed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span>位置</span>
                  <span>({r.pos[0]}, {r.pos[1]})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
