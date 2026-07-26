/**
 * 医院网格地图数据 - 多楼层版本
 * 1F/2F/3F 三层结构，电梯连接各层
 */

// 楼层定义
export const floors = [
  { id: '1F', name: '一层', description: '门诊大厅/药房/急诊科/收费处' },
  { id: '2F', name: '二层', description: '检验科/手术部/器械库/消毒中心' },
  { id: '3F', name: '三层', description: '住院部/ICU/血库/护士站' },
];

// 电梯位置（每层相同坐标，连接三层）
export const elevatorPosition = [14, 10];

// 电梯跨层代价
export const elevatorCost = 5;

// 多楼层地图数据
export const multiFloorMap = {
  '1F': {
    cols: 30,
    rows: 20,
    walls: [
      // 边界墙
      ...Array.from({ length: 30 }, (_, x) => [x, 0]),
      ...Array.from({ length: 30 }, (_, x) => [x, 19]),
      ...Array.from({ length: 20 }, (_, y) => [0, y]),
      ...Array.from({ length: 20 }, (_, y) => [29, y]),
      // 1F 内部水平墙 y=7, x:5-23 (跳过 x=14 电梯通道)
      ...Array.from({ length: 19 }, (_, i) => [5 + i, 7]).filter(([x]) => x !== 14),
      // 1F 内部水平墙 y=14, x:4-22 (跳过 x=9 通道)
      ...Array.from({ length: 19 }, (_, i) => [4 + i, 14]).filter(([x]) => x !== 9),
      // 1F 内部垂直墙 x=10, y:2-7 (跳过 y=5 通道)
      ...Array.from({ length: 6 }, (_, i) => [10, 2 + i]).filter(([, y]) => y !== 5),
      // 1F 内部垂直墙 x=22, y:2-7 (跳过 y=5 通道)
      ...Array.from({ length: 6 }, (_, i) => [22, 2 + i]).filter(([, y]) => y !== 5),
    ],
    dynamic: [[12, 10], [13, 10], [21, 8]],
    points: {
      '药房': [2, 3],
      '门诊大厅': [7, 10],
      '急诊科': [25, 3],
      '收费处': [14, 3],
      '电梯厅': [14, 10],
      '充电站': [2, 14],
    },
  },
  '2F': {
    cols: 30,
    rows: 20,
    walls: [
      // 边界墙
      ...Array.from({ length: 30 }, (_, x) => [x, 0]),
      ...Array.from({ length: 30 }, (_, x) => [x, 19]),
      ...Array.from({ length: 20 }, (_, y) => [0, y]),
      ...Array.from({ length: 20 }, (_, y) => [29, y]),
      // 2F 内部水平墙 y=6, x:3-18 (跳过 x=10 通道)
      ...Array.from({ length: 16 }, (_, i) => [3 + i, 6]).filter(([x]) => x !== 10),
      // 2F 内部水平墙 y=12, x:8-26 (跳过 x=14 电梯通道)
      ...Array.from({ length: 19 }, (_, i) => [8 + i, 12]).filter(([x]) => x !== 14),
      // 2F 内部垂直墙 x=20, y:2-18 (跳过 y=10 通道)
      ...Array.from({ length: 17 }, (_, i) => [20, 2 + i]).filter(([, y]) => y !== 10),
      // 2F 内部垂直墙 x=8, y:8-18 (跳过 y=14 通道)
      ...Array.from({ length: 11 }, (_, i) => [8, 8 + i]).filter(([, y]) => y !== 14),
    ],
    dynamic: [[15, 5], [10, 15]],
    points: {
      '检验科': [13, 3],
      '手术室': [25, 4],
      '消毒供应室': [27, 15],
      '器械库': [5, 8],
      '电梯厅': [14, 10],
    },
  },
  '3F': {
    cols: 30,
    rows: 20,
    walls: [
      // 边界墙
      ...Array.from({ length: 30 }, (_, x) => [x, 0]),
      ...Array.from({ length: 30 }, (_, x) => [x, 19]),
      ...Array.from({ length: 20 }, (_, y) => [0, y]),
      ...Array.from({ length: 20 }, (_, y) => [29, y]),
      // 3F 内部水平墙 y=5, x:2-20 (跳过 x=14 电梯通道)
      ...Array.from({ length: 19 }, (_, i) => [2 + i, 5]).filter(([x]) => x !== 14),
      // 3F 内部水平墙 y=11, x:6-24 (跳过 x=14 电梯通道)
      ...Array.from({ length: 19 }, (_, i) => [6 + i, 11]).filter(([x]) => x !== 14),
      // 3F 内部垂直墙 x=18, y:2-11 (跳过 y=8 通道，ICU门口)
      ...Array.from({ length: 10 }, (_, i) => [18, 2 + i]).filter(([, y]) => y !== 8),
      // 3F 内部垂直墙 x=10, y:12-18 (跳过 y=16 通道)
      ...Array.from({ length: 7 }, (_, i) => [10, 12 + i]).filter(([, y]) => y !== 16),
    ],
    dynamic: [[8, 8], [22, 14]],
    points: {
      'ICU': [18, 8],
      '血库': [6, 4],
      '住院区A': [4, 16],
      '住院区B': [17, 16],
      '护士站': [14, 6],
      '电梯厅': [14, 10],
    },
  },
};

// 所有楼层的所有科室（带楼层前缀，用于起终点选择）
export const allPoints = [];
Object.entries(multiFloorMap).forEach(([floorId, floorData]) => {
  Object.entries(floorData.points).forEach(([name, pos]) => {
    allPoints.push({
      id: `${floorId}-${name}`,
      floor: floorId,
      name,
      pos,
    });
  });
});

// 向后兼容：默认地图数据（1F）
export const defaultMapData = {
  ...multiFloorMap['1F'],
  points: {
    ...multiFloorMap['1F'].points,
    '检验科': multiFloorMap['2F'].points['检验科'],
    '手术室': multiFloorMap['2F'].points['手术室'],
    '住院区A': multiFloorMap['3F'].points['住院区A'],
    '住院区B': multiFloorMap['3F'].points['住院区B'],
    '消毒供应室': multiFloorMap['2F'].points['消毒供应室'],
  },
};

// 默认规则（6条）
// zone: 规则生效的矩形区域（网格坐标，含 x..x+w-1, y..y+h-1），
// 代价计算、地图渲染、规则页描述都以这里为唯一数据源
export const defaultRules = [
  { id: "R1", name: "手术区优先通行", type: "priority_zone", enabled: true, weight: 1.3, floors: ["2F"], zone: { x: 23, y: 2, w: 5, h: 5 } },
  { id: "R2", name: "污染区避让", type: "avoid_zone", enabled: true, weight: 2.0, floors: ["1F"], zone: { x: 18, y: 7, w: 5, h: 5 } },
  { id: "R3", name: "平稳优先", type: "smooth", enabled: true, weight: 1.2, floors: ["1F", "2F", "3F"] },
  { id: "R4", name: "低电量节能", type: "energy", enabled: true, weight: 1.1, floors: ["1F", "2F", "3F"] },
  { id: "R5", name: "禁行区", type: "no_go", enabled: false, weight: 99, floors: ["1F"], zone: { x: 12, y: 8, w: 5, h: 5 } },
  { id: "R6", name: "限速区", type: "speed_limit", enabled: false, weight: 1.8, floors: ["3F"], zone: { x: 2, y: 14, w: 5, h: 5 } },
];

// 判断网格坐标是否落在规则区域内
export function inZone(zone, x, y) {
  return x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h;
}

// 规则区域在地图上的展示样式（按规则类型）
export const ruleZoneStyles = {
  avoid_zone: { fill: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.6)", text: "#f87171" },
  priority_zone: { fill: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.6)", text: "#34d399" },
  no_go: { fill: "rgba(239, 68, 68, 0.3)", border: "rgba(248, 113, 113, 0.9)", text: "#fca5a5" },
  speed_limit: { fill: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.6)", text: "#fbbf24" },
};

// 默认参数
// sensitivity: 动态障碍规避灵敏度（0-5），越高路径离动态障碍越远
// buffer: 墙体安全缓冲（0-3），越高路径越倾向远离墙壁
export const defaultParams = {
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

// 科室颜色（多楼层通用）
export const pointColors = {
  '药房': "#4caf50",
  '门诊大厅': "#00bcd4",
  '急诊科': "#f44336",
  '收费处': "#ff9800",
  '电梯厅': "#607d8b",
  '充电站': "#ffc107",
  '检验科': "#2196f3",
  '手术室': "#f44336",
  '消毒供应室': "#ff9800",
  '器械库': "#795548",
  'ICU': "#e91e63",
  '血库': "#9c27b0",
  '住院区A': "#9c27b0",
  '住院区B': "#9c27b0",
  '护士站': "#3f51b5",
};

// 科室图标
export const pointIcons = {
  '药房': "💊",
  '门诊大厅': "🏥",
  '急诊科': "🚑",
  '收费处': "💰",
  '电梯厅': "🛗",
  '充电站': "🔋",
  '检验科': "🔬",
  '手术室': "🏥",
  '消毒供应室': "🧹",
  '器械库': "🔧",
  'ICU': "❤️‍🩹",
  '血库': "🩸",
  '住院区A': "🛏️",
  '住院区B': "🛏️",
  '护士站': "👩‍⚕️",
};

// 楼层颜色
export const floorColors = {
  '1F': "#3b82f6",
  '2F': "#10b981",
  '3F': "#f59e0b",
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
