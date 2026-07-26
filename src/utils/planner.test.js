import { describe, it, expect } from "vitest";
import { astar, moveCost, routeReport, planRoutes, validateAllFloors } from "./planner";
import { multiFloorMap, defaultRules, elevatorPosition } from "../data/mapData";

// 构造一个只有边界墙的空旷单层地图
function makeOpenFloor(cols = 12, rows = 12) {
  return {
    cols,
    rows,
    walls: [
      ...Array.from({ length: cols }, (_, x) => [x, 0]),
      ...Array.from({ length: cols }, (_, x) => [x, rows - 1]),
      ...Array.from({ length: rows }, (_, y) => [0, y]),
      ...Array.from({ length: rows }, (_, y) => [cols - 1, y]),
    ],
    dynamic: [],
    points: {},
  };
}

const NO_PARAMS = { sensitivity: 0, buffer: 0 };

describe("astar 最优性", () => {
  it("空旷地图上路径长度等于曼哈顿距离", () => {
    const floorMap = { "1F": makeOpenFloor() };
    const { path } = astar(
      { floor: "1F", pos: [1, 1] },
      { floor: "1F", pos: [8, 6] },
      "time",
      floorMap,
      [],
      1,
      1,
      NO_PARAMS
    );
    expect(path.length - 1).toBe(7 + 5);
  });

  it("代价乘数（紧急优先级 0.7）不破坏最优性", () => {
    const floorMap = { "1F": makeOpenFloor() };
    const { path } = astar(
      { floor: "1F", pos: [1, 1] },
      { floor: "1F", pos: [8, 6] },
      "time",
      floorMap,
      defaultRules,
      1,
      0.7,
      NO_PARAMS
    );
    expect(path.length - 1).toBe(12);
  });

  it("目标不可达时返回空路径", () => {
    const floor = makeOpenFloor(8, 8);
    // 用墙把目标围死
    floor.walls.push([4, 3], [4, 5], [3, 4], [5, 4]);
    const { path } = astar(
      { floor: "1F", pos: [1, 1] },
      { floor: "1F", pos: [4, 4] },
      "time",
      { "1F": floor },
      [],
      1,
      1,
      NO_PARAMS
    );
    expect(path).toEqual([]);
  });
});

describe("routeReport 电梯换乘计数", () => {
  it("路径末尾的跨层只计一次（回归：曾被重复计数）", () => {
    const path = [
      { floor: "1F", pos: [14, 8] },
      { floor: "1F", pos: [14, 9] },
      { floor: "1F", pos: [14, 10] },
      { floor: "2F", pos: [14, 10] },
    ];
    const report = routeReport("time", path, new Set());
    expect(report.elevatorCount).toBe(1);
  });

  it("路径开头的跨层也被计入（回归：曾被漏计）", () => {
    const path = [
      { floor: "1F", pos: [14, 10] },
      { floor: "2F", pos: [14, 10] },
      { floor: "2F", pos: [14, 9] },
      { floor: "2F", pos: [14, 8] },
    ];
    const report = routeReport("time", path, new Set());
    expect(report.elevatorCount).toBe(1);
  });

  it("两段换乘计为 2 次", () => {
    const path = [
      { floor: "1F", pos: [14, 10] },
      { floor: "2F", pos: [14, 10] },
      { floor: "2F", pos: [14, 9] },
      { floor: "2F", pos: [14, 10] },
      { floor: "3F", pos: [14, 10] },
    ];
    const report = routeReport("time", path, new Set());
    expect(report.elevatorCount).toBe(2);
  });
});

describe("moveCost 规则闭合性", () => {
  const from = { floor: "3F", pos: [3, 15] };

  it("限速区权重 < 1 时不会变成低代价捷径", () => {
    const cheapSpeedLimit = [
      { id: "R6", name: "限速区", type: "speed_limit", enabled: true, weight: 0.5, floors: ["3F"], zone: { x: 2, y: 14, w: 5, h: 5 } },
    ];
    const inZoneCost = moveCost(from, { floor: "3F", pos: [3, 16] }, null, "time", cheapSpeedLimit, 1, 1, NO_PARAMS);
    const outZoneCost = moveCost({ floor: "3F", pos: [10, 10] }, { floor: "3F", pos: [10, 11] }, null, "time", cheapSpeedLimit, 1, 1, NO_PARAMS);
    expect(inZoneCost).toBeGreaterThanOrEqual(outZoneCost);
  });

  it("避让区内单步代价高于区外", () => {
    const rules = defaultRules.filter((r) => r.id === "R2").map((r) => ({ ...r, enabled: true }));
    const inCost = moveCost({ floor: "1F", pos: [19, 8] }, { floor: "1F", pos: [20, 8] }, null, "time", rules, 1, 1, NO_PARAMS);
    const outCost = moveCost({ floor: "1F", pos: [3, 3] }, { floor: "1F", pos: [4, 3] }, null, "time", rules, 1, 1, NO_PARAMS);
    expect(inCost).toBeGreaterThan(outCost);
  });

  it("低优先级（乘数 1.2）在受限区的惩罚高于紧急（乘数 0.7）", () => {
    const rules = defaultRules.filter((r) => r.id === "R2").map((r) => ({ ...r, enabled: true }));
    const urgent = moveCost({ floor: "1F", pos: [19, 8] }, { floor: "1F", pos: [20, 8] }, null, "time", rules, 1, 0.7, NO_PARAMS);
    const low = moveCost({ floor: "1F", pos: [19, 8] }, { floor: "1F", pos: [20, 8] }, null, "time", rules, 1, 1.2, NO_PARAMS);
    expect(low).toBeGreaterThan(urgent);
  });

  it("动态障碍规避灵敏度提高相邻格代价", () => {
    const floorCtx = {
      cols: 12,
      rows: 12,
      walls: new Set(),
      dynamic: new Set(["6,5"]),
    };
    const nearCost = moveCost({ floor: "1F", pos: [5, 6] }, { floor: "1F", pos: [6, 6] }, null, "time", [], 1, 1, { sensitivity: 5, buffer: 0 }, floorCtx);
    const farCost = moveCost({ floor: "1F", pos: [1, 1] }, { floor: "1F", pos: [2, 1] }, null, "time", [], 1, 1, { sensitivity: 5, buffer: 0 }, floorCtx);
    expect(nearCost).toBeGreaterThan(farCost);
  });
});

describe("默认地图与规划闭环", () => {
  it("三层默认地图全部连通", () => {
    const results = validateAllFloors(multiFloorMap);
    for (const floorId of Object.keys(multiFloorMap)) {
      expect(results[floorId].connected).toBe(true);
    }
  });

  it("默认任务（1F-药房 → 2F-消毒供应室）三策略均可达且恰经过一次电梯", () => {
    const task = { start: "1F-药房", end: "2F-消毒供应室", cargo: "medicine", priority: 2 };
    const cargoTypes = [{ id: "medicine", name: "药品配送", costMultiplier: 1.0 }];
    const priorityLevels = [{ id: 2, name: "高", costMultiplier: 0.85 }];
    const { routes, bestRoute } = planRoutes(task, { sensitivity: 2, buffer: 1 }, multiFloorMap, defaultRules, cargoTypes, priorityLevels);
    expect(routes).toHaveLength(3);
    for (const route of routes) {
      expect(route.reachable).toBe(true);
      expect(route.elevatorCount).toBe(1);
      // 换乘必然发生在电梯格
      const idx = route.path.findIndex((p, i) => i > 0 && route.path[i - 1].floor !== p.floor);
      expect(route.path[idx].pos).toEqual(elevatorPosition);
    }
    expect(bestRoute).not.toBeNull();
  });

  it("避让区启用时最优路径绕开污染区", () => {
    const task = { start: "1F-急诊科", end: "1F-充电站", cargo: "medicine", priority: 3 };
    const withRule = planRoutes(task, { sensitivity: 0, buffer: 0 }, multiFloorMap, defaultRules, [], []);
    const zoneCells = (route) =>
      route.path.filter((p) => p.floor === "1F" && p.pos[0] >= 18 && p.pos[0] <= 22 && p.pos[1] >= 7 && p.pos[1] <= 11).length;
    const noRules = planRoutes(task, { sensitivity: 0, buffer: 0 }, multiFloorMap, [], [], []);
    expect(zoneCells(withRule.bestRoute)).toBeLessThanOrEqual(zoneCells(noRules.bestRoute));
  });
});
