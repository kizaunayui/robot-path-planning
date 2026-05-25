import { useState, useRef, useEffect, useCallback } from 'react';
import { mapNodes, mapEdges, nodeTypeColors, nodeTypeNames } from '../data/mapData';
import { findPath } from '../utils/pathfinding';
import { useAppStore } from '../store/AppStore';

export default function SimulationSandbox() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { robots, simLogs, addSimLog } = useAppStore();
  const [simState, setSimState] = useState('stopped'); // running | paused | stopped
  const [speed, setSpeed] = useState(1);
  const [simTime, setSimTime] = useState(0);
  const [simRobots, setSimRobots] = useState([]);
  const [stats, setStats] = useState({ collisions: 0, avgSpeed: 0, completion: 0 });

  // Initialize sim robots with paths
  useEffect(() => {
    const r1Path = findPath(mapNodes, mapEdges, '1F-entrance', '1F-ward101');
    const r2Path = findPath(mapNodes, mapEdges, '1F-pharmacy', '1F-emergency');
    const r3Path = findPath(mapNodes, mapEdges, '2F-lab', '2F-or1');

    setSimRobots([
      { id: 'R1', path: r1Path.path, progress: 0, color: '#2196f3', floor: '1F' },
      { id: 'R2', path: r2Path.path, progress: 0, color: '#4caf50', floor: '1F' },
      { id: 'R3', path: r3Path.path, progress: 0, color: '#ff9800', floor: '2F' },
    ]);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (simState !== 'running') return;
    const interval = setInterval(() => {
      setSimTime(t => t + 1);
      setSimRobots(prev => prev.map(r => {
        if (r.path.length < 2) return r;
        const newProgress = r.progress + 0.01 * speed;
        if (newProgress >= 1) {
          addSimLog(`🤖 ${r.id} 到达目标`);
          return { ...r, progress: 1 };
        }
        return { ...r, progress: newProgress };
      }));
      // Stats
      setStats(prev => ({
        collisions: prev.collisions + (Math.random() < 0.005 ? 1 : 0),
        avgSpeed: (1.0 + Math.random() * 0.3).toFixed(1),
        completion: Math.round(simRobots.reduce((s, r) => s + r.progress, 0) / simRobots.length * 100),
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [simState, speed, simRobots.length]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 800;
    canvas.width = W; canvas.height = H;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Nodes
    mapNodes.forEach(n => {
      ctx.fillStyle = nodeTypeColors[n.type] || '#9e9e9e';
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Edges
    mapEdges.filter(e => !e.isElevator).forEach(e => {
      const fn = mapNodes.find(n => n.id === e.from);
      const tn = mapNodes.find(n => n.id === e.to);
      if (!fn || !tn) return;
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fn.x, fn.y); ctx.lineTo(tn.x, tn.y); ctx.stroke();
    });

    // Paths
    simRobots.forEach(r => {
      if (r.path.length < 2) return;
      ctx.strokeStyle = r.color; ctx.lineWidth = 3; ctx.globalAlpha = 0.4; ctx.setLineDash([6, 4]);
      ctx.beginPath();
      r.path.forEach((nid, i) => {
        const n = mapNodes.find(nd => nd.id === nid);
        if (!n) return;
        if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    });

    // Robot positions
    simRobots.forEach(r => {
      if (r.path.length < 2) return;
      const idx = Math.floor(r.progress * (r.path.length - 1));
      const frac = (r.progress * (r.path.length - 1)) - idx;
      const n1 = mapNodes.find(n => n.id === r.path[idx]);
      const n2 = mapNodes.find(n => n.id === r.path[Math.min(idx + 1, r.path.length - 1)]);
      if (!n1 || !n2) return;
      const bx = n1.x + (n2.x - n1.x) * frac;
      const by = n1.y + (n2.y - n1.y) * frac;

      // Trail
      ctx.fillStyle = r.color; ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Robot
      ctx.fillStyle = r.color;
      ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(r.id, bx, by);
    });

    // Time
    ctx.fillStyle = '#37474f'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`仿真时间: ${simTime}s`, 20, 30);

  }, [simRobots, simTime]);

  const handleStart = () => { setSimState('running'); addSimLog('▶️ 仿真启动'); };
  const handlePause = () => { setSimState('paused'); addSimLog('⏸️ 仿真暂停'); };
  const handleStop = () => {
    setSimState('stopped'); setSimTime(0);
    setSimRobots(prev => prev.map(r => ({ ...r, progress: 0 })));
    setStats({ collisions: 0, avgSpeed: 0, completion: 0 });
    addSimLog('⏹️ 仿真停止');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">🎮 仿真沙盒</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-4">
        <button onClick={handleStart} disabled={simState === 'running'}
          className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">▶️ 启动</button>
        <button onClick={handlePause} disabled={simState !== 'running'}
          className="px-4 py-2 rounded text-sm bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50">⏸️ 暂停</button>
        <button onClick={handleStop}
          className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700">⏹️ 停止</button>
        <span className="w-px h-6 bg-slate-300" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">倍速:</span>
          {[1, 2, 4, 8].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs ${speed === s ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
              {s}x
            </button>
          ))}
        </div>
        <span className="w-px h-6 bg-slate-300" />
        <span className="text-sm text-slate-600">时间: {simTime}s</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${simState === 'running' ? 'bg-green-100 text-green-700' : simState === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
          {simState === 'running' ? '运行中' : simState === 'paused' ? '已暂停' : '已停止'}
        </span>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <canvas ref={canvasRef} className="w-full border border-slate-300 rounded" style={{ maxHeight: '500px', aspectRatio: '3/2' }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.collisions}</div>
          <div className="text-xs text-slate-500">碰撞次数</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avgSpeed} m/s</div>
          <div className="text-xs text-slate-500">平均速度</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completion}%</div>
          <div className="text-xs text-slate-500">完成率</div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-2">📋 仿真日志</h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {simLogs.length === 0 ? (
            <div className="text-slate-400 text-xs">暂无日志</div>
          ) : (
            simLogs.map((log, i) => (
              <div key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-slate-400 font-mono">{log.time}</span>
                <span>{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
