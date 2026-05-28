export default function StatCard({ label, value, icon: Icon, color = 'text-blue-400', className = '' }) {
  return (
    <div className={`bg-slate-900 rounded-lg p-3 border border-slate-700/60 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
