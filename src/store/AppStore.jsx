import { createContext, useContext, useState, useCallback } from 'react'
import { robots as initialRobots, collisionAlerts as initialAlerts, conflictPredictions as initialConflicts, trafficSignals as initialSignals, taskQueue as initialTasks } from '../data/mockData'

const AppStoreContext = createContext(null)

export function AppStoreProvider({ children }) {
  // === Robots ===
  const [robots, setRobots] = useState(initialRobots.map(r => ({ ...r })))

  const updateRobot = useCallback((id, updates) => {
    setRobots(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  // === Tasks (active task queue) ===
  const [activeTasks, setActiveTasks] = useState([
    { id: 'AT001', from: '药房', to: 'ICU', cargo: '急救药品', path: 'A', robot: 'R001', status: '执行中', progress: 65 },
    { id: 'AT002', from: '住院部', to: '检验科', cargo: '血液样本', path: 'B', robot: 'R002', status: '执行中', progress: 30 },
  ])

  const dispatchTask = useCallback((task) => {
    setActiveTasks(prev => [...prev, task])
    // Update robot status
    if (task.robot) {
      setRobots(prev => prev.map(r => r.id === task.robot ? { ...r, status: 'running' } : r))
    }
  }, [])

  // === Dispatch logs ===
  const [dispatchLogs, setDispatchLogs] = useState([])

  const addDispatchLog = useCallback((msg) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setDispatchLogs(prev => [...prev.slice(-99), { time, msg }])
  }, [])

  // === Collision Alerts ===
  const [collisionAlerts, setCollisionAlerts] = useState(initialAlerts.map(a => ({ ...a, handled: false })))

  const handleCollisionAlert = useCallback((alertId) => {
    setCollisionAlerts(prev => prev.map(a => a.id === alertId ? { ...a, handled: true } : a))
  }, [])

  const addCollisionAlert = useCallback((alert) => {
    setCollisionAlerts(prev => [alert, ...prev])
  }, [])

  // === Conflict Predictions ===
  const [conflictPredictions, setConflictPredictions] = useState(initialConflicts.map(c => ({ ...c, resolved: false })))

  const resolveConflict = useCallback((conflictId) => {
    setConflictPredictions(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true } : c))
  }, [])

  const triggerDeadlockResolve = useCallback(() => {
    setConflictPredictions(prev => prev.map(c =>
      c.type === '死锁风险' ? { ...c, resolved: true } : c
    ))
  }, [])

  // === Traffic Signals ===
  const [trafficSignals, setTrafficSignals] = useState(initialSignals.map(s => ({ ...s })))

  const toggleSignal = useCallback((signalId) => {
    setTrafficSignals(prev => prev.map(s => {
      if (s.id !== signalId) return s
      const cycle = { green: 'yellow', yellow: 'red', red: 'green' }
      const next = cycle[s.status] || 'green'
      return { ...s, status: next, state: next }
    }))
  }, [])

  // === Simulation Logs ===
  const [simLogs, setSimLogs] = useState([])

  const addSimLog = useCallback((msg) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setSimLogs(prev => [...prev.slice(-99), { time, msg }])
  }, [])

  const value = {
    // Robots
    robots, setRobots, updateRobot,
    // Tasks
    activeTasks, setActiveTasks, dispatchTask,
    // Logs
    dispatchLogs, addDispatchLog,
    // Collision
    collisionAlerts, setCollisionAlerts, handleCollisionAlert, addCollisionAlert,
    // Conflicts
    conflictPredictions, setConflictPredictions, resolveConflict, triggerDeadlockResolve,
    // Signals
    trafficSignals, setTrafficSignals, toggleSignal,
    // Simulation
    simLogs, addSimLog,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
