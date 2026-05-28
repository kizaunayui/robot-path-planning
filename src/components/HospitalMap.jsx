import { useRef, useEffect, useState, useCallback } from "react";
import { pointColors, pointIcons, strategyColors } from "../data/mapData";

/**
 * 升级版网格地图渲染组件
 * 支持：精美医院网格、墙体3D阴影、特殊交通规则区高亮、Marching Ants 动态路径、机器人平滑Lerp移动与朝向旋转、悬浮提示
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

  // 单元格配置 — 放大到36px，文字更清晰
  const CELL = 36;
  const W = cols * CELL;
  const H = rows * CELL;

  const wallSet = new Set(walls.map((p) => `${p[0]},${p[1]}`));
  const dynamicSet = new Set(dynamic.map((p) => `${p[0]},${p[1]}`));

  // 机器人平滑运动位置追踪
  const robotVisualsRef = useRef({});

  // 规则区域定义（深色主题适配）
  const zones = [
    {
      name: "手术优先区",
      x: 23, y: 2, w: 5, h: 5,
      color: "rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.6)",
      textColor: "#34d399",
    },
    {
      name: "污染避让区",
      x: 18, y: 7, w: 5, h: 5,
      color: "rgba(239, 68, 68, 0.15)",
      borderColor: "rgba(239, 68, 68, 0.6)",
      textColor: "#f87171",
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;

    let animationId;
    let dashOffset = 0;

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

      // 4. 墙壁 (带立体浮雕效果)
      walls.forEach(([wx, wy]) => {
        // 主体
        ctx.fillStyle = "#334155";
        ctx.fillRect(wx * CELL + 1, wy * CELL + 1, CELL - 2, CELL - 2);

        // 立体斜角效果
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wx * CELL + 1.5, wy * CELL + 1.5, CELL - 3, CELL - 3);

        // 高亮角
        ctx.fillStyle = "#64748b";
        ctx.fillRect(wx * CELL + 1, wy * CELL + 1, CELL - 2, 3);
      });

      // 5. 动态障碍
      dynamic.forEach(([dx, dy]) => {
        ctx.fillStyle = "#ff9800";
        ctx.globalAlpha = 0.8;
        ctx.fillRect(dx * CELL + 1, dy * CELL + 1, CELL - 2, CELL - 2);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(dx * CELL + 1.5, dy * CELL + 1.5, CELL - 3, CELL - 3);

        // 警告标识 ⚠
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(CELL * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚠", dx * CELL + CELL / 2, dy * CELL + CELL / 2);
      });

      // 6. 历史访问网格
      if (showVisited && highlightRoute?.visited) {
        ctx.fillStyle = "#3b82f6";
        ctx.globalAlpha = 0.2;
        highlightRoute.visited.forEach(([vx, vy]) => {
          ctx.fillRect(vx * CELL + 1, vy * CELL + 1, CELL - 2, CELL - 2);
        });
        ctx.globalAlpha = 1;
      }

      // 7. 路径高亮 (Marching Ants 流光线条)
      const allRoutes = routes.filter((r) => r.reachable);
      allRoutes.forEach((route) => {
        const isActive = highlightRoute && route.strategy === highlightRoute.strategy;
        const color = strategyColors[route.strategy] || "#10b981";

        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 5 : 2.5;
        ctx.globalAlpha = isActive ? 1 : 0.4;

        // 流光效果
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

      // 8. 科室节点 (Styled Nodes)
      Object.entries(points).forEach(([name, [px, py]]) => {
        const color = pointColors[name] || "#64748b";
        const icon = pointIcons[name] || "📍";
        const cx = px * CELL + CELL / 2;
        const cy = py * CELL + CELL / 2;

        // 呼吸光晕
        const wave = 3 * Math.sin(Date.now() / 300);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.65 + wave, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // 圆圈主体（放大）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 图标（放大）
        if (showLabels) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `${Math.floor(CELL * 0.5)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(icon, cx, cy);

          // 科室名称 — 浅色加粗，深色主题下清晰可读
          ctx.fillStyle = "#f1f5f9";
          ctx.font = `bold ${Math.floor(CELL * 0.4)}px sans-serif`;
          ctx.textBaseline = "top";
          // 文字加暗色描边增强对比度
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 3;
          ctx.strokeText(name, cx, py * CELL + CELL + 4);
          ctx.fillText(name, cx, py * CELL + CELL + 4);
        }
      });

      // 9. 路径起终点大圆标 (S / E)
      if (highlightRoute?.path?.length > 1) {
        const start = highlightRoute.path[0];
        const end = highlightRoute.path[highlightRoute.path.length - 1];

        // Start (S)
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

        // End (E)
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

      // 10. 机器人平滑Lerp绘制 (Animated AGV Robots)
      robots.forEach((r) => {
        const [targetX, targetY] = r.pos;

        // 初始化或平滑插值计算
        if (!robotVisualsRef.current[r.id]) {
          robotVisualsRef.current[r.id] = { x: targetX, y: targetY, angle: 0 };
        }
        const vis = robotVisualsRef.current[r.id];

        const dx = targetX - vis.x;
        const dy = targetY - vis.y;

        // 平滑位置 Lerp
        vis.x += dx * 0.08;
        vis.y += dy * 0.08;

        // 平滑角度计算
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          const targetAngle = Math.atan2(dy, dx);
          let diff = targetAngle - vis.angle;
          // 环绕角修整
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          vis.angle += diff * 0.15;
        }

        const cx = vis.x * CELL + CELL / 2;
        const cy = vis.y * CELL + CELL / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(vis.angle);

        // 绘制精美的AGV车体 (带状态阴影)
        const isCharging = r.status === "charging";
        const isRunning = r.status === "running";
        const themeColor = isCharging ? "#eab308" : isRunning ? "#3b82f6" : "#10b981";

        // 外发光
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = isRunning ? 8 + 3 * Math.sin(Date.now() / 150) : 5;

        // AGV主体底座
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(-CELL * 0.42, -CELL * 0.37, CELL * 0.84, CELL * 0.74, 5);
        ctx.fill();

        // 取消阴影
        ctx.shadowBlur = 0;

        // 顶部核心舱面板
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.roundRect(-CELL * 0.27, -CELL * 0.27, CELL * 0.54, CELL * 0.54, 4);
        ctx.fill();

        // 车头前大灯 (黄色小三角形)
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(CELL * 0.4, -CELL * 0.16);
        ctx.lineTo(CELL * 0.47, 0);
        ctx.lineTo(CELL * 0.4, CELL * 0.16);
        ctx.closePath();
        ctx.fill();

        // 车尾警告闪光灯
        if (isRunning) {
          const flash = Math.floor(Date.now() / 200) % 2 === 0;
          ctx.fillStyle = flash ? "#ef4444" : "#7f1d1d";
          ctx.beginPath();
          ctx.arc(-CELL * 0.37, -CELL * 0.16, 3, 0, Math.PI * 2);
          ctx.arc(-CELL * 0.37, CELL * 0.16, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // 绘制机器人文本标签与电量条 (直接在网格上，不旋转)
        // 机器人 ID — 加大字号
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.floor(CELL * 0.35)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(r.id, cx, cy - 1);

        // 机器人名称悬浮字
        if (showLabels) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = `${Math.floor(CELL * 0.28)}px sans-serif`;
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 2;
          ctx.strokeText(r.name, cx, cy - CELL * 0.55 - 4);
          ctx.fillText(r.name, cx, cy - CELL * 0.55 - 4);
        }

        // 小电量条 (充电时会绿色跳动)
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

      // 11. 鼠标悬停网格交互圈
      if (hoveredCell && editMode) {
        const [hx, hy] = hoveredCell;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(hx * CELL + 1, hy * CELL + 1, CELL - 2, CELL - 2);
      }

      // Ticker 推进
      dashOffset = (dashOffset + 0.3) % 24;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mapData, routes, highlightRoute, robots, showGrid, showLabels, showVisited, hoveredCell, editMode, W, H, CELL, cols, rows, wallSet, dynamicSet]);

  // 鼠标交互坐标映射
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

  return (
    <div className={className}>
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
            {!wallSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && !dynamicSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && (
              <span className="ml-2 text-green-400 font-medium">| 🟢 可通行区域</span>
            )}
          </div>
          <div className="text-slate-500">
            {editMode ? `编辑模式: ${editMode}` : "提示: 点击地图进行交互"}
          </div>
        </div>
      )}
    </div>
  );
}
