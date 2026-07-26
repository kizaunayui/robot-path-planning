# 机器人在线实时路径规划软件

基于 React 19 + Vite 8 + Tailwind CSS 4 的医院机器人多楼层路径规划与仿真系统（纯前端演示）。

## 在线演示

https://kizaunayui.github.io/robot-path-planning/

## 功能模块（5 个页面）

| 页面 | 说明 |
|------|------|
| 🗺️ 路径规划总览 | 三层地图统计、地图预览、楼层连通性校验、操作日志 |
| ✏️ 地图编辑 | 分楼层绘制墙壁/动态障碍、擦除、随机障碍、连通性实时验证、localStorage 持久化 |
| 📐 多楼层路径规划 | 起终点/货物类型/优先级选择 → 三策略 A*（时间/平稳/节能）→ 指标对比与楼层分段展示，支持电梯跨层换乘 |
| ⚠️ 动态障碍与重规划 | 在当前路径上模拟动态障碍 → 自动重规划 → 新旧路径指标对比与历史记录 |
| 🚦 规则配置与导出 | 6 条交通规则（区域坐标数据驱动）启停与权重调节、变更自动重规划、结果导出 JSON/CSV |

## 算法核心（`src/utils/planner.js`）

- **多楼层 A\***：搜索状态含楼层维度，电梯格作为跨层邻居扩展（固定换乘代价）
- **可采纳启发式**：曼哈顿距离 + 跨层代价，按单步代价下限缩放，规则折扣下仍保证最优解
- **代价模型**：基础代价 + 附加惩罚（规则区域/转弯/障碍规避缓冲）× 货物与优先级乘数,再乘策略折扣——紧急任务更敢穿越受限区,低优先级绕行更保守
- **规划参数**：动态障碍规避灵敏度、墙体安全缓冲,直接参与代价计算
- **交通规则**:区域坐标定义在 `src/data/mapData.js` 的规则数据中,代价计算、地图渲染、规则页描述共用同一数据源
- **路径报告**:长度/转弯/电梯换乘/耗时/能耗/综合评分(仅由路径质量构成)
- **地图验证**:BFS 连通性检查,保证所有科室节点可达

## 本地开发

```bash
npm install
npm run dev    # 开发服务器
npm test       # 单元测试（vitest）
npm run lint   # ESLint
npm run build  # 生产构建
```

> Windows 下如遇 rolldown 原生绑定缺失（npm 跨平台 optional deps 已知问题），执行:
> `npm install --no-save @rolldown/binding-win32-x64-msvc`

## 部署

推送到 `main` 后 GitHub Actions 自动执行 lint → test → build → 发布 GitHub Pages（见 `.github/workflows/deploy.yml`）。

## 目录说明

- `src/utils/planner.js` — 规划算法(含单元测试 `planner.test.js`)
- `src/data/mapData.js` — 三层地图、规则、货物/优先级数据
- `src/store/AppStore.jsx` — 全局状态(地图存档带版本号)
- `docs/reports/` — 历次修复/审计报告
- `docs/manual/` — 操作手册与软著材料

## 当前限制

- 纯前端仿真,不接真实后端与机器人
- 网格化地图,非真实 CAD 底图
- 单机器人路径展示,无多机协同(多机调度见 [robot-scheduling-platform](https://github.com/kizaunayui/robot-scheduling-platform))
