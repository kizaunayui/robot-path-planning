import { useState } from 'react';
import HospitalMap from '../components/HospitalMap';
import { mapNodes, mapEdges, mapFloors } from '../data/mapData';
import { findPath } from '../utils/pathfinding';
import { useAppStore } from '../store/AppStore';

export default function PathPlan() {
  const [floor, setFloor] = useState('1F');
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [algorithm, setAlgorithm] = useState('astar');
  const [result, setResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const { robots } = useAppStore();

  const handlePlan = () => {
    if (!startId || !endId) return alert('请选择起点和终点');
    if (startId === endId) return alert('起点和终点不能相同');

    const route = findPath(mapNodes, mapEdges, startId, endId, { algorithm });
    setResult(route);
    setSelectedRoute(route);

    // Auto switch floor to start node
    const startNode = mapNodes.find(n => n.id === startId);
    if (startNode) setFloor(startNode.floor);
  };

  const floorNodes = mapNodes.filter(n => n.floor === floor);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">📐 路径规划</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">起点</label>
            <select value={startId} onChange={e => setStartId(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">选择起点</option>
              {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.floor})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">终点</label>
            <select value={endId} onChange={e => setEndId(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">选择终点</option>
              {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.floor})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">楼层</label>
            <select value={floor} onChange={e => setFloor(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              {mapFloors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">算法</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="astar">A* 算法</option>
              <option value="rrt">RRT* 算法</option>
              <option value="hybrid">混合算法</option>
            </select>
          </div>
          <button onClick={handlePlan} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm font-medium">
            🚀 开始规划
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <HospitalMap floor={floor} robots={robots} selectedRoute={selectedRoute} />
      </div>

      {/* Result Cards */}
      {result && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500">总距离</div>
            <div className="text-2xl font-bold text-blue-600">{result.distance}m</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500">预计时间</div>
            <div className="text-2xl font-bold text-green-600">{result.time}分钟</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500">电量消耗</div>
            <div className="text-2xl font-bold text-yellow-600">{result.energy}%</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500">风险等级</div>
            <div className={`text-2xl font-bold ${result.risk === 'high' ? 'text-red-600' : result.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{result.risk}</div>
          </div>
        </div>
      )}

      {/* Path nodes */}
      {result?.reachable && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-2">📍 路径节点序列</h3>
          <div className="flex flex-wrap gap-2">
            {result.path.map((nodeId, i) => {
              const node = mapNodes.find(n => n.id === nodeId);
              return (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{node?.name || nodeId}</span>
                  {i < result.path.length - 1 && <span className="text-slate-400">→</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {!result?.reachable && result && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
          ⚠️ {result.reason || '无法到达目标节点'}
        </div>
      )}
    </div>
  );
}
