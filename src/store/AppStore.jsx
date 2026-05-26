import { createContext, useContext, useState, useCallback } from "react";
import {
  defaultMapData,
  defaultRules,
  defaultParams,
  initialRobots,
} from "../data/mapData";
import {
  planRoutes,
  validateMap,
  updateMap as plannerUpdateMap,
  resizeMap as plannerResizeMap,
  randomMap as plannerRandomMap,
  runSandbox as plannerRunSandbox,
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

  // === 机器人 ===
  const [robots, setRobots] = useState(initialRobots.map((r) => ({ ...r })));

  // === 活跃任务 ===
  const [activeTasks, setActiveTasks] = useState([]);

  // === 活跃路径（机器人→路径映射） ===
  const [activeRoutes, setActiveRoutes] = useState({});

  // === 沙盒结果 ===
  const [sandbox, setSandbox] = useState(null);

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
      const result = planRoutes(t, p, map, rules);
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

  // === 沙盒演练 ===
  const doRunSandbox = useCallback(
    (rounds) => {
      const result = plannerRunSandbox(rounds || 12, map, rules, params);
      setSandbox(result);
      addLog(`完成 ${result.rounds} 轮模拟沙盒演练`);
      return result;
    },
    [map, rules, params, addLog]
  );

  // === 任务派发 ===
  const doDispatchTask = useCallback(
    (taskData) => {
      const newTask = {
        id: `T${Date.now()}`,
        ...taskData,
        status: "执行中",
        progress: 0,
        createdAt: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      };
      setActiveTasks((prev) => [...prev, newTask]);

      // 更新机器人状态
      if (taskData.robotId) {
        setRobots((prev) =>
          prev.map((r) =>
            r.id === taskData.robotId
              ? { ...r, status: "running", taskId: newTask.id }
              : r
          )
        );
      }

      // 保存路径
      if (taskData.route) {
        setActiveRoutes((prev) => ({ ...prev, [newTask.id]: taskData.route }));
      }

      addLog(`任务已派发：${newTask.id} → ${taskData.robotId || "未分配"}`);
      return newTask;
    },
    [addLog]
  );

  // === 更新任务 ===
  const doUpdateTask = useCallback((taskId, updates) => {
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  // === 恢复默认 ===
  const doResetState = useCallback(() => {
    setMap({ ...defaultMapData });
    setTask({ start: "药房", end: "消毒供应室", cargo: "medicine", priority: 2 });
    setRoutes([]);
    setBestRoute(null);
    setRules([...defaultRules]);
    setParams({ ...defaultParams });
    setSandbox(null);
    localStorage.removeItem("pathplan_map");
    addLog("恢复默认地图和规则");
  }, [addLog]);

  // === 更新机器人 ===
  const doUpdateRobot = useCallback((id, updates) => {
    setRobots((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const value = {
    // 数据
    map,
    task,
    routes,
    bestRoute,
    rules,
    params,
    robots,
    activeTasks,
    activeRoutes,
    sandbox,
    logs,
    validation,

    // 操作
    setTask,
    planRoutes: doPlanRoutes,
    updateMap: doUpdateMap,
    resizeMap: doResizeMap,
    randomMap: doRandomMap,
    updateRules: doUpdateRules,
    updateParams: doUpdateParams,
    runSandbox: doRunSandbox,
    dispatchTask: doDispatchTask,
    updateTask: doUpdateTask,
    resetState: doResetState,
    updateRobot: doUpdateRobot,
    addLog,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
