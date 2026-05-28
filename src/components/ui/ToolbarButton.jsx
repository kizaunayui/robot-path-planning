export default function ToolbarButton({ icon: Icon, label, active, onClick, variant = 'default', className = '' }) {
  const variants = {
    default: active
      ? 'bg-blue-600 text-white'
      : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    slate: 'bg-slate-600 hover:bg-slate-500 text-white',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${variants[variant] || variants.default} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  )
}
