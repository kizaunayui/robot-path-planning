// 医院3层楼地图数据
export const mapFloors = [
  { id: '1F', name: '一层', width: 1200, height: 800, description: '门诊/药房/急诊' },
  { id: '2F', name: '二层', width: 1200, height: 800, description: '检验科/手术室/物流交接区' },
  { id: '3F', name: '三层', width: 1200, height: 800, description: '住院部/护士站/病区' },
];

// 每层楼的节点（至少15个/层）
export const mapNodes = [
  // === 1F ===
  { id: '1F-entrance', name: '门诊大厅', type: 'outpatient', floor: '1F', x: 600, y: 100, description: '主入口' },
  { id: '1F-pharmacy', name: '药房', type: 'pharmacy', floor: '1F', x: 200, y: 200, description: '药品发放处' },
  { id: '1F-emergency', name: '急诊', type: 'emergency', floor: '1F', x: 1000, y: 200, description: '急诊通道' },
  { id: '1F-cashier', name: '收费处', type: 'transfer_point', floor: '1F', x: 600, y: 200, description: '缴费窗口' },
  { id: '1F-corridor1', name: '走廊交叉口A', type: 'corridor_intersection', floor: '1F', x: 400, y: 350 },
  { id: '1F-corridor2', name: '走廊交叉口B', type: 'corridor_intersection', floor: '1F', x: 600, y: 350 },
  { id: '1F-corridor3', name: '走廊交叉口C', type: 'corridor_intersection', floor: '1F', x: 800, y: 350 },
  { id: '1F-elevator', name: '电梯厅', type: 'elevator', floor: '1F', x: 600, y: 500, description: '主电梯' },
  { id: '1F-charging', name: '充电站', type: 'charging_station', floor: '1F', x: 200, y: 500, description: '机器人充电区' },
  { id: '1F-storage', name: '物资库', type: 'storage', floor: '1F', x: 1000, y: 500, description: '医疗物资存储' },
  { id: '1F-transfer', name: '物流交接点', type: 'transfer_point', floor: '1F', x: 400, y: 600 },
  { id: '1F-corridor4', name: '走廊交叉口D', type: 'corridor_intersection', floor: '1F', x: 800, y: 600 },
  { id: '1F-ward101', name: '病房101', type: 'ward', floor: '1F', x: 200, y: 700 },
  { id: '1F-ward102', name: '病房102', type: 'ward', floor: '1F', x: 400, y: 700 },
  { id: '1F-nurse', name: '护士站', type: 'nurse_station', floor: '1F', x: 600, y: 700 },
  // === 2F ===
  { id: '2F-lab', name: '检验科', type: 'lab', floor: '2F', x: 200, y: 200, description: '血液/尿液检验' },
  { id: '2F-or1', name: '手术室1', type: 'operating_room', floor: '2F', x: 800, y: 200, description: '外科手术' },
  { id: '2F-or2', name: '手术室2', type: 'operating_room', floor: '2F', x: 1000, y: 200, description: '内科手术' },
  { id: '2F-transfer', name: '物流交接区', type: 'transfer_point', floor: '2F', x: 600, y: 200, description: '标本/药品交接' },
  { id: '2F-corridor1', name: '走廊交叉口E', type: 'corridor_intersection', floor: '2F', x: 400, y: 350 },
  { id: '2F-corridor2', name: '走廊交叉口F', type: 'corridor_intersection', floor: '2F', x: 600, y: 350 },
  { id: '2F-corridor3', name: '走廊交叉口G', type: 'corridor_intersection', floor: '2F', x: 800, y: 350 },
  { id: '2F-elevator', name: '电梯厅', type: 'elevator', floor: '2F', x: 600, y: 500 },
  { id: '2F-charging', name: '充电站', type: 'charging_station', floor: '2F', x: 200, y: 500 },
  { id: '2F-storage', name: '药品库', type: 'storage', floor: '2F', x: 1000, y: 500 },
  { id: '2F-corridor4', name: '走廊交叉口H', type: 'corridor_intersection', floor: '2F', x: 400, y: 600 },
  { id: '2F-ward201', name: '病房201', type: 'ward', floor: '2F', x: 200, y: 700 },
  { id: '2F-nurse', name: '护士站', type: 'nurse_station', floor: '2F', x: 600, y: 700 },
  // === 3F ===
  { id: '3F-ward301', name: '病房301', type: 'ward', floor: '3F', x: 200, y: 200 },
  { id: '3F-ward302', name: '病房302', type: 'ward', floor: '3F', x: 400, y: 200 },
  { id: '3F-ward303', name: '病房303', type: 'ward', floor: '3F', x: 600, y: 200 },
  { id: '3F-ward304', name: '病房304', type: 'ward', floor: '3F', x: 800, y: 200 },
  { id: '3F-ward305', name: '病房305', type: 'ward', floor: '3F', x: 1000, y: 200 },
  { id: '3F-corridor1', name: '走廊交叉口I', type: 'corridor_intersection', floor: '3F', x: 400, y: 350 },
  { id: '3F-corridor2', name: '走廊交叉口J', type: 'corridor_intersection', floor: '3F', x: 600, y: 350 },
  { id: '3F-corridor3', name: '走廊交叉口K', type: 'corridor_intersection', floor: '3F', x: 800, y: 350 },
  { id: '3F-elevator', name: '电梯厅', type: 'elevator', floor: '3F', x: 600, y: 500 },
  { id: '3F-charging', name: '充电站', type: 'charging_station', floor: '3F', x: 200, y: 500 },
  { id: '3F-nurse1', name: '护士站A', type: 'nurse_station', floor: '3F', x: 400, y: 500 },
  { id: '3F-nurse2', name: '护士站B', type: 'nurse_station', floor: '3F', x: 800, y: 500 },
  { id: '3F-ward306', name: '病房306', type: 'ward', floor: '3F', x: 200, y: 700 },
  { id: '3F-ward307', name: '病房307', type: 'ward', floor: '3F', x: 400, y: 700 },
  { id: '3F-ward308', name: '病房308', type: 'ward', floor: '3F', x: 600, y: 700 },
];

// 边（连接节点的可通行路径）
export const mapEdges = [
  // 1F 连接
  { id: 'e1', from: '1F-entrance', to: '1F-cashier', floor: '1F', distance: 100, cost: 1 },
  { id: 'e2', from: '1F-cashier', to: '1F-pharmacy', floor: '1F', distance: 200, cost: 1 },
  { id: 'e3', from: '1F-cashier', to: '1F-emergency', floor: '1F', distance: 200, cost: 1 },
  { id: 'e4', from: '1F-cashier', to: '1F-corridor2', floor: '1F', distance: 150, cost: 1 },
  { id: 'e5', from: '1F-pharmacy', to: '1F-corridor1', floor: '1F', distance: 150, cost: 1 },
  { id: 'e6', from: '1F-corridor1', to: '1F-corridor2', floor: '1F', distance: 200, cost: 1 },
  { id: 'e7', from: '1F-corridor2', to: '1F-corridor3', floor: '1F', distance: 200, cost: 1 },
  { id: 'e8', from: '1F-emergency', to: '1F-corridor3', floor: '1F', distance: 200, cost: 1 },
  { id: 'e9', from: '1F-corridor2', to: '1F-elevator', floor: '1F', distance: 150, cost: 1 },
  { id: 'e10', from: '1F-corridor1', to: '1F-charging', floor: '1F', distance: 200, cost: 1 },
  { id: 'e11', from: '1F-corridor3', to: '1F-storage', floor: '1F', distance: 200, cost: 1 },
  { id: 'e12', from: '1F-charging', to: '1F-transfer', floor: '1F', distance: 200, cost: 1 },
  { id: 'e13', from: '1F-elevator', to: '1F-corridor4', floor: '1F', distance: 200, cost: 1 },
  { id: 'e14', from: '1F-storage', to: '1F-corridor4', floor: '1F', distance: 200, cost: 1 },
  { id: 'e15', from: '1F-transfer', to: '1F-ward101', floor: '1F', distance: 100, cost: 1 },
  { id: 'e16', from: '1F-transfer', to: '1F-ward102', floor: '1F', distance: 100, cost: 1 },
  { id: 'e17', from: '1F-corridor4', to: '1F-nurse', floor: '1F', distance: 200, cost: 1 },
  // 2F 连接
  { id: 'e20', from: '2F-lab', to: '2F-corridor1', floor: '2F', distance: 200, cost: 1 },
  { id: 'e21', from: '2F-corridor1', to: '2F-corridor2', floor: '2F', distance: 200, cost: 1 },
  { id: 'e22', from: '2F-corridor2', to: '2F-corridor3', floor: '2F', distance: 200, cost: 1 },
  { id: 'e23', from: '2F-transfer', to: '2F-corridor2', floor: '2F', distance: 150, cost: 1 },
  { id: 'e24', from: '2F-corridor3', to: '2F-or1', floor: '2F', distance: 200, cost: 2 },
  { id: 'e25', from: '2F-or1', to: '2F-or2', floor: '2F', distance: 200, cost: 2 },
  { id: 'e26', from: '2F-corridor2', to: '2F-elevator', floor: '2F', distance: 150, cost: 1 },
  { id: 'e27', from: '2F-corridor1', to: '2F-charging', floor: '2F', distance: 200, cost: 1 },
  { id: 'e28', from: '2F-corridor3', to: '2F-storage', floor: '2F', distance: 200, cost: 1 },
  { id: 'e29', from: '2F-elevator', to: '2F-corridor4', floor: '2F', distance: 150, cost: 1 },
  { id: 'e30', from: '2F-corridor4', to: '2F-ward201', floor: '2F', distance: 200, cost: 1 },
  { id: 'e31', from: '2F-corridor4', to: '2F-nurse', floor: '2F', distance: 200, cost: 1 },
  // 3F 连接
  { id: 'e40', from: '3F-ward301', to: '3F-corridor1', floor: '3F', distance: 200, cost: 1 },
  { id: 'e41', from: '3F-ward302', to: '3F-corridor1', floor: '3F', distance: 200, cost: 1 },
  { id: 'e42', from: '3F-ward303', to: '3F-corridor2', floor: '3F', distance: 200, cost: 1 },
  { id: 'e43', from: '3F-ward304', to: '3F-corridor3', floor: '3F', distance: 200, cost: 1 },
  { id: 'e44', from: '3F-ward305', to: '3F-corridor3', floor: '3F', distance: 200, cost: 1 },
  { id: 'e45', from: '3F-corridor1', to: '3F-corridor2', floor: '3F', distance: 200, cost: 1 },
  { id: 'e46', from: '3F-corridor2', to: '3F-corridor3', floor: '3F', distance: 200, cost: 1 },
  { id: 'e47', from: '3F-corridor2', to: '3F-elevator', floor: '3F', distance: 150, cost: 1 },
  { id: 'e48', from: '3F-corridor1', to: '3F-charging', floor: '3F', distance: 200, cost: 1 },
  { id: 'e49', from: '3F-elevator', to: '3F-nurse1', floor: '3F', distance: 200, cost: 1 },
  { id: 'e50', from: '3F-elevator', to: '3F-nurse2', floor: '3F', distance: 200, cost: 1 },
  { id: 'e51', from: '3F-nurse1', to: '3F-ward306', floor: '3F', distance: 200, cost: 1 },
  { id: 'e52', from: '3F-nurse1', to: '3F-ward307', floor: '3F', distance: 200, cost: 1 },
  { id: 'e53', from: '3F-nurse2', to: '3F-ward308', floor: '3F', distance: 200, cost: 1 },
  // 跨楼层（电梯）
  { id: 'e-lift1', from: '1F-elevator', to: '2F-elevator', floor: '1F', distance: 50, cost: 5, isElevator: true },
  { id: 'e-lift2', from: '2F-elevator', to: '3F-elevator', floor: '2F', distance: 50, cost: 5, isElevator: true },
];

// 区域块
export const mapAreas = [
  { id: 'a1', name: '门诊区', type: 'outpatient', floor: '1F', x: 100, y: 50, w: 400, h: 200, color: '#e3f2fd', speedLimit: 0.8 },
  { id: 'a2', name: '急诊区', type: 'emergency', floor: '1F', x: 800, y: 50, w: 350, h: 200, color: '#fce4ec', speedLimit: 1.2 },
  { id: 'a3', name: '药房区', type: 'pharmacy', floor: '1F', x: 100, y: 150, w: 250, h: 150, color: '#e8f5e9', speedLimit: 0.5 },
  { id: 'a4', name: '充电区', type: 'charging', floor: '1F', x: 100, y: 450, w: 200, h: 100, color: '#fff9c4', speedLimit: 0.3 },
  { id: 'a5', name: '检验科', type: 'lab', floor: '2F', x: 100, y: 100, w: 300, h: 200, color: '#e3f2fd', speedLimit: 0.5 },
  { id: 'a6', name: '手术区', type: 'operating', floor: '2F', x: 700, y: 100, w: 450, h: 200, color: '#ffebee', accessLevel: 'restricted', speedLimit: 0.3 },
  { id: 'a7', name: '住院病区', type: 'ward', floor: '3F', x: 100, y: 100, w: 1000, h: 300, color: '#f3e5f5', speedLimit: 0.5 },
];

// 机器人初始数据
export const initialRobots = [
  { id: 'R1', name: '运输机器人1号', floor: '1F', x: 400, y: 350, status: 'idle', battery: 85, speed: 1.2, taskId: null },
  { id: 'R2', name: '运输机器人2号', floor: '1F', x: 600, y: 500, status: 'idle', battery: 92, speed: 1.0, taskId: null },
  { id: 'R3', name: '运输机器人3号', floor: '2F', x: 600, y: 350, status: 'idle', battery: 45, speed: 1.1, taskId: null },
  { id: 'R4', name: '运输机器人4号', floor: '2F', x: 400, y: 500, status: 'charging', battery: 15, speed: 0.8, taskId: null },
  { id: 'R5', name: '运输机器人5号', floor: '3F', x: 600, y: 350, status: 'idle', battery: 78, speed: 1.3, taskId: null },
  { id: 'R6', name: '运输机器人6号', floor: '3F', x: 800, y: 500, status: 'idle', battery: 60, speed: 1.0, taskId: null },
];

// 节点类型中文名
export const nodeTypeNames = {
  pharmacy: '药房', nurse_station: '护士站', ward: '病房', lab: '检验科',
  operating_room: '手术室', elevator: '电梯厅', charging_station: '充电站',
  storage: '物资库', outpatient: '门诊', emergency: '急诊',
  transfer_point: '物流交接点', corridor_intersection: '走廊交叉口',
};

// 节点类型图标颜色
export const nodeTypeColors = {
  pharmacy: '#4caf50', nurse_station: '#ff9800', ward: '#9c27b0', lab: '#2196f3',
  operating_room: '#f44336', elevator: '#607d8b', charging_station: '#ffeb3b',
  storage: '#795548', outpatient: '#03a9f4', emergency: '#e91e63',
  transfer_point: '#00bcd4', corridor_intersection: '#9e9e9e',
};
