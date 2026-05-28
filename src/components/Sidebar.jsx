import { NavLink } from 'react-router-dom'
import { Map, PencilLine, Route, Repeat, Settings } from 'lucide-react'

const navItems = [
  { path: '/', icon: Map, label: '路径规划总览' },
  { path: '/map-editor', icon: PencilLine, label: '地图编辑' },
  { path: '/pathplan', icon: Route, label: '多楼层路径规划' },
  { path: '/replan', icon: Repeat, label: '动态障碍与重规划' },
  { path: '/rules', icon: Settings, label: '规则配置与导出' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="w-6 h-6 text-blue-400" />
          <span>路径规划系统</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">机器人在线实时路径规划</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          return (
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
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>系统运行中</span>
        </div>
      </div>
    </aside>
  )
}
