import { useState } from "react";
import { useAppStore } from "../store/AppStore";
import { taskQueue, taskAssignments } from "../data/mockData";

export default function TaskAllocation() {
  const { robots } = useAppStore();
  const [taskList, setTaskList] = useState(taskQueue);
  const [showAssignments, setShowAssignments] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const priorityColors = { critical: "red", high: "orange", normal: "blue" };
  const priorityLabels = { critical: "紧急", high: "高", normal: "普通" };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newList = [...taskList];
    const [moved] = newList.splice(dragIdx, 1);
    newList.splice(idx, 0, moved);
    setTaskList(newList);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">📋 任务分配</h2>
      <p className="text-slate-400 text-sm">任务队列管理与机器人匹配，支持拖拽排序。</p>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">待分配任务</div>
          <div className="text-2xl font-bold">{taskList.length}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">紧急任务</div>
          <div className="text-2xl font-bold">{taskList.filter((t) => t.priority === "critical").length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">已分配</div>
          <div className="text-2xl font-bold">{showAssignments ? taskAssignments.length : 0}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <div className="text-sm opacity-80">可用机器人</div>
          <div className="text-2xl font-bold">{robots.filter((r) => r.status === "idle").length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task list */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">任务队列（拖拽排序）</h3>
            <button
              onClick={() => setShowAssignments(true)}
              className="px-3 py-1.5 rounded text-xs bg-green-600 text-white hover:bg-green-700"
            >
              🔄 算法匹配
            </button>
          </div>
          <div className="space-y-1.5">
            {taskList.map((task, idx) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-grab hover:bg-slate-100 transition-colors ${
                  dragIdx === idx ? "opacity-50" : ""
                }`}
              >
                <span className="text-slate-400 text-sm font-mono w-6">{idx + 1}</span>
                <span className="text-slate-400">⠿</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-700">{task.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.priority === "critical"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {task.from} → {task.to} · {task.cargo} · {task.weight}kg
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">截止</div>
                  <div className="text-sm font-mono text-slate-700">{task.deadline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match results */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">匹配结果</h3>
          {showAssignments ? (
            <div className="space-y-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-2 text-left">任务</th>
                    <th className="py-2 text-left">机器人</th>
                    <th className="py-2 text-right">评分</th>
                  </tr>
                </thead>
                <tbody>
                  {taskAssignments.map((a, i) => {
                    const robot = robots.find((r) => r.id === a.robotId);
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2">
                          <div className="font-medium text-slate-700">{a.taskId}</div>
                        </td>
                        <td className="py-2">
                          <div className="text-slate-700">{a.robotId}</div>
                          <div className="text-slate-400">{robot?.name?.substring(0, 8)}</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="font-mono text-slate-700">{a.score}</div>
                          <div className="text-slate-400 truncate max-w-24" title={a.reason}>
                            {a.reason.substring(0, 10)}...
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="pt-2 border-t border-slate-200">
                {taskAssignments.slice(0, 3).map((a, i) => (
                  <div key={i} className="text-xs text-slate-500 mb-1">
                    <span className="text-blue-600">{a.taskId}→{a.robotId}:</span> {a.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">🔄</div>
              <div className="text-sm">点击"算法匹配"按钮</div>
              <div className="text-xs mt-1">自动计算最优任务分配方案</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
