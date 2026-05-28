import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import { Settings, ToggleLeft, ToggleRight, Download, FileJson, FileSpreadsheet, RefreshCw, ArrowRight } from "lucide-react";

const RULE_TYPE_INFO = {
  priority_zone: { name: "优先通行区", color: "text-green-400" },
  avoid_zone: { name: "避让区域", color: "text-red-400" },
  smooth: { name: "平稳优先", color: "text-yellow-400" },
  energy: { name: "节能模式", color: "text-blue-400" },
  no_go: { name: "禁行区域", color: "text-red-500" },
  speed_limit: { name: "限速区域", color: "text-orange-400" },
};

export default function RulesExport() {
  const { rules, updateRules, planRoutes, routes, bestRoute, logs, addLog } = useAppStore();
  const [beforeRoutes, setBeforeRoutes] = useState(null);

  const handleToggle = (id) => {
    if (!beforeRoutes && bestRoute) {
      setBeforeRoutes(routes.map((r) => ({ ...r })));
    }
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    updateRules(updated);
  };

  const handleWeightChange = (id, weight) => {
    if (!beforeRoutes && bestRoute) {
      setBeforeRoutes(routes.map((r) => ({ ...r })));
    }
    const updated = rules.map((r) => (r.id === id ? { ...r, weight: Number(weight) } : r));
    updateRules(updated);
  };

  const handleReplan = () => {
    setBeforeRoutes(routes.map((r) => ({ ...r })));
    planRoutes();
    addLog("规则变更已触发路径重规划");
  };

  const handleExportJSON = () => {
    if (!bestRoute) {
      addLog("请先计算路径再导出");
      return;
    }
    const data = {
      timestamp: new Date().toISOString(),
      task: { start: "1F-药房", end: "2F-消毒供应室" },
      bestRoute: {
        strategy: bestRoute.strategy,
        name: bestRoute.name,
        length: bestRoute.length,
        turns: bestRoute.turns,
        elevatorCount: bestRoute.elevatorCount || 0,
        segments: bestRoute.segments || [],
        estimatedMinutes: bestRoute.estimatedMinutes,
        energy: bestRoute.energy,
        score: bestRoute.score,
        path: bestRoute.path,
      },
      allRoutes: routes.map((r) => ({
        strategy: r.strategy,
        name: r.name,
        reachable: r.reachable,
        length: r.length,
        turns: r.turns,
        elevatorCount: r.elevatorCount || 0,
        estimatedMinutes: r.estimatedMinutes,
        energy: r.energy,
        score: r.score,
      })),
      activeRules: rules.filter((r) => r.enabled).map((r) => ({ id: r.id, name: r.name, weight: r.weight, floors: r.floors })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathplan_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("路径数据已导出为 JSON");
  };

  const handleExportCSV = () => {
    if (routes.length === 0) {
      addLog("请先计算路径再导出");
      return;
    }
    const header = "策略,名称,可达,路径长度,转弯次数,电梯换乘,预计耗时,电量消耗,综合评分";
    const rows = routes.map((r) =>
      [r.strategy, r.name, r.reachable ? "是" : "否", r.length, r.turns, r.elevatorCount || 0, r.estimatedMinutes, r.energy, r.score].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathplan_records_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("路径规划记录已导出为 CSV");
  };

  const beforeBest = beforeRoutes?.find((r) => r.reachable);
  const afterBest = bestRoute;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">规则配置与结果导出</h2>
          <p className="text-slate-400 text-sm mt-1">
            配置交通规则代价权重（按楼层生效），导出多楼层路径规划结果。
          </p>
        </div>
        <button
          onClick={handleReplan}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          重规划路径
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rules.map((rule) => {
          const info = RULE_TYPE_INFO[rule.type] || RULE_TYPE_INFO.priority_zone;
          return (
            <div
              key={rule.id}
              className={`bg-slate-800 border rounded-lg p-4 transition ${
                rule.enabled ? "border-slate-600" : "border-slate-700 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className={`w-4 h-4 ${info.color}`} />
                  <span className="font-semibold text-slate-200 text-sm">{rule.name}</span>
                </div>
                <button onClick={() => handleToggle(rule.id)} className="text-slate-400 hover:text-white">
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div>类型: <span className={info.color}>{info.name}</span></div>
                {rule.floors && (
                  <div>生效楼层: <span className="text-blue-400">{rule.floors.join(', ')}</span></div>
                )}
                <div className="flex items-center gap-2">
                  <span>权重:</span>
                  <input
                    type="range"
                    min={0.5}
                    max={rule.type === "no_go" ? 99 : 3}
                    step={0.1}
                    value={rule.weight}
                    onChange={(e) => handleWeightChange(rule.id, e.target.value)}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="font-mono w-10 text-right text-slate-300">{rule.weight}</span>
                </div>
                <div className="text-slate-500">
                  {rule.type === "avoid_zone" && "影响区域: 1F [18-22, 7-11] 污染区"}
                  {rule.type === "priority_zone" && "影响区域: 2F [23-27, 2-6] 手术区"}
                  {rule.type === "smooth" && "全局平稳策略折扣（所有楼层）"}
                  {rule.type === "energy" && "全局节能策略折扣（所有楼层）"}
                  {rule.type === "no_go" && "影响区域: 1F [12-16, 8-12] 电梯厅周围"}
                  {rule.type === "speed_limit" && "影响区域: 3F [2-6, 14-18] 住院区走廊"}
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${rule.enabled ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-500"}`}>
                  {rule.enabled ? "已启用" : "已停用"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before/After comparison */}
      {beforeRoutes && afterBest && beforeBest && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">规则启用前后路径指标变化</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">路径长度</div>
              <div className="text-lg font-bold text-white">
                {beforeBest.length} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {afterBest.length}
              </div>
              <div className={`text-xs ${afterBest.length < beforeBest.length ? "text-green-400" : afterBest.length > beforeBest.length ? "text-red-400" : "text-slate-400"}`}>
                {afterBest.length - beforeBest.length > 0 ? "+" : ""}{afterBest.length - beforeBest.length} 步
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">转弯次数</div>
              <div className="text-lg font-bold text-white">
                {beforeBest.turns} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {afterBest.turns}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">预计耗时</div>
              <div className="text-lg font-bold text-white">
                {beforeBest.estimatedMinutes} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {afterBest.estimatedMinutes}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">综合评分</div>
              <div className="text-lg font-bold text-white">
                {beforeBest.score} <ArrowRight className="w-4 h-4 inline text-slate-500" /> {afterBest.score}
              </div>
            </div>
          </div>
          <button
            onClick={() => setBeforeRoutes(null)}
            className="mt-3 text-xs text-slate-400 hover:text-white"
          >
            清除对比数据
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{rules.length}</div>
          <div className="text-xs text-slate-400">总规则数</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{rules.filter((r) => r.enabled).length}</div>
          <div className="text-xs text-slate-400">已启用</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-400">{rules.filter((r) => !r.enabled).length}</div>
          <div className="text-xs text-slate-400">已停用</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{routes.filter((r) => r.reachable).length}</div>
          <div className="text-xs text-slate-400">可达路径</div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">路径数据导出</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-sm font-medium"
          >
            <FileJson className="w-4 h-4" />
            导出当前路径 JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded hover:bg-green-700 text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            导出路径规划记录 CSV
          </button>
        </div>
      </div>
    </div>
  );
}
