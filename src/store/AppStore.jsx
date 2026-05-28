import { createContext, useContext, useState, useCallback } from "react";
import {
  defaultMapData,
  defaultRules,
  defaultParams,
  cargoTypes,
  priorityLevels,
} from "../data/mapData";
import {
  planRoutes,
  validateMap,
  updateMap as plannerUpdateMap,
  resizeMap as plannerResizeMap,
  randomMap as plannerRandomMap,
} from "../utils/planner";

const AppStoreContext = createContext(null);

function addLogEntry(logs, message) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return [{ time, message }, ...logs].slice(0, 80);
}

export function AppStoreProvider({ children }) {
  // === 地图 ===
  const [map, setMap] = useState(() => {
    const saved = localStorage.getItem("pathplan_map");
    return saved ? JSON.parse(saved) : { ...defaultMapData };
  });

  // === 任务 ===
  const [task, setTask] = useState({
    start: "药房",
    end: "消毒供应室",
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

  // === 地图验证 ===
  const validation = validateMap(map);

  // === 路径规划 ===
  const doPlanRoutes = useCallback(
    (taskOverride, paramsOverride) => {
      const t = taskOverride || task;
      const p = paramsOverride || params;
      const result = planRoutes(t, p, map, rules, cargoTypes, priorityLevels);
      setRoutes(result.routes);
      setBestRoute(result.bestRoute);
      addLog(`完成路径计算：${t.start} → ${t.end}`);
      return result;
    },
    [task, params, map, rules, addLog]
  );

  // === 地图编辑 ===
  const doUpdateMap = useCallback(
    (operation, cell) => {
      const newMap = plannerUpdateMap(operation, cell, map);
      setMap(newMap);
      localStorage.setItem("pathplan_map", JSON.stringify(newMap));
      addLog(`地图操作：${operation}`);
      return newMap;
    },
    [map, addLog]
  );

  // === 调整地图尺寸 ===
  const doResizeMap = useCallback(
    (cols, rows) => {
      const newMap = plannerResizeMap(cols, rows);
      setMap(newMap);
      setTask((t) => ({ ...t, start: "药房", end: "消毒供应室" }));
      setRoutes([]);
      setBestRoute(null);
      localStorage.setItem("pathplan_map", JSON.stringify(newMap));
      addLog(`调整地图尺寸：${cols}×${rows}`);
      return newMap;
    },
    [addLog]
  );

  // === 随机地图 ===
  const doRandomMap = useCallback(
    (cols, rows, density) => {
      const newMap = plannerRandomMap(cols || map.cols, rows || map.rows, density || 16);
      setMap(newMap);
      setTask((t) => ({ ...t, start: "药房", end: "消毒供应室" }));
      setRoutes([]);
      setBestRoute(null);
      localStorage.setItem("pathplan_map", JSON.stringify(newMap));
      addLog(`生成随机地图：${newMap.cols}×${newMap.rows} 密度${density || 16}%`);
      return newMap;
    },
    [map.cols, map.rows, addLog]
  );

  // === 更新规则 ===
  const doUpdateRules = useCallback(
    (incoming) => {
      setRules((prev) => {
        const updated = prev.map((r) => {
          const match = incoming.find((inc) => inc.id === r.id);
          return match ? { ...r, ...match } : r;
        });
        return updated;
      });
      addLog("交通规则已更新");
    },
    [addLog]
  );

  // === 更新参数 ===
  const doUpdateParams = useCallback(
    (newParams) => {
      setParams((p) => ({ ...p, ...newParams }));
      addLog("路径参数已更新");
    },
    [addLog]
  );

  // === 重规划 ===
  const doReplan = useCallback(
    (obstacleCells) => {
      // 保存旧路径
      if (bestRoute) {
        setPreviousRoute({ ...bestRoute });
      }

      // 添加动态障碍
      const newMap = JSON.parse(JSON.stringify(map));
      obstacleCells.forEach((cell) => {
        const key = `${cell[0]},${cell[1]}`;
        if (!newMap.dynamic.some((p) => `${p[0]},${p[1]}` === key)) {
          newMap.dynamic.push(cell);
        }
      });
      setMap(newMap);
      localStorage.setItem("pathplan_map", JSON.stringify(newMap));

      // 重新规划
      const result = planRoutes(task, params, newMap, rules, cargoTypes, priorityLevels);
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
      };
      setReplanHistory((prev) => [historyEntry, ...prev].slice(0, 20));

      addLog(`重规划完成（第${newCount}次），新增${obstacleCells.length}个动态障碍`);
      return result;
    },
    [map, task, params, rules, bestRoute, replanCount, addLog]
  );

  // === 恢复默认 ===
  const doResetState = useCallback(() => {
    setMap({ ...defaultMapData });
    setTask({ start: "药房", end: "消毒供应室", cargo: "medicine", priority: 2 });
    setRoutes([]);
    setBestRoute(null);
    setRules([...defaultRules]);
    setParams({ ...defaultParams });
    setReplanCount(0);
    setReplanHistory([]);
    setPreviousRoute(null);
    localStorage.removeItem("pathplan_map");
    addLog("恢复默认地图和规则");
  }, [addLog]);

  const value = {
    // 数据
    map,
    task,
    routes,
    bestRoute,
    rules,
    params,
    logs,
    validation,
    replanCount,
    replanHistory,
    previousRoute,
    cargoTypes,
    priorityLevels,

    // 操作
    setTask,
    planRoutes: doPlanRoutes,
    updateMap: doUpdateMap,
    resizeMap: doResizeMap,
    randomMap: doRandomMap,
    updateRules: doUpdateRules,
    updateParams: doUpdateParams,
    replan: doReplan,
    resetState: doResetState,
    addLog,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
