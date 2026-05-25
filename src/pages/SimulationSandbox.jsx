import { useState, useRef, useCallback, useEffect } from 'react'
import { Panel, Button, Badge } from '../components/StatusCard'

const SPEEDS = [0.5, 1, 2, 5]

const INITIAL_ROBOTS = [
  { id: 'R001', x: 100, y: 100, tx: 600, ty: 400, speed: 2, color: '#4caf50', name: '药配送A' },
  { id: 'R002', x: 600, y: 100, tx: 150, ty: 450, speed: 1.5, color: '#2196f3', name: '样本B' },
  { id: 'R003', x: 350, y: 50, tx: 350, ty: 500, speed: 1.8, color: '#ff9800', name: '器械C' },
]

const INITIAL_TASKS = [
  { id: 'ST001', name: '药房→ICU', robot: 'R001', status: '进行中', progress: 0 },
  { id: 'ST002', name: '住院部→检验科', robot: 'R002', status: '进行中', progress: 0 },
  { id: 'ST003', name: '手术室→消毒中心', robot: 'R003', status: '等待中', progress: 0 },
]

export default function SimulationSandbox() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [simState, setSimState] = useState('stopped') // running, paused, stopped
  const [speed, setSpeed] = useState(1)
  const [obstacleCount, setObstacleCount] = useState(3)
  const [robots, setRobots] = useState(INITIAL_ROBOTS)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [logs, setLogs] = useState([
    { time: '00:00', msg: '仿真系统初始化完成' },
  ])
  const [stats, setStats] = useState({ collisions: 0, avgSpeed: 0, completed: 0 })
  const obstaclesRef = useRef([])
  const frameRef = useRef(0)

  // Generate obstacles
  useEffect(() => {
    const obs = []
    for (let i = 0; i < obstacleCount; i++) {
      obs.push({ x: 80 + Math.random() * 580, y: 80 + Math.random() * 380, r: 12 + Math.random() * 15 })
    }
    obstaclesRef.current = obs
  }, [obstacleCount])

  const addLog = (msg) => {
    const t = `${String(Math.floor(frameRef.current / 60)).padStart(2, '0')}:${String(frameRef.current % 60).padStart(2, '0')}`
    setLogs(prev => [...prev.slice(-49), { time: t, msg }])
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    })

    // Robots
    robots.forEach(r => {
      ctx.fillStyle = r.color
      ctx.beginPath(); ctx.arc(r.x, r.y, 14, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(r.id, r.x, r.y + 3)

      // Target
      ctx.strokeStyle = r.color + '66'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.tx, r.ty); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = r.color + '88'
      ctx.beginPath(); ctx.arc(r.tx, r.ty, 6, 0, Math.PI * 2); ctx.fill()
    })
  }, [robots])

  useEffect(() => { draw() }, [draw])

  const step = useCallback(() => {
    frameRef.current++
    setRobots(prev => prev.map(r => {
      const dx = r.tx - r.x, dy = r.ty - r.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 5) return { ...r, x: r.tx, y: r.ty }
      const step = r.speed * speed
      return { ...r, x: r.x + (dx / dist) * step, y: r.y + (dy / dist) * step }
    }))

    // Update tasks
    setTasks(prev => prev.map(t => {
      const robot = robots.find(r => r.id === t.robot)
      if (!robot) return t
      const dx = robot.tx - robot.x, dy = robot.ty - robot.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const totalDist = Math.sqrt((robot.tx - INITIAL_ROBOTS.find(ir => ir.id === robot.id)?.x || 0) ** 2 + (robot.ty - INITIAL_ROBOTS.find(ir => ir.id === robot.id)?.y || 0) ** 2)
      const progress = totalDist > 0 ? Math.min(100, Math.round((1 - dist / totalDist) * 100)) : 100
      const status = progress >= 100 ? '已完成' : '进行中'
      return { ...t, progress, status }
    }))

    // Update stats
    setStats(prev => ({
      collisions: prev.collisions + (Math.random() < 0.002 ? 1 : 0),
      avgSpeed: (speed * 1.2 + Math.random() * 0.3).toFixed(1),
      completed: tasks.filter(t => t.status === '已完成').length,
    }))
  }, [speed, robots, tasks])

  useEffect(() => {
    if (simState !== 'running') { cancelAnimationFrame(animRef.current); return }
    let last = 0
    const loop = (ts) => {
      if (ts - last > 1000 / (30 * speed)) { step(); draw(); last = ts }
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [simState, speed, step, draw])

  const handleStart = () => { setSimState('running'); addLog('仿真启动') }
  const handlePause = () => { setSimState('paused'); addLog('仿真暂停') }
  const handleStop = () => {
    setSimState('stopped'); frameRef.current = 0
    setRobots(INITIAL_ROBOTS); setTasks(INITIAL_TASKS)
    setStats({ collisions: 0, avgSpeed: 0, completed: 0 })
    addLog('仿真停止，状态重置')
  }

  const totalProgress = tasks.length > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🎮 模拟沙盒演练</h2>
      <p className="text-slate-400 text-sm">在虚拟环境中仿真机器人运动、障碍物规避和任务执行，观察统计数据。</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Control panel */}
        <Panel title="控制面板">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant="success" size="sm" onClick={handleStart} disabled={simState === 'running'}>▶ 启动</Button>
              <Button variant="warning" size="sm" onClick={handlePause} disabled={simState !== 'running'}>⏸ 暂停</Button>
              <Button variant="danger" size="sm" onClick={handleStop}>⏹ 停止</Button>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">仿真速度</label>
              <div className="flex gap-1">
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium ${speed === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">动态障碍物: {obstacleCount}</label>
              <input type="range" min={0} max={10} value={obstacleCount} onChange={e => setObstacleCount(Number(e.target.value))} className="w-full accent-red-500" />
            </div>
            <div className="text-xs text-slate-500">
              状态: <Badge color={simState === 'running' ? 'green' : simState === 'paused' ? 'yellow' : 'gray'}>
                {simState === 'running' ? '运行中' : simState === 'paused' ? '已暂停' : '已停止'}
              </Badge>
            </div>
          </div>
        </Panel>

        {/* Canvas */}
        <div className="lg:col-span-2">
          <canvas ref={canvasRef} width={740} height={540} className="rounded-lg border border-slate-600 w-full" />
        </div>

        {/* Stats & Logs */}
        <div className="space-y-4">
          <Panel title="仿真统计">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>碰撞率</span><span className="text-red-400">{stats.collisions} 次</span>
                </div>
                <div className="w-full bg-slate-700 rounded h-2">
                  <div className="bg-red-500 h-2 rounded" style={{ width: `${Math.min(stats.collisions * 10, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>平均速度</span><span className="text-blue-400">{stats.avgSpeed} m/s</span>
                </div>
                <div className="w-full bg-slate-700 rounded h-2">
                  <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.min(stats.avgSpeed * 20, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>任务完成</span><span className="text-green-400">{totalProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded h-2">
                  <div className="bg-green-500 h-2 rounded transition-all" style={{ width: `${totalProgress}%` }} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={`任务队列 (${tasks.length})`}>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{t.name}</span>
                  <Badge color={t.status === '已完成' ? 'green' : 'blue'}>{t.status}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Logs */}
      <Panel title={`仿真日志 (${logs.length})`}>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {logs.map((l, i) => (
            <div key={i} className="text-xs flex gap-2">
              <span className="text-slate-500 font-mono w-12 shrink-0">[{l.time}]</span>
              <span className="text-slate-300">{l.msg}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
