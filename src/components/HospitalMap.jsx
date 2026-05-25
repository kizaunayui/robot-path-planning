import { useRef, useEffect, useState, useCallback } from 'react';
import { mapNodes, mapEdges, wallSegments, doorSegments, windowSegments, AREA_TYPES, robots as defaultRobots, navMeshTriangles, uwbAnchors, chargingStations } from '../data/mockData';

// 颜色映射
const AREA_COLORS = {};
Object.values(AREA_TYPES).forEach(a => { AREA_COLORS[a.id] = a.color; });

const ROBOT_COLORS = {
  running: '#4caf50',
  idle: '#ff9800',
  charging: '#2196f3',
  error: '#f44336',
};

export default function HospitalMap({
  showRobots = true,
  showEdges = true,
  showNavMesh = false,
  showCostHeatmap = false,
  showUWB = false,
  showCharging = false,
  showHeatmap = false,
  showCollisionCones = false,
  showSignals = false,
  selectedPath = null,
  paths = [],
  obstacles = [],
  collisionCones = [],
  signals = [],
  navMeshTriangles: navMeshTrianglesProp = null,
  uwbStations = null,
  robots: robotsProp = null,
  costMap = null,
  onNodeClick = null,
  onClick = null,
  highlightAreas = [],
  width = 760,
  height = 600,
}) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [animFrame, setAnimFrame] = useState(0);

  // 使用传入的 robots 或默认数据
  const activeRobots = robotsProp || defaultRobots;
  const activeNavMesh = navMeshTrianglesProp || navMeshTriangles;
  const activeUWB = uwbStations || uwbAnchors;
  const activeHeatmap = showHeatmap || showCostHeatmap;

  // 动画循环
  useEffect(() => {
    if (!showRobots) return;
    const timer = setInterval(() => setAnimFrame(f => f + 1), 100);
    return () => clearInterval(timer);
  }, [showRobots]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // 绘制区域底色
    drawSemanticAreas(ctx);

    // 绘制代价热力图
    if (activeHeatmap) drawCostHeatmap(ctx);

    // 绘制墙壁
    drawWalls(ctx);

    // 绘制门
    drawDoors(ctx);

    // 绘制窗户
    drawWindows(ctx);

    // 绘制图拓扑边
    if (showEdges) drawGraphEdges(ctx);

    // 绘制 NavMesh 三角网格
    if (showNavMesh) drawNavMesh(ctx);

    // 绘制路径（支持多路径和单路径）
    if (paths.length > 0) {
      paths.forEach(p => drawMultiPath(ctx, p));
    }
    if (selectedPath) drawPath(ctx, selectedPath);

    // 绘制障碍物
    if (obstacles.length > 0) drawObstacles(ctx);

    // 绘制碰撞锥
    if (showCollisionCones && collisionCones.length > 0) drawCollisionCones(ctx);

    // 绘制图节点
    drawNodes(ctx);

    // 绘制 UWB 基站
    if (showUWB) drawUWB(ctx);

    // 绘制充电桩
    if (showCharging) drawChargingStations(ctx);

    // 绘制交通信号
    if (showSignals && signals.length > 0) drawSignals(ctx);

    // 绘制机器人
    if (showRobots) drawRobots(ctx);

    // 绘制高亮区域
    if (highlightAreas.length > 0) drawHighlightAreas(ctx);

    // 绘制图例
    drawLegend(ctx);

  }, [showRobots, showEdges, showNavMesh, activeHeatmap, showUWB, showCharging, showCollisionCones, showSignals, selectedPath, paths, obstacles, collisionCones, signals, highlightAreas, animFrame, hoveredNode, activeRobots, activeNavMesh, activeUWB, costMap]);

  useEffect(() => { draw(); }, [draw]);

  // 语义区域绘制
  function drawSemanticAreas(ctx) {
    const areaGroups = {};
    mapNodes.forEach(n => {
      if (!areaGroups[n.area]) areaGroups[n.area] = [];
      areaGroups[n.area].push(n);
    });

    Object.entries(areaGroups).forEach(([areaId, nodes]) => {
      const areaType = Object.values(AREA_TYPES).find(a => a.id === areaId);
      if (!areaType || nodes.length < 3) return;

      ctx.save();
      ctx.fillStyle = areaType.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      const sorted = [...nodes].sort((a, b) => a.x - b.x || a.y - b.y);
      ctx.moveTo(sorted[0].x, sorted[0].y);
      sorted.forEach(n => ctx.lineTo(n.x, n.y));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // 代价热力图
  function drawCostHeatmap(ctx) {
    mapNodes.forEach(node => {
      const areaType = Object.values(AREA_TYPES).find(a => a.id === node.area);
      if (!areaType) return;
      // 如果有 costMap，使用自定义代价
      let cost = areaType.cost;
      if (costMap && costMap[node.area] !== undefined) {
        cost = costMap[node.area];
      }
      const intensity = Math.min(cost / 10, 1);
      const radius = 30;
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
      gradient.addColorStop(0, `rgba(255, ${Math.round(255 * (1 - intensity))}, 0, 0.4)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2);
    });
  }

  // 墙壁
  function drawWalls(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    wallSegments.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    });
  }

  // 门
  function drawDoors(ctx) {
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    doorSegments.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // 窗户
  function drawWindows(ctx) {
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 3;
    ctx.setLineDash([3, 3]);
    windowSegments.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // 图拓扑边
  function drawGraphEdges(ctx) {
    mapEdges.forEach(edge => {
      const from = mapNodes.find(n => n.id === edge.source);
      const to = mapNodes.find(n => n.id === edge.target);
      if (!from || !to) return;

      ctx.save();
      const costNorm = Math.min(edge.cost / 20, 1);
      ctx.strokeStyle = `rgba(${Math.round(255 * costNorm)}, ${Math.round(100 * (1 - costNorm))}, 50, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  // NavMesh 三角网格
  function drawNavMesh(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
    activeNavMesh.forEach(tri => {
      ctx.beginPath();
      ctx.moveTo(tri.vertices[0][0], tri.vertices[0][1]);
      ctx.lineTo(tri.vertices[1][0], tri.vertices[1][1]);
      ctx.lineTo(tri.vertices[2][0], tri.vertices[2][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  // 多路径绘制（动画路径）
  function drawMultiPath(ctx, pathData) {
    const { nodes: pathNodes, color = '#3b82f6', width: lineWidth = 3 } = pathData;
    if (!pathNodes || pathNodes.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(pathNodes[0][0], pathNodes[0][1]);
    for (let i = 1; i < pathNodes.length; i++) {
      ctx.lineTo(pathNodes[i][0], pathNodes[i][1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 单路径绘制
  function drawPath(ctx, path) {
    const coords = path.coords || path.nodes;
    if (!coords || coords.length < 2) return;
    ctx.save();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 起点
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(coords[0][0], coords[0][1], 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('起', coords[0][0], coords[0][1] + 4);

    // 终点
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    const last = coords[coords.length - 1];
    ctx.arc(last[0], last[1], 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('终', last[0], last[1] + 4);
    ctx.restore();
  }

  // 障碍物
  function drawObstacles(ctx) {
    ctx.save();
    obstacles.forEach(obs => {
      ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius || 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();
  }

  // 碰撞锥
  function drawCollisionCones(ctx) {
    ctx.save();
    collisionCones.forEach(cone => {
      const { x, y, dx, dy, spread } = cone;
      const angle = Math.atan2(dy, dx);
      const len = 80;
      const leftAngle = angle - spread;
      const rightAngle = angle + spread;

      ctx.fillStyle = 'rgba(255, 87, 34, 0.15)';
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(leftAngle) * len, y + Math.sin(leftAngle) * len);
      ctx.lineTo(x + Math.cos(rightAngle) * len, y + Math.sin(rightAngle) * len);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  // 交通信号
  function drawSignals(ctx) {
    ctx.save();
    signals.forEach(sig => {
      const color = sig.status === 'green' ? '#4caf50' : sig.status === 'red' ? '#f44336' : '#ff9800';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sig.x, sig.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sig.location || sig.id, sig.x, sig.y - 12);
    });
    ctx.restore();
  }

  // 图节点
  function drawNodes(ctx) {
    mapNodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const areaType = Object.values(AREA_TYPES).find(a => a.id === node.area);
      const nodeColor = areaType ? areaType.color : '#90a4ae';

      ctx.save();
      ctx.fillStyle = isHovered ? '#ff9800' : nodeColor;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered ? 10 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      let icon = '';
      if (node.type === 'doorway') icon = '门';
      else if (node.type === 'elevator') icon = '梯';
      else if (node.type === 'corner') icon = '角';
      else if (node.type === 'charging') icon = '充';
      else icon = '●';
      ctx.fillText(icon, node.x, node.y + 3);

      if (isHovered) {
        ctx.fillStyle = '#333';
        ctx.font = '11px sans-serif';
        ctx.fillText(node.label, node.x, node.y - 15);

        if (areaType) {
          ctx.fillStyle = '#666';
          ctx.font = '9px sans-serif';
          ctx.fillText(`区域: ${areaType.name} | 代价: ${areaType.cost}`, node.x, node.y - 2);
          ctx.fillText(`缓冲: ${areaType.buffer}m`, node.x, node.y + 10);
        }
      }
      ctx.restore();
    });
  }

  // UWB 基站
  function drawUWB(ctx) {
    activeUWB.forEach(anchor => {
      ctx.save();
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, anchor.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('U', anchor.x, anchor.y + 3);

      ctx.fillStyle = '#1565c0';
      ctx.font = '9px sans-serif';
      ctx.fillText(anchor.id, anchor.x, anchor.y - 10);
      ctx.restore();
    });
  }

  // 充电桩
  function drawChargingStations(ctx) {
    chargingStations.forEach(cs => {
      ctx.save();
      const color = cs.status === 'available' || cs.status === 'idle' ? '#4caf50' : cs.status === 'occupied' ? '#ff9800' : '#f44336';
      ctx.fillStyle = color;
      ctx.fillRect(cs.x - 10, cs.y - 10, 20, 20);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(cs.x - 10, cs.y - 10, 20, 20);

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', cs.x, cs.y + 4);

      ctx.fillStyle = '#333';
      ctx.font = '8px sans-serif';
      ctx.fillText(cs.id, cs.x, cs.y - 14);
      ctx.restore();
    });
  }

  // 机器人
  function drawRobots(ctx) {
    activeRobots.forEach(robot => {
      const t = animFrame * 0.05;
      let rx = robot.x + Math.sin(t + (robot.id.charCodeAt(1) || 0)) * 20;
      let ry = robot.y + Math.cos(t + (robot.id.charCodeAt(2) || 0)) * 15;

      ctx.save();
      const statusColor = robot.color || ROBOT_COLORS[robot.status] || '#9e9e9e';
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(rx, ry, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(robot.id, rx, ry + 3);

      // 电量指示
      const bw = 16, bh = 4;
      ctx.fillStyle = '#333';
      ctx.fillRect(rx - bw / 2, ry + 15, bw, bh);
      ctx.fillStyle = robot.battery > 50 ? '#4caf50' : robot.battery > 25 ? '#ff9800' : '#f44336';
      ctx.fillRect(rx - bw / 2, ry + 15, bw * robot.battery / 100, bh);

      ctx.fillStyle = '#333';
      ctx.font = '9px sans-serif';
      ctx.fillText(robot.name, rx, ry - 16);
      ctx.restore();
    });
  }

  // 高亮区域
  function drawHighlightAreas(ctx) {
    highlightAreas.forEach(area => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius || 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  // 图例
  function drawLegend(ctx) {
    const lx = 10, ly = height - 120;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(lx, ly, 160, 110);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, 160, 110);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('区域类型图例', lx + 5, ly + 14);

    const legendItems = [
      { color: '#e8f5e9', label: '主大厅 (0.8)' },
      { color: '#ffcdd2', label: '手术室 (10.0)' },
      { color: '#f3e5f5', label: 'ICU走廊 (2.0)' },
      { color: '#fff9c4', label: '药房入口 (3.0)' },
      { color: '#e3f2fd', label: '普通走廊 (1.0)' },
      { color: '#d7ccc8', label: '电梯间 (1.5)' },
    ];

    ctx.font = '9px sans-serif';
    legendItems.forEach((item, i) => {
      const iy = ly + 28 + i * 14;
      ctx.fillStyle = item.color;
      ctx.fillRect(lx + 5, iy - 8, 10, 10);
      ctx.strokeStyle = '#999';
      ctx.strokeRect(lx + 5, iy - 8, 10, 10);
      ctx.fillStyle = '#333';
      ctx.fillText(item.label, lx + 20, iy);
    });
    ctx.restore();
  }

  // 鼠标交互
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const found = mapNodes.find(n => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < 15);
    setHoveredNode(found ? found.id : null);
  };

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 支持 onClick 回调（传坐标）
    if (onClick) {
      onClick(x, y);
    }

    // 支持 onNodeClick 回调（传节点）
    if (onNodeClick) {
      const found = mapNodes.find(n => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < 15);
      if (found) onNodeClick(found);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: 8, cursor: hoveredNode ? 'pointer' : 'default' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}
