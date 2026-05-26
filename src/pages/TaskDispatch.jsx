import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import HospitalMap from "../components/HospitalMap";
import { strategyColors } from "../data/mapData";

export default function TaskDispatch() {
  const { map, task, routes, bestRoute, robots, activeTasks, setTask, planRoutes, dispatchTask, addLog } = useAppStore();
  const [cargo, setCargo] = useState("药品");
  const [priority, setPriority] = useState(2);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("time");

  const pointNames = Object.keys(map.points);

  const handleCalcRoutes = () => {
    if (!task.start || !task.end || task.start === task.end) return;
    const result = planRoutes();
    if (result.bestRoute) {
      setSelectedStrategy(result.bestRoute.strategy);
    }
  };

  const handleDispatch = () => {
    if (!selectedRobot) return;
    if (!routes.length) return;
    const route = routes.find((r) => r.strategy === selectedStrategy);
    if (!route?.reachable) return;

    const robot = robots.find((r) => r.id === selectedRobot);
    dispatchTask({
      from: task.start,
      to: task.end,
      cargo,
      priority,
      robotId: selectedRobot,
      route: route,
      pathName: route.name,
    });

    addLog(`✅ 任务已派发 → ${robot?.name} (${route.name})`);
  };

  // Available robots: idle + battery > 30%
  const availableRobots = robots.filter((r) => r.status === "idle" && r.battery > 30);

  const selectedRoute = routes.find((r) => r.strategy === selectedStrategy) || null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">📦 任务派发</h2>

      {/* Task Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">创建任务</h3>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">起点</label>
            <select
              value={task.start}
              onChange={(e) => setTask({ ...task, start: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {pointNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">终点</label>
            <select
              value={task.end}
              onChange={(e) => setTask({ ...task, end: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {pointNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">货物类型</label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option>药品</option>
              <option>血液样本</option>
              <option>医疗器材</option>
              <option>餐食</option>
              <option>文件</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value={1}>低</option>
              <option value={2}>普通</option>
              <option value={3}>高</option>
            </select>
          </div>
          <div className="col-span-2">
            <button
              onClick={handleCalcRoutes}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium w-full"
            >
              🔍 计算推荐路径
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <HospitalMap
          mapData={map}
          routes={routes}
          highlightRoute={selectedRoute}
        />
      </div>

      {/* Route Cards */}
      {routes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {routes.map((route) => {
            const color = strategyColors[route.strategy];
            const isSelected = selectedStrategy === route.strategy;
            return (
              <div
                key={route.strategy}
                onClick={() => route.reachable && setSelectedStrategy(route.strategy)}
                className={`cursor-pointer bg-white border-2 rounded-lg p-4 shadow-sm transition ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                } ${!route.reachable ? "opacity-50" : ""}`}
              >
                <div className="text-sm font-bold mb-2" style={{ color }}>
                  {route.name}
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div>长度: {route.length} 步</div>
                  <div>转弯: {route.turns} 次</div>
                  <div>时间: {route.estimatedMinutes} 分钟</div>
                  <div>能耗: {route.energy}</div>
                  <div>评分: <span className="font-bold text-blue-600">{route.score}</span></div>
                </div>
                {isSelected && <div className="mt-2 text-xs text-blue-600 font-medium">✅ 已选中</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Robot Selection & Dispatch */}
      {routes.some((r) => r.reachable) && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">选择机器人 (空闲且电量 &gt; 30%)</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {availableRobots.length === 0 ? (
              <div className="col-span-4 text-slate-400 text-sm">暂无可用机器人</div>
            ) : (
              availableRobots.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRobot(r.id)}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition ${
                    selectedRobot === r.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-700">{r.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    电量: {r.battery}% | 速度: {r.speed}m/s
                  </div>
                  <div className="text-xs text-slate-400">位置: ({r.pos[0]}, {r.pos[1]})</div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={handleDispatch}
            disabled={!selectedRobot || !routes.some((r) => r.reachable)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50"
          >
            📤 派发任务
          </button>
        </div>
      )}

      {/* Active Tasks */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">📋 当前任务列表 ({activeTasks.length})</h3>
        {activeTasks.length === 0 ? (
          <div className="text-slate-400 text-sm">暂无活跃任务</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500">
                <th className="pb-2">任务ID</th>
                <th className="pb-2">起点</th>
                <th className="pb-2">终点</th>
                <th className="pb-2">货物</th>
                <th className="pb-2">路径</th>
                <th className="pb-2">机器人</th>
                <th className="pb-2">状态</th>
                <th className="pb-2">时间</th>
              </tr>
            </thead>
            <tbody>
              {activeTasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-xs">{t.id}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>{t.cargo}</td>
                  <td>{t.pathName}</td>
                  <td>{t.robotId}</td>
                  <td>
                    <span className="text-green-600">{t.status}</span>
                  </td>
                  <td className="text-xs text-slate-400">{t.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
