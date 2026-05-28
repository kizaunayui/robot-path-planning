export default function Panel({ title, children, className = '', actions, noPad = false }) {
  return (
    <div className={`bg-slate-900 rounded-lg border border-slate-700/60 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-4'}>{children}</div>
    </div>
  )
}
