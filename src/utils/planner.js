/**
 * 医院机器人路径规划核心算法
 * 移植自 planner.py，支持三种策略：time / smooth / energy
 */

// ==================== 工具函数 ====================

function heuristic(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function neighbors(pos, cols, rows, blocked) {
  const [x, y] = pos;
  const cells = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  return cells.filter(
    (p) => p[0] >= 0 && p[0] < cols && p[1] >= 0 && p[1] < rows && !blocked.has(`${p[0]},${p[1]}`)
  );
}

function rebuild(parent, pos) {
  const out = [];
  let key = `${pos[0]},${pos[1]}`;
  while (key) {
    const [x, y] = key.split(",").map(Number);
    out.push([x, y]);
    key = parent[key];
  }
  return out.reverse();
}

// ==================== 移动代价 ====================

export function moveCost(pos, nxt, prev, strategy, rules, cargoMultiplier = 1, priorityMultiplier = 1) {
  let cost = 1.0;

  // smooth 策略：转弯惩罚
  if (strategy === "smooth" && prev) {
    const old = [pos[0] - prev[0], pos[1] - prev[1]];
    const dir = [nxt[0] - pos[0], nxt[1] - pos[1]];
    if (old[0] !== dir[0] || old[1] !== dir[1]) {
      cost += 0.8;
    }
  }

  // energy 策略：基础能耗
  if (strategy === "energy") {
    cost += 0.15;
  }

  // 货物类型和优先级影响
  cost *= cargoMultiplier;
  cost *= priorityMultiplier;

  // 规则影响
  for (const rule of rules) {
    if (!rule.enabled) continue;

    // 污染区避让 (R2) - 影响区域 [18-22, 7-11]
    if (rule.type === "avoid_zone" && nxt[0] >= 18 && nxt[0] <= 22 && nxt[1] >= 7 && nxt[1] <= 11) {
      cost += rule.weight;
    }

    // 手术区优先通行 (R1) - 手术室附近 [23-27, 2-6]
    if (rule.type === "priority_zone" && nxt[0] >= 23 && nxt[0] <= 27 && nxt[1] >= 2 && nxt[1] <= 6) {
      cost *= 0.85;
    }

    // 平稳优先 (R3)
    if (rule.type === "smooth" && strategy === "smooth") {
      cost *= 0.95;
    }

    // 低电量节能 (R4)
    if (rule.type === "energy" && strategy === "energy") {
      cost *= 0.92;
    }

    // 禁行区 (R5) - 电梯厅周围 [12-16, 8-12]
    if (rule.type === "no_go" && nxt[0] >= 12 && nxt[0] <= 16 && nxt[1] >= 8 && nxt[1] <= 12) {
      cost += rule.weight;
    }

    // 限速区 (R6) - 住院区走廊 [2-6, 14-18]
    if (rule.type === "speed_limit" && nxt[0] >= 2 && nxt[0] <= 6 && nxt[1] >= 14 && nxt[1] <= 18) {
      cost *= rule.weight;
    }
  }

  return cost;
}

// ==================== A* 搜索 ====================

export function astar(start, goal, strategy, mapData, rules, cargoMultiplier = 1, priorityMultiplier = 1) {
  const walls = new Set(mapData.walls.map((p) => `${p[0]},${p[1]}`));
  const dynamic = new Set(mapData.dynamic.map((p) => `${p[0]},${p[1]}`));
  const blocked = new Set([...walls, ...dynamic]);
  const { cols, rows } = mapData;

  const startKey = `${start[0]},${start[1]}`;
  const goalKey = `${goal[0]},${goal[1]}`;

  const openSet = [{ f: heuristic(start, goal), g: 0, pos: start, prev: null, key: startKey }];
  const parent = {};
  const best = { [startKey]: 0 };
  const visited = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const { g, pos, key } = current;

    if (key in parent) continue;
    parent[key] = current.prev;
    visited.add(key);

    if (key === goalKey) {
      return { path: rebuild(parent, pos), visited };
    }

    for (const nxt of neighbors(pos, cols, rows, blocked)) {
      const nxtKey = `${nxt[0]},${nxt[1]}`;
      const prevPos = current.prev ? current.prev.split(",").map(Number) : null;
      const ng = g + moveCost(pos, nxt, prevPos, strategy, rules, cargoMultiplier, priorityMultiplier);
      if (ng < (best[nxtKey] ?? 999999)) {
        best[nxtKey] = ng;
        openSet.push({
          f: ng + heuristic(nxt, goal),
          g: ng,
          pos: nxt,
          prev: key,
          key: nxtKey,
        });
      }
    }
  }

  return { path: [], visited };
}

// ==================== 路径报告 ====================

export function routeReport(strategy, path, visited) {
  let turns = 0;
  for (let i = 2; i < path.length; i++) {
    const a = path[i - 2];
    const b = path[i - 1];
    const c = path[i];
    const oldDir = [b[0] - a[0], b[1] - a[1]];
    const newDir = [c[0] - b[0], c[1] - b[1]];
    if (oldDir[0] !== newDir[0] || oldDir[1] !== newDir[1]) {
      turns++;
    }
  }

  const score = path.length > 0 ? path.length + turns * 0.8 + visited.size * 0.02 : 999999;

  const names = {
    time: "最优路径A-时间优先",
    smooth: "备用路径B-平稳优先",
    energy: "应急路径C-节能优先",
  };

  return {
    strategy,
    name: names[strategy],
    reachable: path.length > 0,
    path,
    visited: [...visited].map((k) => k.split(",").map(Number)),
    length: Math.max(0, path.length - 1),
    turns,
    estimatedMinutes: Math.round(Math.max(0, path.length - 1) * 0.35 * 10) / 10,
    energy: Math.round((Math.max(0, path.length - 1) * 0.42 + turns * 0.08) * 10) / 10,
    score: Math.round(score * 100) / 100,
  };
}

// ==================== 路径规划主入口 ====================

export function planRoutes(task, params, mapData, rules, cargoTypes, priorityLevels) {
  const start = mapData.points[task.start];
  const goal = mapData.points[task.end];
  if (!start || !goal) return { routes: [], bestRoute: null };

  // 货物和优先级影响代价
  const cargo = (cargoTypes || []).find((c) => c.id === task.cargo);
  const priority = (priorityLevels || []).find((p) => p.id === task.priority);
  const cargoMultiplier = cargo ? cargo.costMultiplier : 1;
  const priorityMultiplier = priority ? priority.costMultiplier : 1;

  const routes = [];
  for (const strategy of ["time", "smooth", "energy"]) {
    const { path, visited } = astar(start, goal, strategy, mapData, rules, cargoMultiplier, priorityMultiplier);
    routes.push(routeReport(strategy, path, visited));
  }

  const reachable = routes.filter((r) => r.reachable);
  const best = reachable.length > 0 ? reachable.reduce((a, b) => (a.score < b.score ? a : b)) : null;

  return { routes, bestRoute: best };
}

// ==================== 地图验证 ====================

export function validateMap(mapData) {
  const wallSet = new Set(mapData.walls.map((p) => `${p[0]},${p[1]}`));
  const dynamicSet = new Set(mapData.dynamic.map((p) => `${p[0]},${p[1]}`));
  const freeCells = mapData.cols * mapData.rows - wallSet.size;

  // 连通性检查：BFS 从 (1,1) 出发能到达多少格
  const blocked = new Set([...wallSet, ...dynamicSet]);
  const visited = new Set();
  const queue = [[1, 1]];
  visited.add("1,1");
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    for (const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
      const key = `${nx},${ny}`;
      if (nx >= 0 && nx < mapData.cols && ny >= 0 && ny < mapData.rows && !visited.has(key) && !blocked.has(key)) {
        visited.add(key);
        queue.push([nx, ny]);
      }
    }
  }

  // 检查所有科室是否可达
  const pointsReachable = Object.values(mapData.points).every(
    (p) => visited.has(`${p[0]},${p[1]}`)
  );

  return {
    freeCells,
    wallCells: wallSet.size,
    dynamicObstacles: dynamicSet.size,
    points: Object.keys(mapData.points).length,
    connected: pointsReachable,
  };
}

// ==================== 地图操作 ====================

export function updateMap(operation, cell, mapData) {
  const newMap = JSON.parse(JSON.stringify(mapData));

  if (operation === "wall" && cell) {
    const key = `${cell[0]},${cell[1]}`;
    const exists = newMap.walls.some((p) => `${p[0]},${p[1]}` === key);
    if (!exists) newMap.walls.push(cell);
  } else if (operation === "dynamic" && cell) {
    const key = `${cell[0]},${cell[1]}`;
    const exists = newMap.dynamic.some((p) => `${p[0]},${p[1]}` === key);
    if (!exists) newMap.dynamic.push(cell);
  } else if (operation === "erase" && cell) {
    const key = `${cell[0]},${cell[1]}`;
    newMap.walls = newMap.walls.filter((p) => `${p[0]},${p[1]}` !== key);
    newMap.dynamic = newMap.dynamic.filter((p) => `${p[0]},${p[1]}` !== key);
  } else if (operation === "eraseWall" && cell) {
    const key = `${cell[0]},${cell[1]}`;
    newMap.walls = newMap.walls.filter((p) => `${p[0]},${p[1]}` !== key);
  } else if (operation === "clearDynamic") {
    newMap.dynamic = [];
  } else if (operation === "clearAll") {
    // 保留边界墙和科室
    const boundarySet = new Set();
    for (let x = 0; x < newMap.cols; x++) {
      boundarySet.add(`${x},0`);
      boundarySet.add(`${x},${newMap.rows - 1}`);
    }
    for (let y = 0; y < newMap.rows; y++) {
      boundarySet.add(`0,${y}`);
      boundarySet.add(`${newMap.cols - 1},${y}`);
    }
    newMap.walls = newMap.walls.filter((p) => boundarySet.has(`${p[0]},${p[1]}`));
    newMap.dynamic = [];
  } else if (operation === "randomDynamic") {
    const count = typeof cell === "number" ? cell : 5;
    newMap.dynamic = [];
    for (let i = 0; i < count; i++) {
      newMap.dynamic.push([2 + Math.floor(Math.random() * 26), 2 + Math.floor(Math.random() * 16)]);
    }
  }

  return newMap;
}

// ==================== 调整地图尺寸 ====================

export function resizeMap(cols, rows) {
  cols = Math.max(16, Math.min(60, Math.floor(cols)));
  rows = Math.max(12, Math.min(40, Math.floor(rows)));

  const walls = boundaryWalls(cols, rows);
  const points = defaultPoints(cols, rows);

  return {
    cols,
    rows,
    walls,
    dynamic: [],
    points,
  };
}

// ==================== 随机地图 ====================

export function randomMap(cols, rows, density) {
  cols = Math.max(16, Math.min(60, Math.floor(cols)));
  rows = Math.max(12, Math.min(40, Math.floor(rows)));
  density = Math.max(0, Math.min(42, Math.floor(density)));

  const points = defaultPoints(cols, rows);
  const protectedSet = new Set(Object.values(points).map((p) => `${p[0]},${p[1]}`));
  const walls = boundaryWalls(cols, rows);

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (protectedSet.has(`${x},${y}`)) continue;
      if (Math.random() * 100 <= density) {
        walls.push([x, y]);
      }
    }
  }

  return {
    cols,
    rows,
    walls,
    dynamic: [],
    points,
  };
}

// ==================== 辅助函数 ====================

function boundaryWalls(cols, rows) {
  const walls = [];
  for (let x = 0; x < cols; x++) {
    walls.push([x, 0]);
    walls.push([x, rows - 1]);
  }
  for (let y = 0; y < rows; y++) {
    walls.push([0, y]);
    walls.push([cols - 1, y]);
  }
  return walls;
}

function defaultPoints(cols, rows) {
  return {
    药房: [2, 3],
    检验科: [Math.max(3, Math.floor(cols / 2) - 2), 3],
    手术室: [cols - 5, 4],
    住院区A: [4, rows - 4],
    住院区B: [Math.max(5, Math.floor(cols / 2) + 2), rows - 4],
    消毒供应室: [cols - 4, rows - 5],
    电梯厅: [Math.floor(cols / 2), Math.floor(rows / 2)],
  };
}
