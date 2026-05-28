import { floorColors } from '../../data/mapData'

const floorLabels = {
  '1F': '一层',
  '2F': '二层',
  '3F': '三层',
}

export default function FloorTabs({ currentFloor, onFloorChange, className = '' }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {['1F', '2F', '3F'].map((fid) => (
        <button
          key={fid}
          onClick={() => onFloorChange(fid)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentFloor === fid
              ? 'text-white shadow-lg'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          style={currentFloor === fid ? { backgroundColor: floorColors[fid] } : {}}
        >
          {fid} {floorLabels[fid]}
        </button>
      ))}
    </div>
  )
}
