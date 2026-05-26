/**
 * 医院网格地图数据 - 对标 planner.py BASE.map
 * 30x20 网格，边界墙 + 内部障碍 + 动态障碍 + 科室节点
 */

// 默认地图配置
export const defaultMapData = {
  cols: 30,
  rows: 20,
  walls: [
    // 边界墙
    ...Array.from({ length: 30 }, (_, x) => [x, 0]),
    ...Array.from({ length: 30 }, (_, x) => [x, 19]),
    ...Array.from({ length: 20 }, (_, y) => [0, y]),
    ...Array.from({ length: 20 }, (_, y) => [29, y]),
    // 内部水平墙 y=7, x:5-23 (跳过 x=14 电梯通道)
    ...Array.from({ length: 19 }, (_, i) => [5 + i, 7]).filter(([x]) => x !== 14),
    // 内部水平墙 y=13, x:4-21 (跳过 x=9 通道)
    ...Array.from({ length: 18 }, (_, i) => [4 + i, 13]).filter(([x]) => x !== 9),
    // 内部垂直墙 x=20, y:3-16 (跳过 y=10 通道)
    ...Array.from({ length: 14 }, (_, i) => [20, 3 + i]).filter(([, y]) => y !== 10),
  ],
  dynamic: [[12, 10], [13, 10], [21, 8]],
  points: {
    药房: [2, 3],
    检验科: [13, 3],
    手术室: [25, 4],
    住院区A: [4, 16],
    住院区B: [17, 16],
    消毒供应室: [27, 15],
    电梯厅: [14, 10],
  },
};

// 默认规则
export const defaultRules = [
  { id: "R1", name: "手术区优先通行", type: "priority_zone", enabled: true, weight: 1.3 },
  { id: "R2", name: "污染区避让", type: "avoid_zone", enabled: true, weight: 2.0 },
  { id: "R3", name: "平稳优先", type: "smooth", enabled: true, weight: 1.2 },
  { id: "R4", name: "低电量节能路径", type: "energy", enabled: true, weight: 1.1 },
];

// 默认参数
export const defaultParams = {
  strategy: "time",
  sensitivity: 2,
  buffer: 1,
};

// 科室颜色
export const pointColors = {
  药房: "#4caf50",
  检验科: "#2196f3",
  手术室: "#f44336",
  住院区A: "#9c27b0",
  住院区B: "#9c27b0",
  消毒供应室: "#ff9800",
  电梯厅: "#607d8b",
};

// 科室图标
export const pointIcons = {
  药房: "💊",
  检验科: "🔬",
  手术室: "🏥",
  住院区A: "🛏️",
  住院区B: "🛏️",
  消毒供应室: "🧹",
  电梯厅: "🛗",
};

// 策略颜色
export const strategyColors = {
  time: "#4caf50",
  smooth: "#ff9800",
  energy: "#2196f3",
};

// 策略名称
export const strategyNames = {
  time: "最优路径A-时间优先",
  smooth: "备用路径B-平稳优先",
  energy: "应急路径C-节能优先",
};

// 机器人初始数据
export const initialRobots = [
  { id: "R1", name: "运输机器人1号", pos: [2, 3], status: "idle", battery: 85, speed: 1.2, taskId: null },
  { id: "R2", name: "运输机器人2号", pos: [14, 10], status: "idle", battery: 92, speed: 1.0, taskId: null },
  { id: "R3", name: "运输机器人3号", pos: [13, 3], status: "idle", battery: 45, speed: 1.1, taskId: null },
  { id: "R4", name: "运输机器人4号", pos: [25, 4], status: "charging", battery: 15, speed: 0.8, taskId: null },
  { id: "R5", name: "运输机器人5号", pos: [17, 16], status: "idle", battery: 78, speed: 1.3, taskId: null },
  { id: "R6", name: "运输机器人6号", pos: [27, 15], status: "idle", battery: 60, speed: 1.0, taskId: null },
];
