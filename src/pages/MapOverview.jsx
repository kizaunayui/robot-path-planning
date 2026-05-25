import { useState } from 'react';
import HospitalMap from '../components/HospitalMap';
import { AREA_TYPES, robots } from '../data/mockData';

export default function MapOverview() {
  const [showRobots, setShowRobots] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showCostHeatmap, setShowCostHeatmap] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🗺️ 医院地图总览</h2>
      <p className="text-slate-400 text-sm">
        基于 hospital_map_semantic_modeling 构建的语义地图。悬停节点查看区域类型和代价信息。
        包含 {Object.keys(AREA_TYPES).length} 种区域类型、25个关键节点、48条可通行边。
      </p>

      {/* 控制面板 */}
      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showRobots} onChange={() => setShowRobots(!showRobots)} />
          显示机器人 ({robots.length}台)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showEdges} onChange={() => setShowEdges(!showEdges)} />
          显示图拓扑边
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showCostHeatmap} onChange={() => setShowCostHeatmap(!showCostHeatmap)} />
          代价热力图
        </label>
      </div>

      {/* 地图 */}
      <HospitalMap
        showRobots={showRobots}
        showEdges={showEdges}
        showCostHeatmap={showCostHeatmap}
        width={760}
        height={600}
      />

      {/* 区域类型说明 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(AREA_TYPES).map(area => (
          <div key={area.id} className="border border-slate-700 rounded p-3 text-sm" style={{ backgroundColor: area.color + '15' }}>
            <div className="font-semibold text-white">{area.name}</div>
            <div className="text-slate-400">路径代价: {area.cost}</div>
            <div className="text-slate-400">缓冲距离: {area.buffer}m</div>
          </div>
        ))}
      </div>

      {/* 机器人状态 */}
      <div>
        <h3 className="font-bold mb-2">🤖 机器人状态</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {robots.map(r => (
            <div key={r.id} className="border border-slate-700 rounded p-2 text-sm">
              <div className="font-semibold text-white">{r.name}</div>
              <div className="text-slate-500">{r.id} | {r.type}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs text-white ${
                  r.status === 'running' ? 'bg-green-500' :
                  r.status === 'idle' ? 'bg-orange-500' :
                  r.status === 'charging' ? 'bg-blue-500' : 'bg-red-500'
                }`}>{r.status === 'running' ? '运行中' : r.status === 'idle' ? '待机' : r.status === 'charging' ? '充电中' : '故障'}</span>
                <span className="text-xs text-slate-300">🔋 {r.battery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
