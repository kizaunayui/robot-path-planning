export default function LogList({ logs, maxItems = 8, emptyText = '暂无日志' }) {
  const items = logs.slice(0, maxItems)

  if (items.length === 0) {
    return <p className="text-slate-600 text-xs">{emptyText}</p>
  }

  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto">
      {items.map((log, i) => (
        <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800/60 rounded">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-400 truncate">{log.message}</span>
          </div>
          <span className="text-slate-600 shrink-0 ml-2 font-mono">{log.time}</span>
        </div>
      ))}
    </div>
  )
}
