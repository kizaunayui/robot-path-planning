import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";

export default function SimulationSandbox() {
  const { map, sandbox, runSandbox, logs } = useAppStore();
  const [rounds, setRounds] = useState(12);
  const [running, setRunning] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleRun = () => {
    setRunning(true);
    // Slight delay for UX feedback
    setTimeout(() => {
      runSandbox(rounds);
      setRunning(false);
    }, 300);
  };

  // Build a fake route for the selected record to show on map
  const highlightRoute = selectedRecord
    ? {
        strategy: "time",
        path: selectedRecord.reachable
          ? [
              map.points[selectedRecord.start],
              map.points[selectedRecord.end],
            ]
          : [],
        visited: [],
      }
    : null;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">🎮 沙盒演练</h2>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">演练轮数:</label>
          <select
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="border border-slate-600 rounded px-2 py-1.5 text-sm"
          >
            <option value={6}>6 轮</option>
            <option value={12}>12 轮</option>
            <option value={24}>24 轮</option>
            <option value={48}>48 轮</option>
          </select>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-6 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {running ? "⏳ 运行中..." : "▶️ 开始演练"}
        </button>
        {sandbox && (
          <span className="text-sm text-slate-400">
            完成 {sandbox.rounds} 轮 | 成功率 {(sandbox.successRate * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Map */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
        <HospitalMap mapData={map} highlightRoute={highlightRoute} />
      </div>

      {/* Stats */}
      {sandbox && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(sandbox.successRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-slate-400">成功率</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sandbox.avgLength}</div>
            <div className="text-xs text-slate-400">平均路径长度</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{sandbox.avgTurns}</div>
            <div className="text-xs text-slate-400">平均转弯次数</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{sandbox.avgMinutes}</div>
            <div className="text-xs text-slate-400">平均耗时(分钟)</div>
          </div>
        </div>
      )}

      {/* Records Table */}
      {sandbox && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-3">📋 演练记录</h3>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="border-b text-left text-xs text-slate-400">
                  <th className="pb-2">轮次</th>
                  <th className="pb-2">起点</th>
                  <th className="pb-2">终点</th>
                  <th className="pb-2">可达</th>
                  <th className="pb-2">长度</th>
                  <th className="pb-2">转弯</th>
                  <th className="pb-2">耗时</th>
                  <th className="pb-2">能耗</th>
                </tr>
              </thead>
              <tbody>
                {sandbox.records.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-blue-50 ${
                      selectedRecord === r ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-1.5">{i + 1}</td>
                    <td>{r.start}</td>
                    <td>{r.end}</td>
                    <td>
                      <span className={r.reachable ? "text-green-600" : "text-red-600"}>
                        {r.reachable ? "✅" : "❌"}
                      </span>
                    </td>
                    <td>{r.length}</td>
                    <td>{r.turns}</td>
                    <td>{r.minutes}</td>
                    <td>{r.energy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-2">📋 操作日志</h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-400 text-xs">暂无日志</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-400 font-mono">{log.time}</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
