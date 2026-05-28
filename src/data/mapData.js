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

// 默认规则（6条）
export const defaultRules = [
  { id: "R1", name: "手术区优先通行", type: "priority_zone", enabled: true, weight: 1.3 },
  { id: "R2", name: "污染区避让", type: "avoid_zone", enabled: true, weight: 2.0 },
  { id: "R3", name: "平稳优先", type: "smooth", enabled: true, weight: 1.2 },
  { id: "R4", name: "低电量节能", type: "energy", enabled: true, weight: 1.1 },
  { id: "R5", name: "禁行区", type: "no_go", enabled: false, weight: 99 },
  { id: "R6", name: "限速区", type: "speed_limit", enabled: false, weight: 1.8 },
];

// 默认参数
export const defaultParams = {
  strategy: "time",
  sensitivity: 2,
  buffer: 1,
};

// 货物类型影响代价
export const cargoTypes = [
  { id: "medicine", name: "药品配送", costMultiplier: 1.0, icon: "💊" },
  { id: "sample", name: "样本转运", costMultiplier: 1.2, icon: "🧪" },
  { id: "instrument", name: "器械运输", costMultiplier: 1.1, icon: "🔧" },
  { id: "waste", name: "医疗废物", costMultiplier: 1.5, icon: "☣️" },
];

// 优先级影响代价
export const priorityLevels = [
  { id: 1, name: "紧急", costMultiplier: 0.7, color: "#ef4444" },
  { id: 2, name: "高", costMultiplier: 0.85, color: "#f97316" },
  { id: 3, name: "普通", costMultiplier: 1.0, color: "#3b82f6" },
  { id: 4, name: "低", costMultiplier: 1.2, color: "#6b7280" },
];

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
