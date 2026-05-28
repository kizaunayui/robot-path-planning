import { Star, Route, RotateCw, Building2, Clock, Battery, Zap, ArrowRight } from 'lucide-react'
import { strategyColors } from '../../data/mapData'

export default function RouteMetricCard({ route, isSelected, isBest, onClick }) {
  const color = strategyColors[route.strategy]

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-slate-900 border-2 rounded-lg p-4 transition ${
        isSelected ? 'border-blue-500 bg-slate-800/50' : 'border-slate-700/60 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold" style={{ color }}>
          {route.name}
        </div>
        {isBest && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            最优
          </span>
        )}
      </div>
      <div className="space-y-2 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Route className="w-3 h-3" /> 路径长度</span>
          <span className="font-medium">{route.length} 步</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> 转弯次数</span>
          <span className="font-medium">{route.turns} 次</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> 电梯换乘</span>
          <span className="font-medium">{route.elevatorCount || 0} 次</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 预计耗时</span>
          <span className="font-medium">{route.estimatedMinutes} 分钟</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> 电量消耗</span>
          <span className="font-medium">{route.energy} 单位</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-700 pt-2">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 综合评分</span>
          <span className="font-bold text-blue-400">{route.score}</span>
        </div>
      </div>
      {isSelected && (
        <div className="mt-3 text-xs text-blue-400 font-medium text-center bg-blue-500/10 rounded py-1">
          已选中高亮
        </div>
      )}
    </div>
  )
}

export function MetricCompare({ label, icon: Icon, oldVal, newVal, unit, diff, diffColor }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </div>
      <div className="text-lg font-bold text-white">
        {oldVal} <ArrowRight className="w-4 h-4 inline text-slate-600" /> {newVal}
      </div>
      {unit && <div className="text-xs text-slate-500">{unit}</div>}
      {diff !== undefined && (
        <div className={`text-xs font-medium ${diffColor || (diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-slate-500')}`}>
          {diff > 0 ? `+${diff}` : diff} {unit || ''}
        </div>
      )}
    </div>
  )
}
