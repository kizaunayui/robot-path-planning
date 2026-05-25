import { useState, useRef, useCallback, useEffect } from 'react'
import { Panel, Button } from '../components/StatusCard'

const TOOLS = ['wall', 'door', 'window', 'route']

export default function MapEditor() {
  const canvasRef = useRef(null)
  const [tool, setTool] = useState('wall')
  const [walls, setWalls] = useState([])
  const [doors, setDoors] = useState([])
  const [windows, setWindows] = useState([])
  const [routePoints, setRoutePoints] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [previewEnd, setPreviewEnd] = useState(null)
  const [history, setHistory] = useState([])
  const [navMeshGenerated, setNavMeshGenerated] = useState(false)
  const [navMeshTriangles, setNavMeshTriangles] = useState([])
  const [validationResult, setValidationResult] = useState(null)

  const saveToHistory = useCallback(() => {
    setHistory(h => [...h, { walls: [...walls], doors: [...doors], windows: [...windows], routePoints: [...routePoints] }])
  }, [walls, doors, windows, routePoints])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background grid
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Nav mesh
    if (navMeshGenerated) {
      ctx.save()
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)'
      ctx.lineWidth = 1
      ctx.fillStyle = 'rgba(76, 175, 80, 0.08)'
      navMeshTriangles.forEach(t => {
        ctx.beginPath()
        ctx.moveTo(t[0][0], t[0][1])
        ctx.lineTo(t[1][0], t[1][1])
        ctx.lineTo(t[2][0], t[2][1])
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      })
      ctx.restore()
    }

    // Walls
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 3
    walls.forEach(([p1, p2]) => { ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke() })

    // Doors
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 4
    ctx.setLineDash([6, 4])
    doors.forEach(([p1, p2]) => { ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke() })
    ctx.setLineDash([])

    // Windows
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.setLineDash([3, 3])
    windows.forEach(([p1, p2]) => { ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke() })
    ctx.setLineDash([])

    // Route points
    if (routePoints.length > 0) {
      ctx.save()
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.moveTo(routePoints[0][0], routePoints[0][1])
      for (let i = 1; i < routePoints.length; i++) ctx.lineTo(routePoints[i][0], routePoints[i][1])
      ctx.stroke()
      ctx.setLineDash([])
      routePoints.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#22c55e' : i === routePoints.length - 1 ? '#ef4444' : '#3b82f6'
        ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(i + 1, p[0], p[1] + 3)
      })
      ctx.restore()
    }

    // Preview line
    if (drawing && startPoint && previewEnd && tool !== 'route') {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(startPoint[0], startPoint[1]); ctx.lineTo(previewEnd[0], previewEnd[1]); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }
  }, [walls, doors, windows, routePoints, drawing, startPoint, previewEnd, tool, navMeshGenerated, navMeshTriangles])

  useEffect(() => { draw() }, [draw])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [Math.round(e.clientX - rect.left), Math.round(e.clientY - rect.top)]
  }

  const handleMouseDown = (e) => {
    const pos = getPos(e)
    if (tool === 'route') {
      saveToHistory()
      setRoutePoints(prev => [...prev, pos])
      return
    }
    setDrawing(true)
    setStartPoint(pos)
  }

  const handleMouseMove = (e) => {
    if (drawing) setPreviewEnd(getPos(e))
  }

  const handleMouseUp = (e) => {
    if (!drawing || !startPoint) return
    const end = getPos(e)
    const dist = Math.sqrt((end[0] - startPoint[0]) ** 2 + (end[1] - startPoint[1]) ** 2)
    if (dist > 10) {
      saveToHistory()
      const seg = [startPoint, end]
      if (tool === 'wall') setWalls(prev => [...prev, seg])
      else if (tool === 'door') setDoors(prev => [...prev, seg])
      else if (tool === 'window') setWindows(prev => [...prev, seg])
    }
    setDrawing(false)
    setStartPoint(null)
    setPreviewEnd(null)
  }

  const handleUndo = () => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setWalls(last.walls); setDoors(last.doors); setWindows(last.windows); setRoutePoints(last.routePoints)
    setHistory(h => h.slice(0, -1))
  }

  const handleClear = () => {
    saveToHistory()
    setWalls([]); setDoors([]); setWindows([]); setRoutePoints([])
    setNavMeshGenerated(false); setNavMeshTriangles([]); setValidationResult(null)
  }

  const handleSave = () => {
    const data = { walls, doors, windows, routePoints }
    localStorage.setItem('map-editor-data', JSON.stringify(data))
    setSaveMsg('💾 地图已保存到 localStorage')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handleLoad = () => {
    const raw = localStorage.getItem('map-editor-data')
    if (!raw) { setSaveMsg('⚠️ 没有保存的地图数据'); setTimeout(() => setSaveMsg(null), 3000); return }
    const data = JSON.parse(raw)
    saveToHistory()
    setWalls(data.walls || []); setDoors(data.doors || []); setWindows(data.windows || []); setRoutePoints(data.routePoints || [])
    const count = (data.walls?.length||0) + (data.doors?.length||0) + (data.windows?.length||0)
    setSaveMsg(`📂 地图已加载 (${count} 条线段, ${data.routePoints?.length||0} 个路径点)`)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handleValidate = () => {
    if (routePoints.length < 2) { setValidationResult({ valid: false, msg: '至少需要2个路径点' }); return }
    let crossings = 0
    for (let i = 0; i < routePoints.length - 1; i++) {
      const [a, b] = [routePoints[i], routePoints[i + 1]]
      walls.forEach(([c, d]) => {
        if (segmentsIntersect(a, b, c, d)) crossings++
      })
    }
    setValidationResult(crossings === 0
      ? { valid: true, msg: '路径验证通过，未穿过任何墙体' }
      : { valid: false, msg: `路径有 ${crossings} 处穿过墙体` })
  }

  const [saveMsg, setSaveMsg] = useState(null)

  const handleGenerateNavMesh = () => {
    const W = 760, H = 560, step = 60
    const tris = []
    for (let x = 0; x < W; x += step) {
      for (let y = 0; y < H; y += step) {
        tris.push([[x, y], [x + step, y], [x + step / 2, y + step / 2]])
        tris.push([[x + step, y], [x + step, y + step], [x + step / 2, y + step / 2]])
      }
    }
    setNavMeshTriangles(tris)
    setNavMeshGenerated(true)
  }

  const toolLabels = { wall: '墙体', door: '门', window: '窗户', route: '路线' }
  const toolColors = { wall: 'bg-slate-600', door: 'bg-amber-600', window: 'bg-sky-600', route: 'bg-green-600' }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🗺️ 地图实时编辑</h2>
      <p className="text-slate-400 text-sm">在画布上绘制墙体、门、窗户和路线，支持保存/加载和路径验证。</p>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {TOOLS.map(t => (
          <button key={t} onClick={() => setTool(t)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${tool === t ? `${toolColors[t]} text-white` : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {toolLabels[t]}
          </button>
        ))}
        <div className="w-px h-6 bg-slate-600 mx-1" />
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={history.length === 0}>↩ 撤销</Button>
        <Button variant="danger" size="sm" onClick={handleClear}>🗑 清除</Button>
        <div className="w-px h-6 bg-slate-600 mx-1" />
        <Button variant="primary" size="sm" onClick={handleSave}>💾 保存</Button>
        <Button variant="outline" size="sm" onClick={handleLoad}>📂 加载</Button>
        <div className="w-px h-6 bg-slate-600 mx-1" />
        <Button variant="success" size="sm" onClick={handleValidate}>✅ 路径验证</Button>
        <Button variant="primary" size="sm" onClick={handleGenerateNavMesh}>🔺 生成导航网格</Button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={760} height={560}
        className="rounded-lg border border-slate-600 cursor-crosshair"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDrawing(false); setStartPoint(null); setPreviewEnd(null) }}
      />

      {/* Status bar */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span>当前工具: <span className="text-white">{toolLabels[tool]}</span></span>
        <span>墙体: {walls.length}</span>
        <span>门: {doors.length}</span>
        <span>窗户: {windows.length}</span>
        <span>路径点: {routePoints.length}</span>
      </div>

      {/* Validation result */}
      {validationResult && (
        <div className={`px-4 py-2 rounded text-sm ${validationResult.valid ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-red-900/30 text-red-400 border border-red-700'}`}>
          {validationResult.valid ? '✅' : '❌'} {validationResult.msg}
        </div>
      )}

      {/* Save feedback */}
      {saveMsg && (
        <div className="px-4 py-2 rounded text-sm bg-blue-900/30 text-blue-400 border border-blue-700">
          {saveMsg}
        </div>
      )}

      {/* Nav mesh info */}
      {navMeshGenerated && (
        <div className="px-4 py-2 rounded text-sm bg-green-900/20 text-green-400 border border-green-800">
          🔺 导航网格已生成: {navMeshTriangles.length} 个三角形
        </div>
      )}
    </div>
  )
}

// Line segment intersection check
function segmentsIntersect(a, b, c, d) {
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const d1 = cross(c, d, a), d2 = cross(c, d, b)
  const d3 = cross(a, b, c), d4 = cross(a, b, d)
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true
  return false
}
