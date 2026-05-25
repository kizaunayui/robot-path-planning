import { useState } from 'react';
import { mapNodes, mapEdges } from '../data/mapData';
import { findMultiplePaths } from '../utils/pathfinding';
import { useAppStore } from '../store/AppStore';
import HospitalMap from '../components/HospitalMap';

export default function TaskDispatch() {
  const { robots, dispatchTask, activeTasks, addDispatchLog } = useAppStore();
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [cargo, setCargo] = useState('药品');
  const [priority, setPriority] = useState('normal');
  const [routes, setRoutes] = useState(null);
  const [selectedRouteKey, setSelectedRouteKey] = useState('routeA');
  const [selectedRobot, setSelectedRobot] = useState('');
  const [floor, setFloor] = useState('1F');

  const handleCalcRoutes = () => {
    if (!startId || !endId) return alert('请选择起点和终点');
    const r = findMultiplePaths(mapNodes, mapEdges, startId, endId);
    setRoutes(r);
    setSelectedRouteKey('routeA');
    // Auto switch floor
    const sn = mapNodes.find(n => n.id === startId);
    if (sn) setFloor(sn.floor);
  };

  const handleDispatch = () => {
    if (!selectedRobot) return alert('请选择机器人');
    if (!routes) return alert('请先计算路径');
    const route = routes[selectedRouteKey];
    if (!route?.reachable) return alert('所选路径不可达');

    const robot = robots.find(r => r.id === selectedRobot);
    const task = {
      id: `T${Date.now()}`,
      from: mapNodes.find(n => n.id === startId)?.name || startId,
      to: mapNodes.find(n => n.id === endId)?.name || endId,
      cargo,
      priority,
      path: route.label,
      robot: selectedRobot,
      status: '执行中',
      progress: 0,
    };
    dispatchTask(task);
    addDispatchLog(`✅ 任务已派发: ${task.id} → ${robot?.name} (${route.label})`);
    alert(`任务 ${task.id} 已派发给 ${robot?.name}`);
  };

  // Available robots: idle + battery > 30%
  const availableRobots = robots.filter(r => r.status === 'idle' && r.battery > 30);

  const selectedRoute = routes?.[selectedRouteKey] || null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">📦 任务派发</h2>

      {/* Task Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">创建任务</h3>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">起点</label>
            <select value={startId} onChange={e => setStartId(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">选择起点</option>
              {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">终点</label>
            <select value={endId} onChange={e => setEndId(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">选择终点</option>
              {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">货物类型</label>
            <select value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option>药品</option>
              <option>血液样本</option>
              <option>医疗器材</option>
              <option>餐食</option>
              <option>文件</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">优先级</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="low">低</option>
              <option value="normal">普通</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">楼层</label>
            <select value={floor} onChange={e => setFloor(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="1F">一层</option>
              <option value="2F">二层</option>
              <option value="3F">三层</option>
            </select>
          </div>
          <button onClick={handleCalcRoutes} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
            🔍 计算推荐路径
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <HospitalMap floor={floor} robots={robots} selectedRoute={selectedRoute} />
      </div>

      {/* Route Cards */}
      {routes && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'routeA', data: routes.routeA, color: 'green' },
            { key: 'routeB', data: routes.routeB, color: 'yellow' },
            { key: 'routeC', data: routes.routeC, color: 'red' },
          ].map(({ key, data, color }) => (
            <div
              key={key}
              onClick={() => setSelectedRouteKey(key)}
              className={`cursor-pointer bg-white border-2 rounded-lg p-4 shadow-sm transition ${
                selectedRouteKey === key ? `border-${color}-500 bg-${color}-50` : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`text-sm font-bold text-${color}-600 mb-2`}>{data.label}</div>
              <div className="space-y-1 text-xs text-slate-600">
                <div>距离: {data.distance}m</div>
                <div>时间: {data.time}分钟</div>
                <div>电量: {data.energy}%</div>
                <div>风险: <span className={data.risk === 'high' ? 'text-red-600' : data.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}>{data.risk}</span></div>
              </div>
              {selectedRouteKey === key && <div className="mt-2 text-xs text-blue-600 font-medium">✅ 已选中</div>}
            </div>
          ))}
        </div>
      )}

      {/* Robot Selection & Dispatch */}
      {routes?.routeA?.reachable && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">选择机器人 (空闲且电量 &gt; 30%)</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {availableRobots.length === 0 ? (
              <div className="col-span-4 text-slate-400 text-sm">暂无可用机器人</div>
            ) : (
              availableRobots.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRobot(r.id)}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition ${
                    selectedRobot === r.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-700">{r.name}</div>
                  <div className="text-xs text-slate-500 mt-1">电量: {r.battery}% | 速度: {r.speed}m/s</div>
                  <div className="text-xs text-slate-400">{r.floor}</div>
                </div>
              ))
            )}
          </div>
          <button onClick={handleDispatch} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm font-medium">
            📤 派发任务
          </button>
        </div>
      )}

      {/* Active Tasks */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">📋 当前任务列表</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="pb-2">任务ID</th><th className="pb-2">起点</th><th className="pb-2">终点</th>
              <th className="pb-2">货物</th><th className="pb-2">路径</th><th className="pb-2">机器人</th>
              <th className="pb-2">状态</th><th className="pb-2">进度</th>
            </tr>
          </thead>
          <tbody>
            {activeTasks.map(t => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="py-2">{t.id}</td><td>{t.from}</td><td>{t.to}</td>
                <td>{t.cargo}</td><td>{t.path}</td><td>{t.robot}</td>
                <td><span className="text-green-600">{t.status}</span></td>
                <td>{t.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
