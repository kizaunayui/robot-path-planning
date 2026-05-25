import { useState } from 'react'
import { StatusCard, Panel, Badge, Button } from '../components/StatusCard'
import { tasks, taskAssignments, robots } from '../data/mockData'

export default function TaskAllocation() {
  const [taskList, setTaskList] = useState(tasks)
  const [showAssignments, setShowAssignments] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  const priorityColors = { critical: 'red', high: 'orange', normal: 'blue' }
  const priorityLabels = { critical: '紧急', high: '高', normal: '普通' }

  const handleDragStart = (idx) => setDragIdx(idx)
  const handleDragOver = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const newList = [...taskList]
    const [moved] = newList.splice(dragIdx, 1)
    newList.splice(idx, 0, moved)
    setTaskList(newList)
    setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  const handleAssign = () => setShowAssignments(true)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📋 任务分配</h2>
      <p className="text-slate-400 text-sm">基于匈牙利算法的任务分配优化，支持拖拽排序和自动匹配最优机器人。</p>

      <div className="grid grid-cols-4 gap-3">
        <StatusCard title="待分配任务" value={taskList.length} subtitle="任务队列" icon="📋" color="blue" />
        <StatusCard title="紧急任务" value={taskList.filter(t => t.priority === 'critical').length} subtitle="优先处理" icon="🔴" color="red" />
        <StatusCard title="已分配" value={showAssignments ? taskAssignments.length : 0} subtitle="匈牙利算法" icon="✅" color="green" />
        <StatusCard title="匹配效率" value="92.8%" subtitle="最优匹配" icon="📊" color="purple" />
      </div>

      <div className="flex gap-4">
        {/* 任务列表 */}
        <div className="flex-1">
          <Panel
            title="任务队列（拖拽排序）"
            actions={
              <Button variant="success" onClick={handleAssign}>🔄 匈牙利算法匹配</Button>
            }
          >
            <div className="space-y-1.5">
              {taskList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">暂无待分配任务</div>
              ) : taskList.map((task, idx) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors ${
                    dragIdx === idx ? 'opacity-50' : ''
                  }`}
                >
                  <span className="text-slate-500 text-sm font-mono w-6">{idx + 1}</span>
                  <span className="text-slate-500">⠿</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white font-medium">{task.id}</span>
                      <Badge color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      {task.from} → {task.to} · {task.cargo} · {task.weight}kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">截止</div>
                    <div className="text-sm text-white font-mono">{task.deadline}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* 匹配结果 */}
        <div className="w-96">
          <Panel title="匈牙利算法匹配结果">
            {showAssignments ? (
              <div className="space-y-2">
                {/* 匹配表格 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="py-2 text-left">任务</th>
                        <th className="py-2 text-left">机器人</th>
                        <th className="py-2 text-right">评分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskAssignments.map((a, i) => {
                        const task = tasks.find(t => t.id === a.taskId)
                        const robot = robots.find(r => r.id === a.robotId)
                        return (
                          <tr key={i} className="border-b border-slate-800 hover:bg-slate-800">
                            <td className="py-2">
                              <div className="text-white font-medium">{a.taskId}</div>
                              <div className="text-slate-500">{task?.cargo}</div>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: robot?.color }} />
                                <span className="text-white">{a.robotId}</span>
                              </div>
                              <div className="text-slate-500">{robot?.name?.substring(0, 6)}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="text-white font-mono">{a.score}</div>
                              <div className="text-slate-500 text-right max-w-32 truncate" title={a.reason}>{a.reason.substring(0, 12)}...</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 匹配详情 */}
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">匹配理由（点击展开）</div>
                  {taskAssignments.slice(0, 3).map((a, i) => (
                    <div key={i} className="text-xs text-slate-500 mb-1">
                      <span className="text-blue-400">{a.taskId}→{a.robotId}:</span> {a.reason}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-sm">点击"匈牙利算法匹配"按钮</div>
                <div className="text-xs mt-1">自动计算最优任务分配方案</div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
