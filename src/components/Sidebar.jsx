import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '🗺️', label: '地图总览' },
  { path: '/pathplan', icon: '📐', label: '路径规划' },
  { path: '/collision', icon: '⚠️', label: '碰撞预警' },
  { path: '/navmesh', icon: '🔺', label: '导航网格' },
  { path: '/multi-robot', icon: '🤖', label: '多机器人' },
  { path: '/tasks', icon: '📋', label: '任务分配' },
  { path: '/costmap', icon: '🌡️', label: '区域代价' },
  { path: '/his', icon: '⚙️', label: 'HIS策略' },
  { path: '/charging', icon: '🔋', label: '充电调度' },
  { path: '/diagnostics', icon: '📍', label: '定位诊断' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span>路径规划系统</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">机器人在线实时路径规划</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>系统运行中</span>
        </div>
      </div>
    </aside>
  )
}
