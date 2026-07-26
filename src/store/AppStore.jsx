import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  defaultMapData,
  multiFloorMap,
  defaultRules,
  defaultParams,
  cargoTypes,
  priorityLevels,
  allPoints,
} from "../data/mapData";
import {
  planRoutes,
  validateMap,
  validateAllFloors,
  updateFloorMap as plannerUpdateFloorMap,
} from "../utils/planner";

const AppStoreContext = createContext(null);

// 地图存档带版本号：数据结构变更时递增版本，旧存档自动作废，避免读到不兼容数据
const FLOORMAP_STORAGE_KEY = "pathplan_floormap_v2";
const FLOORMAP_VERSION = 2;
const LEGACY_STORAGE_KEYS = ["pathplan_floormap", "pathplan_map"];

function isValidFloorMap(data) {
  if (!data || typeof data !== "object") return false;
  return Object.keys(multiFloorMap).every((floorId) => {
    const m = data[floorId];
    return (
      m &&
      Number.isInteger(m.cols) &&
      Number.isInteger(m.rows) &&
      Array.isArray(m.walls) &&
      Array.isArray(m.dynamic) &&
      m.points &&
      typeof m.points === "object"
    );
  });
}

function loadSavedFloorMap() {
  try {
    const saved = JSON.parse(localStorage.getItem(FLOORMAP_STORAGE_KEY) ?? "null");
    if (saved && saved.version === FLOORMAP_VERSION && isValidFloorMap(saved.data)) {
      return saved.data;
    }
  } catch {
    /* 存档损坏则回退默认地图 */
  }
  return null;
}

function addLogEntry(logs, message) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return [{ time, message }, ...logs].slice(0, 80);
}

export function AppStoreProvider({ children }) {
  // === 多楼层地图 ===
  const [floorMap, setFloorMap] = useState(
    () => loadSavedFloorMap() || JSON.parse(JSON.stringify(multiFloorMap))
  );

  // === 当前楼层 ===
  const [currentFloor, setCurrentFloor] = useState('1F');

  // === 向后兼容的单层 map ===
  const map = floorMap[currentFloor] || defaultMapData;

  // === 任务（使用 allPoints 格式）===
  const [task, setTask] = useState({
    start: "1F-药房",
    end: "2F-消毒供应室",
    cargo: "medicine",
    priority: 2,
  });

  // === 路径结果 ===
  const [routes, setRoutes] = useState([]);
  const [bestRoute, setBestRoute] = useState(null);

  // === 规则 ===
  const [rules, setRules] = useState([...defaultRules]);

  // === 参数 ===
  const [params, setParams] = useState({ ...defaultParams });

  // === 重规划相关 ===
  const [replanCount, setReplanCount] = useState(0);
  const [replanHistory, setReplanHistory] = useState([]);
  const [previousRoute, setPreviousRoute] = useState(null);

  // === 日志 ===
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) => {
    setLogs((prev) => addLogEntry(prev, msg));
  }, []);

  // === 地图验证（BFS 连通性检查，仅在地图变化时重算）===
  const allValidations = useMemo(() => validateAllFloors(floorMap), [floorMap]);
  const validation = useMemo(() => validateMap(map), [map]);

  // === 保存楼层地图 ===
  const saveFloorMap = useCallback((newFloorMap) => {
    setFloorMap(newFloorMap);
    localStorage.setItem(
      FLOORMAP_STORAGE_KEY,
      JSON.stringify({ version: FLOORMAP_VERSION, data: newFloorMap })
    );
  }, []);

  // === 路径规划（多楼层）===
  const doPlanRoutes = useCallback(
    (taskOverride, paramsOverride, rulesOverride) => {
      const t = taskOverride || task;
      const p = paramsOverride || params;
      const activeRules = rulesOverride || rules;
      const result = planRoutes(t, p, floorMap, activeRules, cargoTypes, priorityLevels);
      setRoutes(result.routes);
      setBestRoute(result.bestRoute);
      if (result.bestRoute && result.bestRoute.path?.length > 0 && result.bestRoute.path[0]?.floor) {
        setCurrentFloor(result.bestRoute.path[0].floor);
      }
      addLog(`完成路径计算：${t.start} → ${t.end}`);
      return result;
    },
    [task, params, floorMap, rules, addLog]
  );

  // === 地图编辑（当前楼层）===
  const doUpdateMap = useCallback(
    (operation, cell) => {
      const newFloorMap = plannerUpdateFloorMap(operation, cell, floorMap, currentFloor);
      saveFloorMap(newFloorMap);
      addLog(`地图操作：${currentFloor} ${operation}`);
      return newFloorMap[currentFloor];
    },
    [floorMap, currentFloor, saveFloorMap, addLog]
  );

  // === 切换楼层 ===
  const doSetCurrentFloor = useCallback((floorId) => {
    setCurrentFloor(floorId);
    addLog(`切换到${floorId}楼层`);
  }, [addLog]);

  // === 更新规则 ===
  const doUpdateRules = useCallback(
    (incoming) => {
      const updated = rules.map((rule) => {
        const match = incoming.find((item) => item.id === rule.id);
        return match ? { ...rule, ...match } : rule;
      });
      setRules(updated);
      addLog("交通规则已更新");
      return updated;
    },
    [rules, addLog]
  );

  // === 更新参数 ===
  const doUpdateParams = useCallback(
    (newParams) => {
      setParams((p) => ({ ...p, ...newParams }));
      addLog("路径参数已更新");
    },
    [addLog]
  );

  // === 重规划（多楼层）===
  const doReplan = useCallback(
    (obstacleCells) => {
      if (bestRoute) {
        setPreviousRoute({ ...bestRoute });
      }

      // 在当前楼层添加动态障碍
      const newFloorMap = JSON.parse(JSON.stringify(floorMap));
      obstacleCells.forEach((cell) => {
        const key = `${cell[0]},${cell[1]}`;
        if (!newFloorMap[currentFloor].dynamic.some((p) => `${p[0]},${p[1]}` === key)) {
          newFloorMap[currentFloor].dynamic.push(cell);
        }
      });
      saveFloorMap(newFloorMap);

      const result = planRoutes(task, params, newFloorMap, rules, cargoTypes, priorityLevels);
      setRoutes(result.routes);
      setBestRoute(result.bestRoute);

      const newCount = replanCount + 1;
      setReplanCount(newCount);

      const historyEntry = {
        id: `RP${Date.now()}`,
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        obstacleCount: obstacleCells.length,
        oldLength: bestRoute ? bestRoute.length : 0,
        newLength: result.bestRoute ? result.bestRoute.length : 0,
        lengthDiff: result.bestRoute && bestRoute ? result.bestRoute.length - bestRoute.length : 0,
        oldTime: bestRoute ? bestRoute.estimatedMinutes : 0,
        newTime: result.bestRoute ? result.bestRoute.estimatedMinutes : 0,
        oldEnergy: bestRoute ? bestRoute.energy : 0,
        newEnergy: result.bestRoute ? result.bestRoute.energy : 0,
        oldElevatorCount: bestRoute ? (bestRoute.elevatorCount || 0) : 0,
        newElevatorCount: result.bestRoute ? (result.bestRoute.elevatorCount || 0) : 0,
      };
      setReplanHistory((prev) => [historyEntry, ...prev].slice(0, 20));

      addLog(`重规划完成（第${newCount}次），${currentFloor}新增${obstacleCells.length}个动态障碍`);
      return result;
    },
    [floorMap, task, params, rules, bestRoute, replanCount, addLog, currentFloor, saveFloorMap]
  );

  // === 恢复默认 ===
  const doResetState = useCallback(() => {
    const freshMap = JSON.parse(JSON.stringify(multiFloorMap));
    setFloorMap(freshMap);
    setTask({ start: "1F-药房", end: "2F-消毒供应室", cargo: "medicine", priority: 2 });
    setRoutes([]);
    setBestRoute(null);
    setRules([...defaultRules]);
    setParams({ ...defaultParams });
    setReplanCount(0);
    setReplanHistory([]);
    setPreviousRoute(null);
    setCurrentFloor('1F');
    localStorage.removeItem(FLOORMAP_STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    addLog("恢复默认地图和规则");
  }, [addLog]);

  const value = {
    // 数据
    map,              // 当前楼层的 mapData（向后兼容）
    floorMap,         // 多楼层地图
    currentFloor,     // 当前楼层 ID
    task,
    routes,
    bestRoute,
    rules,
    params,
    logs,
    validation,
    allValidations,
    replanCount,
    replanHistory,
    previousRoute,
    cargoTypes,
    priorityLevels,
    allPoints,

    // 操作
    setTask,
    setCurrentFloor: doSetCurrentFloor,
    planRoutes: doPlanRoutes,
    updateMap: doUpdateMap,
    updateRules: doUpdateRules,
    updateParams: doUpdateParams,
    replan: doReplan,
    resetState: doResetState,
    addLog,
    saveFloorMap,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
