/**
 * 医院机器人路径规划核心算法 - 多楼层版本
 * 支持三种策略：time / smooth / energy
 * 支持电梯跨楼层路径规划
 */

import { elevatorPosition, elevatorCost, floors, inZone, defaultParams } from "../data/mapData";

// ==================== 工具函数 ====================

// 单步代价下限。启发函数按此下限缩放，保证不高估实际代价（可采纳），
// 因此即使规则折扣把单步代价压低，A* 仍能给出最优路径。
const MIN_STEP_COST = 0.5;

function heuristic(startState, goalState) {
  // 同层曼哈顿距离 + 跨层代价
  const dx = Math.abs(startState.pos[0] - goalState.pos[0]);
  const dy = Math.abs(startState.pos[1] - goalState.pos[1]);
  const floorDiff = startState.floor !== goalState.floor ? elevatorCost : 0;
  return (dx + dy + floorDiff) * MIN_STEP_COST;
}

function stateKey(state) {
  return `${state.floor},${state.pos[0]},${state.pos[1]}`;
}

// 每层的墙壁/动态障碍集合，整次搜索只构建一次
function buildFloorContext(floorMap) {
  const ctx = {};
  for (const [floorId, mapData] of Object.entries(floorMap)) {
    ctx[floorId] = {
      cols: mapData.cols,
      rows: mapData.rows,
      walls: new Set(mapData.walls.map((p) => `${p[0]},${p[1]}`)),
      dynamic: new Set(mapData.dynamic.map((p) => `${p[0]},${p[1]}`)),
    };
  }
  return ctx;
}

function neighbors(state, floorCtx) {
  const { floor, pos } = state;
  const [x, y] = pos;
  const ctx = floorCtx[floor];
  if (!ctx) return [];

  const cells = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  const result = [];

  // 同层普通移动
  for (const [nx, ny] of cells) {
    const key = `${nx},${ny}`;
    if (nx >= 0 && nx < ctx.cols && ny >= 0 && ny < ctx.rows && !ctx.walls.has(key) && !ctx.dynamic.has(key)) {
      result.push({ floor, pos: [nx, ny], isElevator: false });
    }
  }

  // 电梯跨层移动：当前在电梯位置时可切换楼层
  const [ex, ey] = elevatorPosition;
  if (x === ex && y === ey) {
    const elevKey = `${ex},${ey}`;
    for (const f of floors) {
      if (f.id === floor) continue;
      const targetCtx = floorCtx[f.id];
      if (targetCtx && !targetCtx.walls.has(elevKey) && !targetCtx.dynamic.has(elevKey)) {
        result.push({ floor: f.id, pos: [ex, ey], isElevator: true });
      }
    }
  }

  return result;
}

function rebuildPath(parent, endKey) {
  const out = [];
  let key = endKey;
  while (key) {
    const [floor, x, y] = key.split(",");
    out.push({ floor, pos: [Number(x), Number(y)] });
    key = parent[key];
  }
  return out.reverse();
}

// ==================== 移动代价 ====================

// 代价模型：基础代价 1.0 + 附加惩罚（规则/转弯/障碍规避），再乘折扣。
// 货物与优先级乘数只缩放附加惩罚——均匀缩放全部代价不会改变最短路径的选择，
// 只缩放惩罚项才能产生真实差异：紧急任务（乘数<1）更敢于穿越受限区，低优先级任务绕行更保守。
export function moveCost(fromState, toState, prevState, strategy, rules, cargoMultiplier = 1, priorityMultiplier = 1, params = defaultParams, floorCtx = null) {
  // 电梯跨层：固定代价，不叠加区域/转弯惩罚
  if (toState.isElevator) {
    return elevatorCost;
  }

  let extra = 0;
  let discount = 1.0;

  // smooth 策略：转弯惩罚（同层内）
  if (strategy === "smooth" && prevState && fromState.floor === prevState.floor) {
    const oldDir = [fromState.pos[0] - prevState.pos[0], fromState.pos[1] - prevState.pos[1]];
    const newDir = [toState.pos[0] - fromState.pos[0], toState.pos[1] - fromState.pos[1]];
    if (oldDir[0] !== newDir[0] || oldDir[1] !== newDir[1]) {
      extra += 0.8;
    }
  }

  // energy 策略：基础能耗
  if (strategy === "energy") {
    extra += 0.15;
  }

  // 规划参数：动态障碍规避灵敏度 / 墙体安全缓冲
  if (floorCtx) {
    const [x, y] = toState.pos;
    const sensitivity = params?.sensitivity ?? 0;
    const buffer = params?.buffer ?? 0;
    if (sensitivity > 0 || buffer > 0) {
      for (const [ax, ay] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const key = `${ax},${ay}`;
        if (sensitivity > 0 && floorCtx.dynamic.has(key)) extra += sensitivity * 0.3;
        if (buffer > 0 && floorCtx.walls.has(key)) extra += buffer * 0.15;
      }
    }
  }

  // 规则影响（按楼层过滤，区域坐标来自规则数据）
  const [nx, ny] = toState.pos;
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.floors && !rule.floors.includes(toState.floor)) continue;

    const zoneHit = rule.zone ? inZone(rule.zone, nx, ny) : false;

    switch (rule.type) {
      case "avoid_zone": // 污染区避让 (R2)
      case "no_go":      // 禁行区 (R5)
        if (zoneHit) extra += rule.weight;
        break;
      case "speed_limit": // 限速区 (R6)：附加惩罚 = 权重-1，权重≤1 时不产生"捷径"
        if (zoneHit) extra += Math.max(0, rule.weight - 1);
        break;
      case "priority_zone": // 手术区优先通行 (R1)
        if (zoneHit) discount *= 0.85;
        break;
      case "smooth": // 平稳优先 (R3)
        if (strategy === "smooth") discount *= 0.95;
        break;
      case "energy": // 低电量节能 (R4)
        if (strategy === "energy") discount *= 0.92;
        break;
    }
  }

  extra *= cargoMultiplier * priorityMultiplier;

  return Math.max(MIN_STEP_COST, (1.0 + extra) * discount);
}

// ==================== 多楼层 A* 搜索 ====================

export function astar(start, goal, strategy, floorMap, rules, cargoMultiplier = 1, priorityMultiplier = 1, params = defaultParams) {
  // start = {floor: '1F', pos: [x, y]}
  // goal = {floor: '3F', pos: [x, y]}
  // floorMap = multiFloorMap

  const floorCtx = buildFloorContext(floorMap);
  const startKey = stateKey(start);
  const goalKey = stateKey(goal);

  const openSet = [{
    f: heuristic(start, goal),
    g: 0,
    state: start,
    key: startKey,
    prevKey: null,
  }];
  const parent = {};
  const best = { [startKey]: 0 };
  const visited = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const { g, state, key } = current;

    if (key in parent) continue;
    parent[key] = current.prevKey;
    visited.add(key);

    if (key === goalKey) {
      return { path: rebuildPath(parent, goalKey), visited };
    }

    for (const nxt of neighbors(state, floorCtx)) {
      const nxtKey = stateKey(nxt);
      const prevState = current.prevKey ? parseState(current.prevKey) : null;
      const ng = g + moveCost(state, nxt, prevState, strategy, rules, cargoMultiplier, priorityMultiplier, params, floorCtx[nxt.floor]);
      if (ng < (best[nxtKey] ?? 999999)) {
        best[nxtKey] = ng;
        openSet.push({
          f: ng + heuristic(nxt, goal),
          g: ng,
          state: nxt,
          key: nxtKey,
          prevKey: key,
        });
      }
    }
  }

  return { path: [], visited };
}

function parseState(key) {
  const [floor, x, y] = key.split(",");
  return { floor, pos: [Number(x), Number(y)] };
}

// ==================== 路径报告 ====================

export function routeReport(strategy, path, visited) {
  // 电梯换乘：每个相邻楼层变化恰好计一次（覆盖首步和末步）
  let elevatorCount = 0;
  for (let i = 1; i < path.length; i++) {
    if (path[i - 1].floor !== path[i].floor) elevatorCount++;
  }

  // 转弯：仅统计同层内连续三点的方向变化
  let turns = 0;
  for (let i = 2; i < path.length; i++) {
    const a = path[i - 2];
    const b = path[i - 1];
    const c = path[i];

    // 跨楼层不计入转弯
    if (b.floor !== c.floor || a.floor !== b.floor) continue;

    const oldDir = [b.pos[0] - a.pos[0], b.pos[1] - a.pos[1]];
    const newDir = [c.pos[0] - b.pos[0], c.pos[1] - b.pos[1]];
    if (oldDir[0] !== newDir[0] || oldDir[1] !== newDir[1]) {
      turns++;
    }
  }

  // 综合评分只由路径本身的质量构成（长度/转弯/换乘），与搜索过程无关
  const totalSteps = path.length > 0 ? path.length - 1 : 0;
  const score = totalSteps > 0 ? totalSteps + turns * 0.8 + elevatorCount * elevatorCost : 999999;

  const names = {
    time: "最优路径A-时间优先",
    smooth: "备用路径B-平稳优先",
    energy: "应急路径C-节能优先",
  };

  // 按楼层分段
  const segments = [];
  let currentSegment = null;
  for (const node of path) {
    if (!currentSegment || currentSegment.floor !== node.floor) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = { floor: node.floor, nodes: [node] };
    } else {
      currentSegment.nodes.push(node);
    }
  }
  if (currentSegment) segments.push(currentSegment);

  // 找每个分段的起止科室名
  const segmentInfo = segments.map((seg) => {
    const firstNode = seg.nodes[0];
    const lastNode = seg.nodes[seg.nodes.length - 1];
    return {
      floor: seg.floor,
      start: firstNode.pos,
      end: lastNode.pos,
      length: seg.nodes.length - 1,
    };
  });

  return {
    strategy,
    name: names[strategy],
    reachable: path.length > 0,
    path,
    visited: [...visited].map((k) => {
      const parts = k.split(",");
      return { floor: parts[0], pos: [Number(parts[1]), Number(parts[2])] };
    }),
    length: totalSteps,
    turns,
    elevatorCount,
    segments: segmentInfo,
    estimatedMinutes: Math.round(totalSteps * 0.35 * 10) / 10,
    energy: Math.round((totalSteps * 0.42 + turns * 0.08 + elevatorCount * 0.5) * 10) / 10,
    score: Math.round(score * 100) / 100,
  };
}

// ==================== 路径规划主入口 ====================

export function planRoutes(task, params, floorMap, rules, cargoTypes, priorityLevels) {
  // 解析起终点（支持 allPoints 格式 '1F-药房' 或传统名称格式）
  const startState = resolvePoint(task.start, floorMap);
  const goalState = resolvePoint(task.end, floorMap);
  if (!startState || !goalState) return { routes: [], bestRoute: null };

  const cargo = (cargoTypes || []).find((c) => c.id === task.cargo);
  const priority = (priorityLevels || []).find((p) => p.id === task.priority);
  const cargoMultiplier = cargo ? cargo.costMultiplier : 1;
  const priorityMultiplier = priority ? priority.costMultiplier : 1;

  const routes = [];
  for (const strategy of ["time", "smooth", "energy"]) {
    const { path, visited } = astar(startState, goalState, strategy, floorMap, rules, cargoMultiplier, priorityMultiplier, params);
    routes.push(routeReport(strategy, path, visited));
  }

  const reachable = routes.filter((r) => r.reachable);
  const best = reachable.length > 0 ? reachable.reduce((a, b) => (a.score < b.score ? a : b)) : null;

  return { routes, bestRoute: best };
}

// 解析起终点名称为 {floor, pos} 格式
function resolvePoint(nameOrId, floorMap) {
  if (!nameOrId) return null;

  // 格式: '1F-药房'
  if (nameOrId.includes('-')) {
    const dashIdx = nameOrId.indexOf('-');
    const floor = nameOrId.substring(0, dashIdx);
    const name = nameOrId.substring(dashIdx + 1);
    const mapData = floorMap[floor];
    if (mapData && mapData.points[name]) {
      return { floor, pos: mapData.points[name] };
    }
  }

  // 传统格式：在所有楼层中查找
  for (const [floorId, mapData] of Object.entries(floorMap)) {
    if (mapData.points[nameOrId]) {
      return { floor: floorId, pos: mapData.points[nameOrId] };
    }
  }

  return null;
}

// ==================== 单层地图验证 ====================

export function validateMap(mapData) {
  const wallSet = new Set(mapData.walls.map((p) => `${p[0]},${p[1]}`));
  const dynamicSet = new Set(mapData.dynamic.map((p) => `${p[0]},${p[1]}`));
  const freeCells = mapData.cols * mapData.rows - wallSet.size;

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

// ==================== 多楼层验证 ====================

export function validateAllFloors(floorMap) {
  const results = {};
  for (const [floorId, mapData] of Object.entries(floorMap)) {
    results[floorId] = validateMap(mapData);
  }
  return results;
}

// ==================== 地图操作（单层） ====================

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

// ==================== 多楼层地图操作 ====================

export function updateFloorMap(operation, cell, floorMap, currentFloor) {
  const newFloorMap = JSON.parse(JSON.stringify(floorMap));
  newFloorMap[currentFloor] = updateMap(operation, cell, newFloorMap[currentFloor]);
  return newFloorMap;
}
