import { useState } from "react";
import { hisPolicies, cargoRisks } from "../data/mockData";

export default function HISPolicy() {
  const [policies, setPolicies] = useState(hisPolicies);

  const togglePolicy = (id) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p))
    );
  };

  const activeCount = policies.filter((p) => p.status === "active").length;
  const priorityColors = { critical: "red", high: "orange", normal: "blue" };
  const riskColors = { critical: "red", high: "orange", medium: "yellow", low: "green" };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100">⚙️ HIS策略</h2>
      <p className="text-slate-400 text-sm">HIS 动态策略配置与货物风险评估。</p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">活跃策略</div>
          <div className="text-2xl font-bold">{activeCount}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">紧急策略</div>
          <div className="text-2xl font-bold">{policies.filter((p) => p.priority === "critical" && p.status === "active").length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">货物类型</div>
          <div className="text-2xl font-bold">{cargoRisks.length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">高风险货物</div>
          <div className="text-2xl font-bold">{cargoRisks.filter((c) => c.riskLevel === "high" || c.riskLevel === "critical").length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-3">HIS策略配置</h3>
          <div className="space-y-2">
            {policies.map((p) => (
              <div key={p.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.priority === "critical"
                          ? "bg-red-100 text-red-700"
                          : p.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.priority === "critical" ? "关键" : p.priority === "high" ? "高" : "普通"}
                    </span>
                    <span className={`text-xs ${p.status === "active" ? "text-green-600" : "text-slate-400"}`}>
                      {p.status === "active" ? "● 激活" : "○ 未激活"}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePolicy(p.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      p.status === "active" ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-800 transition-transform ${
                        p.status === "active" ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="text-sm text-slate-200 mb-1">{p.trigger}</div>
                <div className="text-xs text-slate-400">→ {p.action}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-3">货物风险评估</h3>
          <div className="space-y-2">
            {cargoRisks.map((cargo, idx) => (
              <div key={idx} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cargo.icon}</span>
                    <span className="text-sm font-medium text-slate-200">{cargo.type}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      cargo.riskLevel === "critical"
                        ? "bg-red-100 text-red-700"
                        : cargo.riskLevel === "high"
                        ? "bg-orange-100 text-orange-700"
                        : cargo.riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {cargo.riskLevel === "critical" ? "极高" : cargo.riskLevel === "high" ? "高" : cargo.riskLevel === "medium" ? "中" : "低"}
                  </span>
                </div>
                <div className="space-y-1">
                  {cargo.constraints.map((c, i) => (
                    <div key={i} className="text-xs text-slate-400">• {c}</div>
                  ))}
                </div>
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: cargo.riskLevel === "critical" ? "100%" : cargo.riskLevel === "high" ? "75%" : cargo.riskLevel === "medium" ? "50%" : "25%",
                      backgroundColor: cargo.riskLevel === "critical" ? "#ef4444" : cargo.riskLevel === "high" ? "#f97316" : cargo.riskLevel === "medium" ? "#eab308" : "#22c55e",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
