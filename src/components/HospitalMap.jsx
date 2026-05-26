import { useRef, useEffect, useState, useCallback } from "react";
import { pointColors, pointIcons, strategyColors } from "../data/mapData";

/**
 * 网格地图渲染组件
 * 支持：墙壁、动态障碍、科室标记、路径高亮、机器人位置
 */
export default function HospitalMap({
  mapData,
  routes = [],
  bestRoute = null,
  highlightRoute = null,
  robots = [],
  showGrid = true,
  showLabels = true,
  showVisited = false,
  onCellClick,
  editMode = null,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const { cols, rows, walls, dynamic, points } = mapData;

  // Cell size
  const CELL = 28;
  const W = cols * CELL;
  const H = rows * CELL;

  // Build wall/dynamic sets for fast lookup
  const wallSet = new Set(walls.map((p) => `${p[0]},${p[1]}`));
  const dynamicSet = new Set(dynamic.map((p) => `${p[0]},${p[1]}`));

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
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

    // Walls
    for (const [wx, wy] of walls) {
      ctx.fillStyle = "#37474f";
      ctx.fillRect(wx * CELL, wy * CELL, CELL, CELL);
    }

    // Dynamic obstacles
    for (const [dx, dy] of dynamic) {
      ctx.fillStyle = "#ff9800";
      ctx.globalAlpha = 0.7;
      ctx.fillRect(dx * CELL, dy * CELL, CELL, CELL);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#e65100";
      ctx.lineWidth = 2;
      ctx.strokeRect(dx * CELL + 1, dy * CELL + 1, CELL - 2, CELL - 2);
      // ⚠ icon
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.floor(CELL * 0.5)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚠", dx * CELL + CELL / 2, dy * CELL + CELL / 2);
    }

    // Visited cells (if enabled)
    if (showVisited && highlightRoute?.visited) {
      ctx.fillStyle = "#bbdefb";
      ctx.globalAlpha = 0.3;
      for (const [vx, vy] of highlightRoute.visited) {
        ctx.fillRect(vx * CELL, vy * CELL, CELL, CELL);
      }
      ctx.globalAlpha = 1;
    }

    // Route paths
    const allRoutes = routes.filter((r) => r.reachable);
    for (const route of allRoutes) {
      const isActive = highlightRoute && route.strategy === highlightRoute.strategy;
      const color = strategyColors[route.strategy] || "#4caf50";
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 4 : 2;
      ctx.globalAlpha = isActive ? 0.9 : 0.3;
      ctx.setLineDash(isActive ? [] : [6, 4]);
      ctx.beginPath();
      for (let i = 0; i < route.path.length; i++) {
        const [px, py] = route.path[i];
        const cx = px * CELL + CELL / 2;
        const cy = py * CELL + CELL / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Points (departments)
    for (const [name, [px, py]] of Object.entries(points)) {
      const color = pointColors[name] || "#607d8b";
      const icon = pointIcons[name] || "📍";

      // Circle
      ctx.fillStyle = color;
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(px * CELL + CELL / 2, py * CELL + CELL / 2, CELL * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon
      if (showLabels) {
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(CELL * 0.4)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, px * CELL + CELL / 2, py * CELL + CELL / 2);

        // Name label
        ctx.fillStyle = "#263238";
        ctx.font = `bold ${Math.floor(CELL * 0.35)}px sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(name, px * CELL + CELL / 2, py * CELL + CELL + 2);
      }
    }

    // Robots
    for (const r of robots) {
      const [rx, ry] = r.pos;
      const color = r.status === "charging" ? "#ffc107" : r.status === "running" ? "#2196f3" : "#42a5f5";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(rx * CELL + CELL / 2, ry * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.floor(CELL * 0.32)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(r.id, rx * CELL + CELL / 2, ry * CELL + CELL / 2);
    }

    // Hovered cell highlight
    if (hoveredCell && editMode) {
      const [hx, hy] = hoveredCell;
      ctx.strokeStyle = "#2196f3";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(hx * CELL + 1, hy * CELL + 1, CELL - 2, CELL - 2);
      ctx.setLineDash([]);
    }

    // Start/End markers on highlighted route
    if (highlightRoute?.path?.length > 1) {
      const start = highlightRoute.path[0];
      const end = highlightRoute.path[highlightRoute.path.length - 1];

      // Start marker (green)
      ctx.fillStyle = "#4caf50";
      ctx.beginPath();
      ctx.arc(start[0] * CELL + CELL / 2, start[1] * CELL + CELL / 2, CELL * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.floor(CELL * 0.4)}px sans-serif`;
      ctx.fillText("S", start[0] * CELL + CELL / 2, start[1] * CELL + CELL / 2);

      // End marker (red)
      ctx.fillStyle = "#f44336";
      ctx.beginPath();
      ctx.arc(end[0] * CELL + CELL / 2, end[1] * CELL + CELL / 2, CELL * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText("E", end[0] * CELL + CELL / 2, end[1] * CELL + CELL / 2);
    }
  }, [mapData, routes, highlightRoute, robots, showGrid, showLabels, showVisited, hoveredCell, editMode, W, H, CELL, cols, rows, wallSet, dynamicSet]);

  // Mouse interaction
  const getCell = useCallback(
    (e) => {
      const canvas = canvasRef.current;
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

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
        className="w-full border border-slate-300 rounded-lg shadow bg-white"
        style={{ maxHeight: "520px", aspectRatio: `${W}/${H}` }}
      />
      {hoveredCell && (
        <div className="mt-1 text-xs text-slate-500">
          坐标: ({hoveredCell[0]}, {hoveredCell[1]})
          {wallSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && " | 墙壁"}
          {dynamicSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && " | 动态障碍"}
        </div>
      )}
    </div>
  );
}
