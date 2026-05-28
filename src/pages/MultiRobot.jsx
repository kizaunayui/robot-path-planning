import { useState, useEffect } from "react";
import { useAppStore } from "../store/AppStore";
import { conflictPredictions as initialConflicts, trafficSignals as initialSignals } from "../data/mockData";

export default function MultiRobot() {
  const { map, robots, updateRobot } = useAppStore();
  const [conflicts, setConflicts] = useState(initialConflicts.map((c) => ({ ...c, resolved: false })));
  const [signals, setSignals] = useState(initialSignals);
  const [actionLog, setActionLog] = useState([]);

  const addLog = (msg) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setActionLog((prev) => [...prev.slice(-19), { time, msg }]);
  };

  const activeCount = robots.filter((r) => r.status === "running").length;
  const unresolvedDeadlocks = conflicts.filter((c) => c.type === "死锁风险" && !c.resolved).length;
  const unresolvedConflicts = conflicts.filter((c) => !c.resolved).length;

  const handleYield = () => {
    const target = conflicts.find((c) => !c.resolved);
    if (target) {
      setConflicts((prev) => prev.map((c) => (c.id === target.id ? { ...c, resolved: true } : c)));
      addLog(`手动让行: ${target.robots.join(" & ")} 在 ${target.location} 的 ${target.type} 已解决`);
    } else {
      addLog("当前无待处理冲突");
    }
  };

  const handleDeadlockResolve = () => {
    if (unresolvedDeadlocks === 0) {
      addLog("当前无死锁风险");
      return;
    }
    setConflicts((prev) => prev.map((c) => (c.type === "死锁风险" ? { ...c, resolved: true } : c)));
    addLog("触发死锁解决: 所有死锁风险已标记为已解决");
  };

  const handleToggleSignal = (signalId) => {
    setSignals((prev) =>
      prev.map((s) => {
        if (s.id !== signalId) return s;
        const cycle = { green: "yellow", yellow: "red", red: "green" };
        const next = cycle[s.status] || "green";
        addLog(`信号 ${s.location} 切换为 ${next === "green" ? "绿灯" : next === "yellow" ? "黄灯" : "红灯"}`);
        return { ...s, status: next, state: next };
      })
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">🤖 多机器人协调</h2>
      <p className="text-slate-400 text-sm">
        多机器人实时协调，支持冲突预测、死锁检测和交通信号控制。
      </p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">运行机器人</div>
          <div className="text-2xl font-bold">{activeCount}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">冲突预测</div>
          <div className="text-2xl font-bold">{unresolvedConflicts}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">死锁风险</div>
          <div className="text-2xl font-bold">{unresolvedDeadlocks}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">交通信号</div>
          <div className="text-2xl font-bold">{signals.length}</div>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Map info + controls */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200">地图视图</h3>
            <div className="flex gap-2">
              <button onClick={handleYield} className="px-3 py-1.5 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600">
                ⚡ 手动让行
              </button>
              <button onClick={handleDeadlockResolve} className="px-3 py-1.5 rounded text-xs bg-red-500 text-white hover:bg-red-600">
                🔒 触发死锁解决
              </button>
            </div>
          </div>

          {/* Robot status grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {robots.map((r) => (
              <div key={r.id} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: r.status === "running" ? "#4caf50" : r.status === "charging" ? "#ffc107" : "#9e9e9e",
                    }}
                  />
                  <span className="text-xs font-medium text-slate-200">{r.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>🔋 {r.battery}%</span>
                  <span>⚡ {r.speed}m/s</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      r.status === "running" ? "bg-green-100 text-green-700" : r.status === "charging" ? "bg-yellow-100 text-yellow-700" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {r.status === "running" ? "运行中" : r.status === "charging" ? "充电" : "待机"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Traffic signals */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">🚦 交通信号状态</h4>
            <div className="grid grid-cols-2 gap-2">
              {signals.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <div>
                    <div className="text-xs font-medium text-slate-200">{sig.location}</div>
                    <div className="text-xs text-slate-400">{sig.direction}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSignal(sig.id)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-all hover:scale-125 ${
                        sig.status === "green"
                          ? "bg-green-500 shadow-lg shadow-green-500/50"
                          : sig.status === "red"
                          ? "bg-red-500 shadow-lg shadow-red-500/50"
                          : "bg-yellow-500 shadow-lg shadow-yellow-500/50"
                      }`}
                      title="点击切换"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-96 space-y-3">
          {/* Conflict predictions */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 mb-3">冲突预测</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {conflicts.map((cp) => (
                <div
                  key={cp.id}
                  className={`p-2 rounded-lg transition-all ${cp.resolved ? "bg-slate-800 opacity-60" : "bg-slate-800 border border-slate-700"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-200 font-medium">{cp.type}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        cp.resolved ? "bg-green-100 text-green-700" : cp.type === "死锁风险" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {cp.resolved ? "已解决" : `ETA ${cp.eta}s`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {cp.robots.join(" & ")} · {cp.location}
                  </div>
                  {!cp.resolved && <div className="text-xs text-green-600 mt-1">方案: {cp.resolution}</div>}
                  {cp.resolved && <div className="text-xs text-green-500 mt-1">✅ 已按方案解决</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Action log */}
          {actionLog.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-200 mb-2">操作日志</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {actionLog.map((l, i) => (
                  <div key={i} className="text-xs flex gap-2">
                    <span className="text-slate-400 font-mono w-14 shrink-0">[{l.time}]</span>
                    <span className="text-slate-300">{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
