// ==================== 医院地图语义建模 ====================
// 基于 hospital_map_semantic_modeling 函数的数据结构

// 地图区域类型定义（对应软著中的语义区域）
export const AREA_TYPES = {
  MAIN_HALL: { id: 'main_hall', name: '主大厅', color: '#e8f5e9', cost: 0.8, buffer: 0.6 },
  SURGERY_ZONE: { id: 'surgery_zone', name: '手术室区域', color: '#ffcdd2', cost: 10.0, buffer: 1.2 },
  ICU_CORRIDOR: { id: 'icu_corridor', name: 'ICU走廊', color: '#f3e5f5', cost: 2.0, buffer: 0.8 },
  PHARMACY_ENTRANCE: { id: 'pharmacy_entrance', name: '药房入口', color: '#fff9c4', cost: 3.0, buffer: 0.7 },
  NARROW_CORRIDOR: { id: 'narrow_corridor', name: '狭窄走廊', color: '#ffe0b2', cost: 3.0, buffer: 0.6 },
  GENERAL_CORRIDOR: { id: 'general_corridor', name: '普通走廊', color: '#e3f2fd', cost: 1.0, buffer: 0.6 },
  ELEVATOR_AREA: { id: 'elevator_area', name: '电梯间', color: '#d7ccc8', cost: 1.5, buffer: 0.5 },
  CLEAN_CORRIDOR: { id: 'clean_corridor', name: '无菌通道', color: '#c8e6c9', cost: 2.5, buffer: 1.0 },
  CONTAMINATED: { id: 'contaminated', name: '污染区走廊', color: '#ffccbc', cost: 4.0, buffer: 0.8 },
  PHARMACY: { id: 'pharmacy', name: '药房通道', color: '#dcedc8', cost: 2.0, buffer: 0.7 },
};

// 医院地图节点（对应 raw_map_data.features）
export const mapNodes = [
  // 主大厅区域
  { id: 'node_0', x: 400, y: 300, type: 'hall', area: 'main_hall', label: '主大厅' },
  { id: 'node_1', x: 300, y: 300, type: 'corner', area: 'main_hall', label: '大厅西角' },
  { id: 'node_2', x: 500, y: 300, type: 'corner', area: 'main_hall', label: '大厅东角' },
  { id: 'node_3', x: 400, y: 200, type: 'doorway', area: 'main_hall', label: '大厅北门' },
  { id: 'node_4', x: 400, y: 400, type: 'doorway', area: 'main_hall', label: '大厅南门' },

  // 手术室区域
  { id: 'node_5', x: 150, y: 150, type: 'doorway', area: 'surgery_zone', label: '手术室1门口' },
  { id: 'node_6', x: 250, y: 150, type: 'doorway', area: 'surgery_zone', label: '手术室2门口' },
  { id: 'node_7', x: 150, y: 250, type: 'corner', area: 'surgery_zone', label: '手术区走廊' },
  { id: 'node_8', x: 250, y: 250, type: 'corner', area: 'surgery_zone', label: '手术区出口' },

  // ICU区域
  { id: 'node_9', x: 550, y: 150, type: 'doorway', area: 'icu_corridor', label: 'ICU病房门口' },
  { id: 'node_10', x: 650, y: 150, type: 'doorway', area: 'icu_corridor', label: 'ICU护士站' },
  { id: 'node_11', x: 600, y: 250, type: 'corner', area: 'icu_corridor', label: 'ICU走廊' },

  // 药房区域
  { id: 'node_12', x: 150, y: 400, type: 'doorway', area: 'pharmacy', label: '药房门口' },
  { id: 'node_13', x: 250, y: 400, type: 'doorway', area: 'pharmacy_entrance', label: '药房入口' },
  { id: 'node_14', x: 150, y: 500, type: 'corner', area: 'pharmacy', label: '药房内部' },

  // 住院部区域
  { id: 'node_15', x: 550, y: 400, type: 'doorway', area: 'general_corridor', label: '住院部门口' },
  { id: 'node_16', x: 650, y: 400, type: 'doorway', area: 'general_corridor', label: '住院部护士站' },
  { id: 'node_17', x: 600, y: 500, type: 'corner', area: 'general_corridor', label: '住院部走廊' },

  // 电梯
  { id: 'node_18', x: 350, y: 200, type: 'elevator', area: 'elevator_area', label: '1号电梯' },
  { id: 'node_19', x: 450, y: 200, type: 'elevator', area: 'elevator_area', label: '2号电梯' },

  // 无菌通道
  { id: 'node_20', x: 300, y: 200, type: 'doorway', area: 'clean_corridor', label: '无菌通道入口' },
  { id: 'node_21', x: 300, y: 150, type: 'corner', area: 'clean_corridor', label: '无菌通道' },

  // 污染区
  { id: 'node_22', x: 500, y: 400, type: 'doorway', area: 'contaminated', label: '污染区入口' },
  { id: 'node_23', x: 500, y: 500, type: 'corner', area: 'contaminated', label: '污染区走廊' },

  // 充电站
  { id: 'node_24', x: 400, y: 500, type: 'charging', area: 'main_hall', label: '充电站' },
];

// 墙壁线段
export const wallSegments = [
  [[50, 50], [750, 50]],
  [[750, 50], [750, 550]],
  [[750, 550], [50, 550]],
  [[50, 550], [50, 50]],
  [[100, 100], [300, 100]],
  [[300, 100], [300, 300]],
  [[100, 300], [300, 300]],
  [[100, 100], [100, 300]],
  [[500, 100], [700, 100]],
  [[700, 100], [700, 300]],
  [[500, 300], [700, 300]],
  [[500, 100], [500, 300]],
  [[100, 350], [300, 350]],
  [[300, 350], [300, 550]],
  [[100, 550], [300, 550]],
  [[100, 350], [100, 550]],
  [[500, 350], [700, 350]],
  [[700, 350], [700, 550]],
  [[500, 550], [700, 550]],
  [[500, 350], [500, 550]],
  [[300, 100], [300, 200]],
  [[500, 100], [500, 200]],
  [[300, 350], [300, 400]],
  [[500, 350], [500, 400]],
];

// 门线段
export const doorSegments = [
  [[200, 100], [220, 100]],
  [[260, 100], [280, 100]],
  [[600, 100], [620, 100]],
  [[660, 100], [680, 100]],
  [[200, 350], [220, 350]],
  [[260, 350], [280, 350]],
  [[600, 350], [620, 350]],
  [[660, 350], [680, 350]],
  [[380, 50], [420, 50]],
  [[380, 550], [420, 550]],
];

// 窗户线段
export const windowSegments = [
  [[150, 100], [180, 100]],
  [[550, 100], [580, 100]],
  [[150, 550], [180, 550]],
  [[550, 550], [580, 550]],
];

// 图拓扑边（自动生成）
export const mapEdges = [];

function buildEdges() {
  const maxDist = 200;
  for (let i = 0; i < mapNodes.length; i++) {
    for (let j = i + 1; j < mapNodes.length; j++) {
      const n1 = mapNodes[i];
      const n2 = mapNodes[j];
      const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
      if (dist <= maxDist) {
        const areaKey = Object.keys(AREA_TYPES).find(k => AREA_TYPES[k].id === n1.area);
        const areaType = areaKey ? AREA_TYPES[areaKey] : AREA_TYPES.GENERAL_CORRIDOR;
        const baseCost = areaType.cost;
        const congestion = 0.2 + Math.random() * 0.3;
        const slope = Math.random() * 0.1;
        const doorStatus = 1.0;
        const totalWeight = (dist / 10) * baseCost * (1 + 0.5 * congestion + 0.3 * slope + 0.2 * doorStatus);
        mapEdges.push({
          source: n1.id,
          target: n2.id,
          length: dist / 10,
          cost: totalWeight,
          congestion,
          slope,
          doorStatus: 'open',
        });
      }
    }
  }
}
buildEdges();

// 机器人数据（添加 color 字段供页面使用）
export const robots = [
  { id: 'R001', name: '药配送机器人A', type: '药品配送', x: 400, y: 300, battery: 78, status: 'running', speed: 1.2, heading: 0, color: '#4caf50' },
  { id: 'R002', name: '样本转运机器人B', type: '样本转运', x: 150, y: 250, battery: 65, status: 'running', speed: 0.8, heading: Math.PI / 2, color: '#2196f3' },
  { id: 'R003', name: '器械运输机器人C', type: '器械运输', x: 600, y: 400, battery: 42, status: 'idle', speed: 0, heading: Math.PI, color: '#ff9800' },
  { id: 'R004', name: '药品配送机器人D', type: '药品配送', x: 250, y: 400, battery: 91, status: 'running', speed: 1.0, heading: -Math.PI / 2, color: '#9c27b0' },
  { id: 'R005', name: '废物处理机器人E', type: '医疗废物处理', x: 500, y: 500, battery: 23, status: 'charging', speed: 0, heading: 0, color: '#f44336' },
  { id: 'R006', name: '样本转运机器人F', type: '样本转运', x: 650, y: 150, battery: 88, status: 'running', speed: 1.1, heading: Math.PI, color: '#00bcd4' },
];

// 预计算路径数据（添加 from/to/smoothness，展平 metrics）
export const mockPaths = [
  {
    id: 'path_1',
    robot: 'R001',
    algorithm: 'A*',
    from: '主大厅',
    to: '手术室1门口',
    nodes: ['node_0', 'node_1', 'node_7', 'node_5'],
    coords: [[400, 300], [300, 300], [150, 250], [150, 150]],
    length: 42.4,
    time: 35.3,
    energy: 44.5,
    reliability: 0.92,
    smoothness: 0.87,
  },
  {
    id: 'path_2',
    robot: 'R002',
    algorithm: 'RRT*',
    from: '手术区走廊',
    to: '住院部门口',
    nodes: ['node_7', 'node_8', 'node_0', 'node_15'],
    coords: [[150, 250], [250, 250], [400, 300], [550, 400]],
    length: 58.3,
    time: 48.6,
    energy: 61.2,
    reliability: 0.85,
    smoothness: 0.79,
  },
  {
    id: 'path_3',
    robot: 'R003',
    algorithm: '混合算法',
    from: 'ICU走廊',
    to: '药房门口',
    nodes: ['node_11', 'node_0', 'node_13'],
    coords: [[600, 250], [400, 300], [250, 400]],
    length: 51.2,
    time: 42.7,
    energy: 53.8,
    reliability: 0.90,
    smoothness: 0.83,
  },
];

// NavMesh 三角网格数据
export const navMeshTriangles = [
  { vertices: [[300, 300], [400, 300], [350, 200]], area: 'main_hall' },
  { vertices: [[400, 300], [500, 300], [450, 200]], area: 'main_hall' },
  { vertices: [[300, 300], [400, 300], [350, 400]], area: 'main_hall' },
  { vertices: [[400, 300], [500, 300], [450, 400]], area: 'main_hall' },
  { vertices: [[150, 150], [250, 150], [200, 250]], area: 'surgery_zone' },
  { vertices: [[150, 250], [250, 250], [200, 150]], area: 'surgery_zone' },
  { vertices: [[550, 150], [650, 150], [600, 250]], area: 'icu_corridor' },
  { vertices: [[150, 400], [250, 400], [200, 500]], area: 'pharmacy' },
  { vertices: [[550, 400], [650, 400], [600, 500]], area: 'general_corridor' },
  { vertices: [[300, 200], [350, 200], [300, 300]], area: 'clean_corridor' },
  { vertices: [[450, 200], [500, 200], [500, 300]], area: 'elevator_area' },
];

// UWB 基站数据
export const uwbAnchors = [
  { id: 'UWB_A1', x: 100, y: 100, range: 150 },
  { id: 'UWB_A2', x: 700, y: 100, range: 150 },
  { id: 'UWB_A3', x: 400, y: 550, range: 150 },
];

// 充电桩数据（添加 name/location，调整 status 值）
export const chargingStations = [
  { id: 'CS01', name: '1号充电桩', location: '充电站A区', x: 380, y: 500, status: 'available', power: 50 },
  { id: 'CS02', name: '2号充电桩', location: '充电站A区', x: 420, y: 500, status: 'occupied', power: 50, robotId: 'R005' },
  { id: 'CS03', name: '3号充电桩', location: '充电站B区', x: 400, y: 530, status: 'fault', power: 0 },
];

// 任务数据（添加 cargo/weight/deadline，调整 priority 值）
export const taskQueue = [
  { id: 'T001', type: '药品配送', from: '药房', to: '住院部3楼', priority: 'high', status: 'pending', assignedRobot: null, cargo: '抗生素+输液', weight: 3.2, deadline: '14:30' },
  { id: 'T002', type: '样本转运', from: '住院部', to: '检验科', priority: 'normal', status: 'executing', assignedRobot: 'R002', cargo: '血液样本', weight: 1.5, deadline: '14:00' },
  { id: 'T003', type: '器械运输', from: '手术室', to: '消毒中心', priority: 'high', status: 'pending', assignedRobot: null, cargo: '手术器械套装', weight: 12.0, deadline: '15:00' },
  { id: 'T004', type: '药品配送', from: '药房', to: 'ICU', priority: 'critical', status: 'executing', assignedRobot: 'R001', cargo: '急救药品', weight: 2.0, deadline: '13:45' },
  { id: 'T005', type: '医疗废物处理', from: '住院部', to: '废物处理间', priority: 'normal', status: 'completed', assignedRobot: 'R005', cargo: '感染性废物', weight: 8.0, deadline: '16:00' },
  { id: 'T006', type: '样本转运', from: 'ICU', to: '检验科', priority: 'high', status: 'pending', assignedRobot: null, cargo: '尿液样本', weight: 0.8, deadline: '14:15' },
  { id: 'T007', type: '药品配送', from: '药房', to: '手术室', priority: 'critical', status: 'executing', assignedRobot: 'R004', cargo: '麻醉药品', weight: 1.5, deadline: '13:30' },
  { id: 'T008', type: '器械运输', from: '消毒中心', to: '手术室', priority: 'normal', status: 'pending', assignedRobot: null, cargo: '消毒后器械', weight: 10.0, deadline: '15:30' },
];

// 诊断日志
export const diagnosticsLog = [
  { id: 'D001', robot: 'R005', type: '电量异常', level: 'critical', message: '电量低于25%，已自动调度充电', time: '2026-05-25 22:30:15' },
  { id: 'D002', robot: 'R003', type: '路径偏差', level: 'warning', message: '偏离规划路径0.8m，已触发重规划', time: '2026-05-25 22:28:40' },
  { id: 'D003', robot: 'R001', type: '传感器正常', level: 'info', message: '所有传感器状态正常', time: '2026-05-25 22:25:00' },
  { id: 'D004', robot: 'R002', type: '碰撞预警', level: 'warning', message: '检测到前方2m有障碍物，已减速', time: '2026-05-25 22:20:30' },
  { id: 'D005', robot: 'R004', type: '通信正常', level: 'info', message: '与调度中心通信正常，延迟12ms', time: '2026-05-25 22:18:00' },
  { id: 'D006', robot: 'R006', type: 'UWB定位', level: 'info', message: 'UWB定位置信度0.94，精度良好', time: '2026-05-25 22:15:20' },
  { id: 'D007', robot: 'R003', type: '任务超时', level: 'warning', message: '任务T003执行超时，建议重新调度', time: '2026-05-25 22:10:45' },
  { id: 'D008', robot: 'R001', type: '充电完成', level: 'info', message: '充电完成，电量95%', time: '2026-05-25 21:50:00' },
];

// HIS 策略配置（添加 priority/status/trigger/action）
export const hisPolicies = [
  { id: 'HP01', name: '手术室通行策略', area: 'surgery_zone', rule: '7:00-19:00 禁止通行', active: true, costMultiplier: 100, priority: 'critical', status: 'active', trigger: '7:00-19:00 手术时段', action: '禁止机器人通行，代价设为99' },
  { id: 'HP02', name: 'ICU低速策略', area: 'icu_corridor', rule: '限速0.5m/s', active: true, costMultiplier: 2, priority: 'high', status: 'active', trigger: 'ICU区域进入检测', action: '限速0.5m/s，代价×2' },
  { id: 'HP03', name: '药房高峰策略', area: 'pharmacy_entrance', rule: '9-11时/14-16时代价增加', active: true, costMultiplier: 3, priority: 'normal', status: 'active', trigger: '9-11时/14-16时高峰时段', action: '代价增加3倍，建议绕行' },
  { id: 'HP04', name: '污染区隔离策略', area: 'contaminated', rule: '需授权通行', active: false, costMultiplier: 50, priority: 'high', status: 'inactive', trigger: '污染区入口检测', action: '需授权码通行，否则禁止' },
  { id: 'HP05', name: '无菌通道策略', area: 'clean_corridor', rule: '仅限无菌任务通行', active: true, costMultiplier: 2.5, priority: 'normal', status: 'active', trigger: '无菌通道入口检测', action: '仅限无菌任务类型通行' },
];

// 货物风险评估（添加 icon）
export const cargoRisks = [
  { type: '药品配送', riskLevel: 'medium', constraints: ['温度控制', '防震', '时效性'], weight: 5, icon: '💊' },
  { type: '样本转运', riskLevel: 'high', constraints: ['生物安全', '温度控制', '防泄漏', '时效性'], weight: 3, icon: '🧪' },
  { type: '器械运输', riskLevel: 'low', constraints: ['防碰撞', '固定'], weight: 10, icon: '🔧' },
  { type: '医疗废物处理', riskLevel: 'critical', constraints: ['密封', '隔离', '防泄漏', '专人处理'], weight: 8, icon: '☣️' },
];

// 别名导出（兼容页面组件）
export const tasks = taskQueue;
export const taskAssignments = [
  { taskId: 'T001', robotId: 'R001', score: 92, reason: '距离最近+类型匹配+电量充足' },
  { taskId: 'T002', robotId: 'R002', score: 88, reason: '样本转运专用+已在住院部' },
  { taskId: 'T003', robotId: 'R003', score: 75, reason: '器械运输能力匹配' },
  { taskId: 'T004', robotId: 'R004', score: 95, reason: '药品配送+距离药房最近' },
  { taskId: 'T006', robotId: 'R006', score: 82, reason: '样本转运+ICU附近' },
];
export const diagnosticLogs = diagnosticsLog;
export const uwbStations = uwbAnchors;
export const pathResults = mockPaths;
export const hospitalMap = { nodes: mapNodes, edges: mapEdges, walls: wallSegments, doors: doorSegments, windows: windowSegments, areaTypes: AREA_TYPES };

// 区域代价配置（添加 baseCost/currentCost/policy/area）
export const areaCostConfig = Object.values(AREA_TYPES).map(a => ({
  ...a,
  area: a.name,
  baseCost: a.cost,
  currentCost: a.cost,
  policy: '正常通行',
  enabled: true,
}));

// 可行性仿真结果（匹配页面期望的字段）
export const feasibilityResults = [
  { id: 'FR01', path: '主大厅→手术室1', status: 'pass', detail: '路径通畅，无障碍冲突', conflicts: 0 },
  { id: 'FR02', path: '手术区→住院部', status: 'conflict', detail: '在大厅东角与R001存在时空冲突', conflicts: 2 },
  { id: 'FR03', path: 'ICU→药房', status: 'pass', detail: '绕行走廊，路径安全', conflicts: 0 },
  { id: 'FR04', path: '药房→手术室', status: 'warning', detail: '狭窄走廊段需减速通行', conflicts: 1 },
];

// 碰撞预警（添加 risk/type/robots 数组）
export const collisionAlerts = [
  { id: 'CA01', robot: 'R001', other: 'R002', robots: ['R001', 'R002'], location: '主大厅', time: '22:30:05', distance: 1.8, action: '减速避让', risk: 'high', type: '正面碰撞' },
  { id: 'CA02', robot: 'R003', other: '未知障碍', robots: ['R003'], location: '住院部走廊', time: '22:28:40', distance: 2.3, action: '局部重规划', risk: 'medium', type: '静态障碍' },
  { id: 'CA03', robot: 'R004', other: 'R006', robots: ['R004', 'R006'], location: 'ICU走廊', time: '22:25:10', distance: 1.5, action: '等待通行', risk: 'high', type: '交叉碰撞' },
  { id: 'CA04', robot: 'R001', other: 'R003', robots: ['R001', 'R003'], location: '大厅北门', time: '22:20:00', distance: 3.0, action: '速度调整', risk: 'low', type: '追尾风险' },
];

// 冲突预测（添加 type/eta/resolution）
export const conflictPredictions = [
  { id: 'CP01', robots: ['R001', 'R002'], location: '大厅北门', predictedTime: '22:35:00', probability: 0.85, suggestion: 'R002减速等待', type: '路径交叉', eta: 15, resolution: 'R002减速等待R001通过' },
  { id: 'CP02', robots: ['R004', 'R006'], location: '药房入口', predictedTime: '22:38:00', probability: 0.62, suggestion: 'R006改走备用路径', type: '死锁风险', eta: 30, resolution: 'R006改走备用路径，释放通道' },
  { id: 'CP03', robots: ['R002', 'R003'], location: '住院部走廊', predictedTime: '22:40:00', probability: 0.45, suggestion: 'R003在走廊入口等待', type: '通道争用', eta: 45, resolution: '设置交通信号，分时通行' },
];

// 交通信号（添加 location/status）
export const trafficSignals = [
  { id: 'TS01', x: 300, y: 250, state: 'green', status: 'green', direction: '南北', duration: 30, location: '大厅北通道' },
  { id: 'TS02', x: 500, y: 250, state: 'red', status: 'red', direction: '东西', duration: 15, location: '大厅东通道' },
  { id: 'TS03', x: 400, y: 400, state: 'green', status: 'green', direction: '南北', duration: 25, location: '大厅南通道' },
  { id: 'TS04', x: 600, y: 180, state: 'yellow', status: 'yellow', direction: '东西', duration: 10, location: 'ICU入口' },
];
