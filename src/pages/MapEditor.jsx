import { useState, useRef, useEffect, useCallback } from 'react';
import { mapNodes, mapEdges, mapAreas, nodeTypeColors, nodeTypeNames } from '../data/mapData';
import { findPath } from '../utils/pathfinding';

const TOOLS = [
  { id: 'select', icon: '🖱️', label: '选择' },
  { id: 'wall', icon: '🧱', label: '墙体' },
  { id: 'door', icon: '🚪', label: '门' },
  { id: 'node', icon: '📍', label: '节点' },
  { id: 'obstacle', icon: '⚠️', label: '障碍物' },
  { id: 'delete', icon: '🗑️', label: '删除' },
];

export default function MapEditor() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [floor, setFloor] = useState('1F');
  const [elements, setElements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mapEditor_elements')) || []; } catch { return []; }
  });
  const [selectedEl, setSelectedEl] = useState(null);
  const [nodeType, setNodeType] = useState('ward');
  const [validationResult, setValidationResult] = useState(null);

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem('mapEditor_elements', JSON.stringify(elements));
    alert('已保存到本地存储');
  };

  const handleLoad = () => {
    try {
      const data = JSON.parse(localStorage.getItem('mapEditor_elements')) || [];
      setElements(data);
      alert('已加载');
    } catch { alert('加载失败'); }
  };

  const handleUndo = () => {
    setElements(prev => prev.slice(0, -1));
  };

  // Validate path reachability
  const handleValidate = () => {
    const testNodes = [...mapNodes, ...elements.filter(e => e.type === 'node').map((e, i) => ({
      id: `custom-${i}`, name: e.name || '自定义', type: 'ward', floor: e.floor, x: e.x, y: e.y,
    }))];
    const testEdges = [...mapEdges];
    // Add edges for custom nodes to nearest node
    elements.filter(e => e.type === 'node').forEach((e, i) => {
      const nearest = testNodes.filter(n => n.id !== `custom-${i}` && n.floor === e.floor)
        .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      if (nearest) {
        testEdges.push({ id: `ce-${i}`, from: `custom-${i}`, to: nearest.id, floor: e.floor, distance: Math.round(Math.hypot(nearest.x - e.x, nearest.y - e.y)), cost: 1 });
      }
    });
    // Test if all nodes on current floor are reachable from first node
    const floorNodes = testNodes.filter(n => n.floor === floor);
    if (floorNodes.length < 2) { setValidationResult({ valid: true, msg: '节点数不足，跳过验证' }); return; }
    const start = floorNodes[0].id;
    let allReachable = true;
    for (const n of floorNodes) {
      if (n.id === start) continue;
      const r = findPath(testNodes, testEdges, start, n.id);
      if (!r.reachable) { allReachable = false; setValidationResult({ valid: false, msg: `不可达: ${start} → ${n.id}` }); break; }
    }
    if (allReachable) setValidationResult({ valid: true, msg: '所有节点可达 ✅' });
  };

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 800;
    canvas.width = W; canvas.height = H;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Areas
    mapAreas.filter(a => a.floor === floor).forEach(a => {
      ctx.fillStyle = a.color; ctx.globalAlpha = 0.3;
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1;
      ctx.strokeRect(a.x, a.y, a.w, a.h);
      ctx.fillStyle = '#546e7a'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(a.name, a.x + a.w / 2, a.y + 18);
    });

    // Edges
    mapEdges.filter(e => e.floor === floor).forEach(e => {
      const fn = mapNodes.find(n => n.id === e.from);
      const tn = mapNodes.find(n => n.id === e.to);
      if (!fn || !tn) return;
      ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fn.x, fn.y); ctx.lineTo(tn.x, tn.y); ctx.stroke();
    });

    // Nodes
    mapNodes.filter(n => n.floor === floor).forEach(n => {
      ctx.fillStyle = nodeTypeColors[n.type] || '#9e9e9e';
      ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(nodeTypeNames[n.type]?.[0] || '●', n.x, n.y);
    });

    // Custom elements
    elements.filter(e => e.floor === floor).forEach((el, idx) => {
      const isSelected = selectedEl === idx;
      if (el.type === 'wall') {
        ctx.strokeStyle = '#37474f'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x2 || el.x + 100, el.y2 || el.y); ctx.stroke();
      } else if (el.type === 'door') {
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + 40, el.y); ctx.stroke();
        ctx.fillStyle = '#4caf50'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('门', el.x + 20, el.y - 6);
      } else if (el.type === 'node') {
        ctx.fillStyle = isSelected ? '#ff5722' : '#2196f3';
        ctx.beginPath(); ctx.arc(el.x, el.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(el.name?.[0] || 'N', el.x, el.y);
      } else if (el.type === 'obstacle') {
        ctx.fillStyle = 'rgba(244,67,54,0.3)';
        ctx.fillRect(el.x - 15, el.y - 15, 30, 30);
        ctx.strokeStyle = '#f44336'; ctx.lineWidth = 2;
        ctx.strokeRect(el.x - 15, el.y - 15, 30, 30);
        ctx.fillStyle = '#f44336'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('障碍', el.x, el.y + 3);
      }
      if (isSelected) {
        ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.strokeRect(el.x - 20, el.y - 20, 40, 40);
        ctx.setLineDash([]);
      }
    });
  }, [floor, elements, selectedEl]);

  // Canvas click
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1200 / rect.width;
    const scaleY = 800 / rect.height;
    const mx = Math.round((e.clientX - rect.left) * scaleX);
    const my = Math.round((e.clientY - rect.top) * scaleY);

    if (tool === 'select') {
      // Select element
      const idx = elements.findIndex(el => el.floor === floor && Math.hypot(el.x - mx, el.y - my) < 20);
      setSelectedEl(idx >= 0 ? idx : null);
    } else if (tool === 'node') {
      const name = prompt('节点名称:', '自定义节点');
      if (name) setElements(prev => [...prev, { type: 'node', name, floor, x: mx, y: my }]);
    } else if (tool === 'wall') {
      setElements(prev => [...prev, { type: 'wall', floor, x: mx, y: my, x2: mx + 100, y2: my }]);
    } else if (tool === 'door') {
      setElements(prev => [...prev, { type: 'door', floor, x: mx, y: my }]);
    } else if (tool === 'obstacle') {
      setElements(prev => [...prev, { type: 'obstacle', floor, x: mx, y: my }]);
    } else if (tool === 'delete') {
      const idx = elements.findIndex(el => el.floor === floor && Math.hypot(el.x - mx, el.y - my) < 20);
      if (idx >= 0) setElements(prev => prev.filter((_, i) => i !== idx));
    }
  }, [tool, floor, elements]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">🗺️ 地图编辑器</h2>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex items-center gap-2 flex-wrap">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className={`px-3 py-2 rounded text-sm transition ${tool === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
        <span className="w-px h-6 bg-slate-300 mx-1" />
        <select value={floor} onChange={e => setFloor(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-sm">
          <option value="1F">一层</option><option value="2F">二层</option><option value="3F">三层</option>
        </select>
        {tool === 'node' && (
          <select value={nodeType} onChange={e => setNodeType(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-sm">
            {Object.entries(nodeTypeNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <span className="w-px h-6 bg-slate-300 mx-1" />
        <button onClick={handleUndo} className="px-3 py-2 rounded text-sm bg-slate-100 hover:bg-slate-200">↩️ 撤销</button>
        <button onClick={handleSave} className="px-3 py-2 rounded text-sm bg-green-100 hover:bg-green-200 text-green-700">💾 保存</button>
        <button onClick={handleLoad} className="px-3 py-2 rounded text-sm bg-blue-100 hover:bg-blue-200 text-blue-700">📂 加载</button>
        <button onClick={handleValidate} className="px-3 py-2 rounded text-sm bg-purple-100 hover:bg-purple-200 text-purple-700">✅ 验证</button>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <canvas ref={canvasRef} onClick={handleClick}
          className="w-full border border-slate-300 rounded" style={{ maxHeight: '600px', aspectRatio: '3/2', cursor: tool === 'select' ? 'default' : 'crosshair' }} />
      </div>

      {/* Validation */}
      {validationResult && (
        <div className={`rounded-lg p-3 text-sm ${validationResult.valid ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {validationResult.msg}
        </div>
      )}

      {/* Elements List */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-2">📋 自定义元素 ({elements.filter(e => e.floor === floor).length})</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {elements.filter(e => e.floor === floor).map((el, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded text-xs ${selectedEl === elements.indexOf(el) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
              <span>{el.type === 'node' ? '📍' : el.type === 'wall' ? '🧱' : el.type === 'door' ? '🚪' : '⚠️'} {el.name || el.type} ({el.x}, {el.y})</span>
              <button onClick={() => setElements(prev => prev.filter((_, j) => j !== elements.indexOf(el)))} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
          {elements.filter(e => e.floor === floor).length === 0 && <div className="text-slate-400 text-xs">暂无自定义元素</div>}
        </div>
      </div>
    </div>
  );
}
