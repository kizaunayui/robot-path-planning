import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { pointColors, pointIcons, strategyColors, elevatorPosition, floorColors } from "../data/mapData";

/**
 * 多楼层网格地图渲染组件
 * 支持：楼层切换Tab、电梯标记、跨楼层路径分段显示
 */
export default function HospitalMap({
  mapData,              // 当前楼层的 mapData（向后兼容）
  floorMap = null,      // 多楼层地图数据（新）
  currentFloor = '1F',  // 当前楼层
  onFloorChange = null, // 楼层切换回调
  routes = [],
  highlightRoute = null,
  robots = [],
  showGrid = true,
  showLabels = true,
  showVisited = false,
  onCellClick,
  editMode = null,
  className = "",
  showFloorTabs = true,
}) {
  const canvasRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // 使用 floorMap 获取当前楼层数据，或向后兼容使用 mapData
  const activeMapData = (floorMap ? floorMap[currentFloor] : mapData) || null;
  const hasActiveMap = Boolean(activeMapData);

  const { cols = 0, rows = 0, walls = [], dynamic = [], points = {} } = activeMapData || {};

  // 单元格配置
  const CELL = 36;
  const W = cols * CELL;
  const H = rows * CELL;

  const wallSet = useMemo(() => new Set(walls.map((p) => `${p[0]},${p[1]}`)), [walls]);
  const dynamicSet = useMemo(() => new Set(dynamic.map((p) => `${p[0]},${p[1]}`)), [dynamic]);

  // 机器人平滑运动位置追踪
  const robotVisualsRef = useRef({});

  // 当前楼层的路径（多楼层路径过滤）
  const getFloorRoutes = useCallback(() => {
    if (!routes || routes.length === 0) return [];
    return routes.map((route) => {
      if (!route.path || route.path.length === 0) return route;
      // 如果路径节点有 floor 属性，过滤当前楼层
      if (route.path[0]?.floor) {
        const floorPath = route.path.filter((p) => p.floor === currentFloor).map((p) => p.pos);
        return { ...route, path: floorPath };
      }
      return route;
    }).filter((r) => r.path && r.path.length > 0);
  }, [routes, currentFloor]);

  const getFloorHighlight = useCallback(() => {
    if (!highlightRoute || !highlightRoute.path || highlightRoute.path.length === 0) return null;
    if (highlightRoute.path[0]?.floor) {
      const floorPath = highlightRoute.path.filter((p) => p.floor === currentFloor).map((p) => p.pos);
      if (floorPath.length === 0) return null;
      return { ...highlightRoute, path: floorPath };
    }
    return highlightRoute;
  }, [highlightRoute, currentFloor]);

  // 规则区域定义
  const getZones = useCallback(() => {
    if (currentFloor === '1F') {
      return [
        {
          name: "污染避让区",
          x: 18, y: 7, w: 5, h: 5,
          color: "rgba(239, 68, 68, 0.15)",
          borderColor: "rgba(239, 68, 68, 0.6)",
          textColor: "#f87171",
        },
      ];
    }
    if (currentFloor === '2F') {
      return [
        {
          name: "手术优先区",
          x: 23, y: 2, w: 5, h: 5,
          color: "rgba(16, 185, 129, 0.15)",
          borderColor: "rgba(16, 185, 129, 0.6)",
          textColor: "#34d399",
        },
      ];
    }
    if (currentFloor === '3F') {
      return [
        {
          name: "限速区",
          x: 2, y: 14, w: 5, h: 5,
          color: "rgba(245, 158, 11, 0.15)",
          borderColor: "rgba(245, 158, 11, 0.6)",
          textColor: "#fbbf24",
        },
      ];
    }
    return [];
  }, [currentFloor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;

    let animationId;
    let dashOffset = 0;

    const floorRoutes = getFloorRoutes();
    const floorHighlight = getFloorHighlight();
    const zones = getZones();

    const render = () => {
      // 1. 清空画布与深色背景
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      // 2. 绘制交通管制规则区域
      zones.forEach((z) => {
        ctx.fillStyle = z.color;
        ctx.fillRect(z.x * CELL, z.y * CELL, z.w * CELL, z.h * CELL);
        ctx.strokeStyle = z.borderColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(z.x * CELL, z.y * CELL, z.w * CELL, z.h * CELL);
        ctx.setLineDash([]);
        if (showLabels) {
          ctx.fillStyle = z.textColor;
          ctx.font = `bold 13px sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(z.name, z.x * CELL + 6, z.y * CELL + 6);
        }
      });

      // 3. 网格线
      if (showGrid) {
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.8;
        for (let x = 0; x <= cols; x++) {
          ctx.beginPath();
          ctx.moveTo(x * CELL, 0);
          ctx.lineTo(x * CELL, H);
          ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * CELL);
          ctx.lineTo(W, y * CELL);
          ctx.stroke();
        }
      }

      // 4. 墙壁
      walls.forEach(([wx, wy]) => {
        ctx.fillStyle = "#334155";
        ctx.fillRect(wx * CELL + 1, wy * CELL + 1, CELL - 2, CELL - 2);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wx * CELL + 1.5, wy * CELL + 1.5, CELL - 3, CELL - 3);
        ctx.fillStyle = "#64748b";
        ctx.fillRect(wx * CELL + 1, wy * CELL + 1, CELL - 2, 3);
      });

      // 5. 电梯位置特殊标记
      const [elevX, elevY] = elevatorPosition;
      if (!wallSet.has(`${elevX},${elevY}`)) {
        ctx.fillStyle = "rgba(234, 179, 8, 0.2)";
        ctx.fillRect(elevX * CELL + 1, elevY * CELL + 1, CELL - 2, CELL - 2);
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(elevX * CELL + 1.5, elevY * CELL + 1.5, CELL - 3, CELL - 3);
        ctx.setLineDash([]);
      }

      // 6. 动态障碍
      dynamic.forEach(([dx, dy]) => {
        ctx.fillStyle = "#ff9800";
        ctx.globalAlpha = 0.8;
        ctx.fillRect(dx * CELL + 1, dy * CELL + 1, CELL - 2, CELL - 2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(dx * CELL + 1.5, dy * CELL + 1.5, CELL - 3, CELL - 3);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(CELL * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚠", dx * CELL + CELL / 2, dy * CELL + CELL / 2);
      });

      // 7. 历史访问网格
      if (showVisited && floorHighlight?.visited) {
        ctx.fillStyle = "#3b82f6";
        ctx.globalAlpha = 0.2;
        const visArr = floorHighlight.visited.filter((v) => {
          if (v.floor) return v.floor === currentFloor;
          return true;
        });
        visArr.forEach((v) => {
          const [vx, vy] = v.pos || v;
          ctx.fillRect(vx * CELL + 1, vy * CELL + 1, CELL - 2, CELL - 2);
        });
        ctx.globalAlpha = 1;
      }

      // 8. 路径高亮
      const allRoutes = floorRoutes.filter((r) => r.reachable);
      allRoutes.forEach((route) => {
        const isActive = floorHighlight && route.strategy === floorHighlight.strategy;
        const color = strategyColors[route.strategy] || "#10b981";
        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 5 : 2.5;
        ctx.globalAlpha = isActive ? 1 : 0.4;
        ctx.setLineDash(isActive ? [10, 7] : [6, 4]);
        ctx.lineDashOffset = isActive ? -dashOffset : 0;
        ctx.beginPath();
        route.path.forEach(([px, py], i) => {
          const cx = px * CELL + CELL / 2;
          const cy = py * CELL + CELL / 2;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      });

      // 9. 跨楼层路径电梯标记
      if (highlightRoute?.path?.length > 1 && highlightRoute.path[0]?.floor) {
        const fullPath = highlightRoute.path;
        for (let i = 0; i < fullPath.length - 1; i++) {
          if (fullPath[i].floor !== fullPath[i + 1].floor && fullPath[i].floor === currentFloor) {
            const [px, py] = fullPath[i].pos;
            const cx = px * CELL + CELL / 2;
            const cy = py * CELL + CELL / 2;
            // 绘制电梯换乘箭头
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(cx, cy, CELL * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${Math.floor(CELL * 0.35)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const dir = fullPath[i + 1].floor > fullPath[i].floor ? "▲" : "▼";
            ctx.fillText(`🛗${dir}`, cx, cy);
          }
        }
      }

      // 10. 科室节点
      Object.entries(points).forEach(([name, [px, py]]) => {
        const color = pointColors[name] || "#64748b";
        const icon = pointIcons[name] || "📍";
        const cx = px * CELL + CELL / 2;
        const cy = py * CELL + CELL / 2;

        const wave = 3 * Math.sin(Date.now() / 300);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.65 + wave, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        if (showLabels) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `${Math.floor(CELL * 0.5)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(icon, cx, cy);

          ctx.fillStyle = "#f1f5f9";
          ctx.font = `bold ${Math.floor(CELL * 0.4)}px sans-serif`;
          ctx.textBaseline = "top";
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 3;
          ctx.strokeText(name, cx, py * CELL + CELL + 4);
          ctx.fillText(name, cx, py * CELL + CELL + 4);
        }
      });

      // 11. 路径起终点标记
      const hlPath = floorHighlight?.path;
      if (hlPath?.length > 1) {
        const start = hlPath[0];
        const end = hlPath[hlPath.length - 1];

        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(start[0] * CELL + CELL / 2, start[1] * CELL + CELL / 2, CELL * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(CELL * 0.45)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("S", start[0] * CELL + CELL / 2, start[1] * CELL + CELL / 2);

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(end[0] * CELL + CELL / 2, end[1] * CELL + CELL / 2, CELL * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillText("E", end[0] * CELL + CELL / 2, end[1] * CELL + CELL / 2);
      }

      // 12. 机器人
      robots.forEach((r) => {
        const [targetX, targetY] = r.pos;
        if (!robotVisualsRef.current[r.id]) {
          robotVisualsRef.current[r.id] = { x: targetX, y: targetY, angle: 0 };
        }
        const vis = robotVisualsRef.current[r.id];
        const dx = targetX - vis.x;
        const dy = targetY - vis.y;
        vis.x += dx * 0.08;
        vis.y += dy * 0.08;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          const targetAngle = Math.atan2(dy, dx);
          let diff = targetAngle - vis.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          vis.angle += diff * 0.15;
        }
        const cx = vis.x * CELL + CELL / 2;
        const cy = vis.y * CELL + CELL / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(vis.angle);
        const isCharging = r.status === "charging";
        const isRunning = r.status === "running";
        const themeColor = isCharging ? "#eab308" : isRunning ? "#3b82f6" : "#10b981";
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = isRunning ? 8 + 3 * Math.sin(Date.now() / 150) : 5;
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(-CELL * 0.42, -CELL * 0.37, CELL * 0.84, CELL * 0.74, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.roundRect(-CELL * 0.27, -CELL * 0.27, CELL * 0.54, CELL * 0.54, 4);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(CELL * 0.4, -CELL * 0.16);
        ctx.lineTo(CELL * 0.47, 0);
        ctx.lineTo(CELL * 0.4, CELL * 0.16);
        ctx.closePath();
        ctx.fill();
        if (isRunning) {
          const flash = Math.floor(Date.now() / 200) % 2 === 0;
          ctx.fillStyle = flash ? "#ef4444" : "#7f1d1d";
          ctx.beginPath();
          ctx.arc(-CELL * 0.37, -CELL * 0.16, 3, 0, Math.PI * 2);
          ctx.arc(-CELL * 0.37, CELL * 0.16, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.floor(CELL * 0.35)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(r.id, cx, cy - 1);
        if (showLabels) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = `${Math.floor(CELL * 0.28)}px sans-serif`;
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 2;
          ctx.strokeText(r.name, cx, cy - CELL * 0.55 - 4);
          ctx.fillText(r.name, cx, cy - CELL * 0.55 - 4);
        }
        const barW = CELL * 0.75;
        const barH = 3.5;
        const bx = cx - barW / 2;
        const by = cy + CELL * 0.55 + 3;
        ctx.fillStyle = "#334155";
        ctx.fillRect(bx, by, barW, barH);
        const batColor = r.battery > 50 ? "#22c55e" : r.battery > 20 ? "#f59e0b" : "#ef4444";
        ctx.fillStyle = batColor;
        ctx.fillRect(bx, by, barW * (r.battery / 100), barH);
      });

      // 13. 编辑模式悬停
      if (hoveredCell && editMode) {
        const [hx, hy] = hoveredCell;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(hx * CELL + 1, hy * CELL + 1, CELL - 2, CELL - 2);
      }

      dashOffset = (dashOffset + 0.3) % 24;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeMapData, routes, highlightRoute, robots, showGrid, showLabels, showVisited, hoveredCell, editMode, W, H, CELL, cols, rows, walls, dynamic, points, wallSet, dynamicSet, currentFloor, getFloorRoutes, getFloorHighlight, getZones]);

  // 鼠标交互
  const getCell = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const cx = Math.floor(mx / CELL);
      const cy = Math.floor(my / CELL);
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) return [cx, cy];
      return null;
    },
    [W, H, CELL, cols, rows]
  );

  const handleClick = useCallback(
    (e) => {
      const cell = getCell(e);
      if (cell && onCellClick) onCellClick(cell);
    },
    [getCell, onCellClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const cell = getCell(e);
      setHoveredCell(cell);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = editMode ? "crosshair" : cell ? "pointer" : "default";
      }
    },
    [getCell, editMode]
  );

  const isElevatorCell = hoveredCell && hoveredCell[0] === elevatorPosition[0] && hoveredCell[1] === elevatorPosition[1];

  if (!hasActiveMap) {
    return <div className={`rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500 ${className}`}>当前楼层地图数据不可用</div>;
  }

  return (
    <div className={className}>
      {/* 楼层切换 Tab */}
      {showFloorTabs && onFloorChange && (
        <div className="flex gap-2 mb-3">
          {['1F', '2F', '3F'].map((fid) => (
            <button
              key={fid}
              onClick={() => onFloorChange(fid)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentFloor === fid
                  ? 'text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              style={currentFloor === fid ? { backgroundColor: floorColors[fid] } : {}}
            >
              {fid} {fid === '1F' ? '一层' : fid === '2F' ? '二层' : '三层'}
            </button>
          ))}
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
        className="w-full border border-slate-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300"
        style={{ maxHeight: "620px", aspectRatio: `${W}/${H}` }}
      />

      {hoveredCell && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg p-2.5 shadow-inner">
          <div>
            📍 坐标: <span className="font-bold text-white font-mono">({hoveredCell[0]}, {hoveredCell[1]})</span>
            {wallSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && <span className="ml-2 text-slate-400 font-medium">| 🛑 固体墙壁</span>}
            {dynamicSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && <span className="ml-2 text-amber-400 font-medium">| ⚠ 动态障碍区</span>}
            {isElevatorCell && <span className="ml-2 text-yellow-400 font-medium">| 🛗 电梯位置</span>}
            {!wallSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && !dynamicSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && !isElevatorCell && (
              <span className="ml-2 text-green-400 font-medium">| 🟢 可通行区域</span>
            )}
          </div>
          <div className="text-slate-500">
            {editMode ? `编辑模式: ${editMode}` : `楼层: ${currentFloor}`}
          </div>
        </div>
      )}
    </div>
  );
}
