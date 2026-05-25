import { useRef, useEffect, useState, useCallback } from 'react';
import { mapNodes, mapEdges, mapAreas, nodeTypeColors, nodeTypeNames } from '../data/mapData';

export default function HospitalMap({ floor, robots = [], selectedRoute = null, onNodeClick, onRobotClick }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [animBallPos, setAnimBallPos] = useState(0);

  // Filter data by floor
  const floorNodes = mapNodes.filter(n => n.floor === floor);
  const floorEdges = mapEdges.filter(e => e.floor === floor);
  const floorAreas = mapAreas.filter(a => a.floor === floor);
  const floorRobots = robots.filter(r => r.floor === floor);

  // Get node position by id
  const nodeMap = new Map(mapNodes.map(n => [n.id, n]));

  // Animation for path ball
  useEffect(() => {
    if (!selectedRoute?.path?.length || selectedRoute.path.length < 2) return;
    let progress = 0;
    const animate = () => {
      progress += 0.005;
      if (progress > 1) progress = 0;
      setAnimBallPos(progress);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selectedRoute]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 800;
    canvas.width = W;
    canvas.height = H;

    // Clear
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Draw areas
    floorAreas.forEach(a => {
      ctx.fillStyle = a.color || '#e3f2fd';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 1;
      ctx.strokeRect(a.x, a.y, a.w, a.h);
      // Label
      ctx.fillStyle = '#546e7a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name, a.x + a.w / 2, a.y + 18);
    });

    // Draw edges
    floorEdges.forEach(e => {
      const fromNode = nodeMap.get(e.from);
      const toNode = nodeMap.get(e.to);
      if (!fromNode || !toNode) return;
      ctx.strokeStyle = e.isElevator ? '#9c27b0' : '#b0bec5';
      ctx.lineWidth = e.isElevator ? 3 : 2;
      if (e.isElevator) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Distance label
      const mx = (fromNode.x + toNode.x) / 2;
      const my = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = '#78909c';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${e.distance}m`, mx, my - 6);
    });

    // Draw selected route paths
    const routeColors = { '最优路径A': '#4caf50', '备用路径B': '#ff9800', '应急路径C': '#f44336' };
    if (selectedRoute?.path?.length > 1) {
      const color = routeColors[selectedRoute.label] || '#4caf50';
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      for (let i = 0; i < selectedRoute.path.length; i++) {
        const nd = nodeMap.get(selectedRoute.path[i]);
        if (!nd) continue;
        if (i === 0) ctx.moveTo(nd.x, nd.y);
        else ctx.lineTo(nd.x, nd.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Animated ball
      if (selectedRoute.path.length >= 2) {
        const idx = Math.floor(animBallPos * (selectedRoute.path.length - 1));
        const frac = (animBallPos * (selectedRoute.path.length - 1)) - idx;
        const n1 = nodeMap.get(selectedRoute.path[idx]);
        const n2 = nodeMap.get(selectedRoute.path[Math.min(idx + 1, selectedRoute.path.length - 1)]);
        if (n1 && n2) {
          const bx = n1.x + (n2.x - n1.x) * frac;
          const by = n1.y + (n2.y - n1.y) * frac;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(bx, by, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    floorNodes.forEach(n => {
      const color = nodeTypeColors[n.type] || '#9e9e9e';
      const isHovered = hoveredNode === n.id;
      const radius = isHovered ? 16 : 12;

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isHovered ? '#fff' : '#37474f';
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.stroke();

      // Icon text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconMap = {
        pharmacy: '药', nurse_station: '护', ward: '病', lab: '检',
        operating_room: '术', elevator: '梯', charging_station: '充',
        storage: '库', outpatient: '门', emergency: '急',
        transfer_point: '交', corridor_intersection: '●',
      };
      ctx.fillText(iconMap[n.type] || '●', n.x, n.y);

      // Name label
      ctx.fillStyle = '#263238';
      ctx.font = '11px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(n.name, n.x, n.y + radius + 4);
    });

    // Draw robots
    floorRobots.forEach(r => {
      // Blue circle
      ctx.fillStyle = r.status === 'charging' ? '#ffc107' : r.status === 'running' ? '#2196f3' : '#42a5f5';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Robot ID
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.id, r.x, r.y);

      // Battery bar
      const bw = 24, bh = 4;
      const bx = r.x - bw / 2, by = r.y + 18;
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(bx, by, bw, bh);
      const batColor = r.battery > 60 ? '#4caf50' : r.battery > 30 ? '#ff9800' : '#f44336';
      ctx.fillStyle = batColor;
      ctx.fillRect(bx, by, bw * (r.battery / 100), bh);

      // Name
      ctx.fillStyle = '#1565c0';
      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(r.name, r.x, by + 8);
    });

  }, [floor, floorNodes, floorEdges, floorAreas, floorRobots, hoveredNode, selectedRoute, animBallPos]);

  // Mouse interaction
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1200 / rect.width;
    const scaleY = 800 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Check robots first
    for (const r of floorRobots) {
      if (Math.hypot(mx - r.x, my - r.y) < 18) {
        setSelectedItem({ type: 'robot', data: r });
        onRobotClick?.(r);
        return;
      }
    }
    // Check nodes
    for (const n of floorNodes) {
      if (Math.hypot(mx - n.x, my - n.y) < 16) {
        setSelectedItem({ type: 'node', data: n });
        onNodeClick?.(n);
        return;
      }
    }
    setSelectedItem(null);
  }, [floorNodes, floorRobots, onNodeClick, onRobotClick]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1200 / rect.width;
    const scaleY = 800 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (const n of floorNodes) {
      if (Math.hypot(mx - n.x, my - n.y) < 16) {
        setHoveredNode(n.id);
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    for (const r of floorRobots) {
      if (Math.hypot(mx - r.x, my - r.y) < 18) {
        setHoveredNode(null);
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    setHoveredNode(null);
    canvas.style.cursor = 'default';
  }, [floorNodes, floorRobots]);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          className="w-full border border-slate-300 rounded-lg shadow-lg bg-white"
          style={{ maxHeight: '600px', aspectRatio: '3/2' }}
        />
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(nodeTypeNames).map(([type, name]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: nodeTypeColors[type] }} />
              <span className="text-slate-600">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="w-[260px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">📋 信息面板</h3>
        {selectedItem ? (
          <div className="space-y-2 text-xs">
            {selectedItem.type === 'robot' ? (
              <>
                <div className="text-blue-600 font-bold text-sm">🤖 {selectedItem.data.name}</div>
                <div><span className="text-slate-500">ID:</span> {selectedItem.data.id}</div>
                <div><span className="text-slate-500">楼层:</span> {selectedItem.data.floor}</div>
                <div><span className="text-slate-500">状态:</span> <span className={selectedItem.data.status === 'idle' ? 'text-green-600' : selectedItem.data.status === 'charging' ? 'text-yellow-600' : 'text-blue-600'}>{selectedItem.data.status}</span></div>
                <div><span className="text-slate-500">电量:</span> {selectedItem.data.battery}%</div>
                <div><span className="text-slate-500">速度:</span> {selectedItem.data.speed}m/s</div>
              </>
            ) : (
              <>
                <div className="text-purple-600 font-bold text-sm">{nodeTypeNames[selectedItem.data.type] || '节点'} {selectedItem.data.name}</div>
                <div><span className="text-slate-500">ID:</span> {selectedItem.data.id}</div>
                <div><span className="text-slate-500">类型:</span> {nodeTypeNames[selectedItem.data.type]}</div>
                <div><span className="text-slate-500">坐标:</span> ({selectedItem.data.x}, {selectedItem.data.y})</div>
                {selectedItem.data.description && <div><span className="text-slate-500">描述:</span> {selectedItem.data.description}</div>}
              </>
            )}
          </div>
        ) : (
          <div className="text-slate-400 text-xs">点击节点或机器人查看详情</div>
        )}

        {/* Route Info */}
        {selectedRoute?.reachable && (
          <div className="mt-4 pt-3 border-t space-y-1 text-xs">
            <div className="text-green-600 font-bold text-sm">🛤️ {selectedRoute.label}</div>
            <div><span className="text-slate-500">距离:</span> {selectedRoute.distance}m</div>
            <div><span className="text-slate-500">时间:</span> {selectedRoute.time}分钟</div>
            <div><span className="text-slate-500">电量:</span> {selectedRoute.energy}%</div>
            <div><span className="text-slate-500">风险:</span> <span className={selectedRoute.risk === 'high' ? 'text-red-600' : selectedRoute.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}>{selectedRoute.risk}</span></div>
            <div className="text-slate-500">路径: {selectedRoute.path.join(' → ')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
