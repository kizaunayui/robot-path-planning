import { useState } from 'react'
import { Menu, Route, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar className="hidden lg:flex" />

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="主导航">
          <button className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" aria-label="关闭导航" onClick={() => setMenuOpen(false)} />
          <Sidebar className="relative z-10 shadow-2xl" onNavigate={() => setMenuOpen(false)} />
          <button className="relative z-10 m-3 grid h-10 w-10 place-items-center rounded-lg bg-slate-800 text-slate-200" aria-label="关闭导航" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2 font-semibold text-white"><Route size={19} className="text-blue-400" />在线路径规划</div>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-900" aria-label="打开导航" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
        </header>
        <main className="min-w-0 p-3 sm:p-4 lg:h-screen lg:overflow-auto lg:p-5">
        {children}
        </main>
      </div>
    </div>
  )
}
