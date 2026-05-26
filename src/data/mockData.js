/**
 * 静态参考数据 - 供辅助页面使用
 * 核心数据已迁移到 mapData.js + AppStore.jsx
 */

// HIS 策略配置
export const hisPolicies = [
  { id: "HP01", name: "手术室通行策略", rule: "7:00-19:00 禁止通行", active: true, priority: "critical", status: "active", trigger: "7:00-19:00 手术时段", action: "禁止机器人通行" },
  { id: "HP02", name: "ICU低速策略", rule: "限速0.5m/s", active: true, priority: "high", status: "active", trigger: "ICU区域进入检测", action: "限速0.5m/s" },
  { id: "HP03", name: "药房高峰策略", rule: "9-11时/14-16时代价增加", active: true, priority: "normal", status: "active", trigger: "9-11时/14-16时高峰时段", action: "代价增加3倍" },
  { id: "HP04", name: "污染区隔离策略", rule: "需授权通行", active: false, priority: "high", status: "inactive", trigger: "污染区入口检测", action: "需授权码通行" },
  { id: "HP05", name: "无菌通道策略", rule: "仅限无菌任务通行", active: true, priority: "normal", status: "active", trigger: "无菌通道入口检测", action: "仅限无菌任务类型通行" },
];

// 货物风险评估
export const cargoRisks = [
  { type: "药品配送", riskLevel: "medium", constraints: ["温度控制", "防震", "时效性"], weight: 5, icon: "💊" },
  { type: "样本转运", riskLevel: "high", constraints: ["生物安全", "温度控制", "防泄漏", "时效性"], weight: 3, icon: "🧪" },
  { type: "器械运输", riskLevel: "low", constraints: ["防碰撞", "固定"], weight: 10, icon: "🔧" },
  { type: "医疗废物处理", riskLevel: "critical", constraints: ["密封", "隔离", "防泄漏", "专人处理"], weight: 8, icon: "☣️" },
];

// 交通信号
export const trafficSignals = [
  { id: "TS01", state: "green", status: "green", direction: "南北", duration: 30, location: "大厅北通道" },
  { id: "TS02", state: "red", status: "red", direction: "东西", duration: 15, location: "大厅东通道" },
  { id: "TS03", state: "green", status: "green", direction: "南北", duration: 25, location: "大厅南通道" },
  { id: "TS04", state: "yellow", status: "yellow", direction: "东西", duration: 10, location: "ICU入口" },
];

// 碰撞预警
export const collisionAlerts = [
  { id: "CA01", robot: "R1", other: "R2", location: "主大厅", time: "22:30:05", distance: 1.8, action: "减速避让", risk: "high", type: "正面碰撞" },
  { id: "CA02", robot: "R3", other: "未知障碍", location: "住院部走廊", time: "22:28:40", distance: 2.3, action: "局部重规划", risk: "medium", type: "静态障碍" },
  { id: "CA03", robot: "R4", other: "R6", location: "ICU走廊", time: "22:25:10", distance: 1.5, action: "等待通行", risk: "high", type: "交叉碰撞" },
];

// 冲突预测
export const conflictPredictions = [
  { id: "CP01", robots: ["R1", "R2"], location: "大厅北门", predictedTime: "22:35:00", probability: 0.85, suggestion: "R2减速等待", type: "路径交叉", eta: 15, resolution: "R2减速等待R1通过" },
  { id: "CP02", robots: ["R4", "R6"], location: "药房入口", predictedTime: "22:38:00", probability: 0.62, suggestion: "R6改走备用路径", type: "死锁风险", eta: 30, resolution: "R6改走备用路径" },
];

// 任务队列
export const taskQueue = [
  { id: "T001", type: "药品配送", from: "药房", to: "住院区A", priority: "high", status: "pending", assignedRobot: null, cargo: "抗生素+输液", weight: 3.2, deadline: "14:30" },
  { id: "T002", type: "样本转运", from: "住院区B", to: "检验科", priority: "normal", status: "executing", assignedRobot: "R2", cargo: "血液样本", weight: 1.5, deadline: "14:00" },
  { id: "T003", type: "器械运输", from: "手术室", to: "消毒供应室", priority: "high", status: "pending", assignedRobot: null, cargo: "手术器械套装", weight: 12.0, deadline: "15:00" },
  { id: "T004", type: "药品配送", from: "药房", to: "电梯厅", priority: "critical", status: "executing", assignedRobot: "R1", cargo: "急救药品", weight: 2.0, deadline: "13:45" },
];

// 充电桩
export const chargingStations = [
  { id: "CS01", name: "1号充电桩", location: "充电站A区", status: "available", power: 50 },
  { id: "CS02", name: "2号充电桩", location: "充电站A区", status: "occupied", power: 50, robotId: "R4" },
  { id: "CS03", name: "3号充电桩", location: "充电站B区", status: "fault", power: 0 },
];

// 诊断日志
export const diagnosticsLog = [
  { id: "D001", robot: "R4", type: "电量异常", level: "critical", message: "电量低于25%，已自动调度充电", time: "2026-05-25 22:30:15" },
  { id: "D002", robot: "R3", type: "路径偏差", level: "warning", message: "偏离规划路径0.8m，已触发重规划", time: "2026-05-25 22:28:40" },
  { id: "D003", robot: "R1", type: "传感器正常", level: "info", message: "所有传感器状态正常", time: "2026-05-25 22:25:00" },
];

// 任务分配
export const taskAssignments = [
  { taskId: "T001", robotId: "R1", score: 92, reason: "距离最近+类型匹配+电量充足" },
  { taskId: "T002", robotId: "R2", score: 88, reason: "样本转运专用+已在住院部" },
  { taskId: "T003", robotId: "R3", score: 75, reason: "器械运输能力匹配" },
  { taskId: "T004", robotId: "R5", score: 95, reason: "药品配送+距离药房最近" },
];

// 区域代价配置
export const areaCostConfig = [
  { area: "主大厅", baseCost: 0.8, currentCost: 0.8, policy: "正常通行", color: "#e8f5e9" },
  { area: "手术室区域", baseCost: 10.0, currentCost: 10.0, policy: "禁止通行", color: "#ffcdd2" },
  { area: "ICU走廊", baseCost: 2.0, currentCost: 2.0, policy: "减速通行", color: "#f3e5f5" },
  { area: "药房入口", baseCost: 3.0, currentCost: 3.0, policy: "限速通行", color: "#fff9c4" },
  { area: "普通走廊", baseCost: 1.0, currentCost: 1.0, policy: "正常通行", color: "#e3f2fd" },
  { area: "污染区走廊", baseCost: 4.0, currentCost: 4.0, policy: "隔离通行", color: "#ffccbc" },
];

// 别名
export const tasks = taskQueue;
