// A* 路径规划算法
export function findPath(nodes, edges, startId, endId, options = {}) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adjList = new Map();

  // 构建邻接表
  edges.forEach(e => {
    if (!adjList.has(e.from)) adjList.set(e.from, []);
    if (!adjList.has(e.to)) adjList.set(e.to, []);
    adjList.get(e.from).push({ to: e.to, cost: e.cost || 1, distance: e.distance || 100 });
    // 双向
    adjList.get(e.to).push({ to: e.from, cost: e.cost || 1, distance: e.distance || 100 });
  });

  // 启发函数（欧几里得距离）
  function heuristic(a, b) {
    const na = nodeMap.get(a), nb = nodeMap.get(b);
    if (!na || !nb) return 0;
    return Math.sqrt((na.x - nb.x) ** 2 + (na.y - nb.y) ** 2);
  }

  // A* 算法
  const openSet = new Set([startId]);
  const cameFrom = new Map();
  const gScore = new Map(nodes.map(n => [n.id, Infinity]));
  const fScore = new Map(nodes.map(n => [n.id, Infinity]));
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId, endId));

  while (openSet.size > 0) {
    // 找 fScore 最小的节点
    let current = null;
    let minF = Infinity;
    for (const id of openSet) {
      if (fScore.get(id) < minF) {
        minF = fScore.get(id);
        current = id;
      }
    }

    if (current === endId) {
      // 重建路径
      const path = [current];
      let c = current;
      while (cameFrom.has(c)) {
        c = cameFrom.get(c);
        path.unshift(c);
      }
      const totalDistance = gScore.get(endId);
      return {
        path,
        distance: Math.round(totalDistance),
        time: Math.round(totalDistance / (options.speed || 1.0) / 60), // 分钟
        energy: Math.round(totalDistance * 0.05), // 简化电量模型
        risk: totalDistance > 1000 ? 'high' : totalDistance > 500 ? 'medium' : 'low',
        reachable: true,
      };
    }

    openSet.delete(current);
    const neighbors = adjList.get(current) || [];
    for (const { to, cost } of neighbors) {
      const tentativeG = gScore.get(current) + cost;
      if (tentativeG < gScore.get(to)) {
        cameFrom.set(to, current);
        gScore.set(to, tentativeG);
        fScore.set(to, tentativeG + heuristic(to, endId));
        openSet.add(to);
      }
    }
  }

  return { path: [], distance: 0, time: 0, energy: 0, risk: 'low', reachable: false, reason: '无法到达目标节点' };
}

// 生成多条路径（A* + 模拟变体）
export function findMultiplePaths(nodes, edges, startId, endId) {
  const routeA = findPath(nodes, edges, startId, endId);
  if (!routeA.reachable) return { routeA, routeB: routeA, routeC: routeA };

  // 备用路径：增加代价模拟绕路
  const edgesB = edges.map(e => ({ ...e, cost: e.cost * 1.3 }));
  const routeB = findPath(nodes, edgesB, startId, endId);
  routeB.label = '备用路径B';
  routeB.time = Math.round(routeB.time * 1.2);
  routeB.energy = Math.round(routeB.energy * 1.15);

  // 应急路径：大幅增加代价
  const edgesC = edges.map(e => ({ ...e, cost: e.cost * 2.0 }));
  const routeC = findPath(nodes, edgesC, startId, endId);
  routeC.label = '应急路径C';
  routeC.time = Math.round(routeC.time * 1.5);
  routeC.energy = Math.round(routeC.energy * 1.3);

  routeA.label = '最优路径A';
  routeB.label = '备用路径B';
  routeC.label = '应急路径C';

  return { routeA, routeB, routeC };
}
