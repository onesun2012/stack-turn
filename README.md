# 叠转 Stack Turn

经典 Stack 堆塔玩法的 3D 网页复刻，加入「滑轨分段旋转」机制：每 3 层，滑块的滑动方向旋转 90°。

[![CI](https://github.com/onesun2012/stack-turn/actions/workflows/deploy.yml/badge.svg)](https://github.com/onesun2012/stack-turn/actions/workflows/deploy.yml)**[在线试玩 →](https://onesun2012.github.io/stack-turn/)**

## 玩法

- 点按屏幕，放下滑动的方块；未对齐的部分被切掉坠落
- 方块越来越小，完全错开即游戏结束
- 每 3 层滑动方向旋转 90°，重新适应节奏
- 连续「完美」堆叠触发吸附特效，方块尺寸逐渐回涨

## 技术要点

- **逻辑 / 渲染严格分层**：`src/game/` 不依赖 Three.js，切割判定、换轴、计分全是纯函数，配 20 个单元测试（vitest）
- **一维切割判定**：滑块每次只沿一个轴运动，重合计算降为一维区间运算（`game/cutter.ts`），换轴机制零成本复用
- **性能**：碎片对象池（`render/debrisPool.ts`）、全场景共享单个 BoxGeometry、材质按色相缓存——运行时零分配，移动端稳定 60fps
- **零美术素材**：音效由 Web Audio 振荡器实时合成（完美音沿五声音阶随连击爬升）；分享卡片用 Canvas 2D 重绘等轴测塔
- **移动端优先**：Pointer Events 一套代码兼容触屏与鼠标；dt 钳制防后台返回跳变；DPR 上限；下拉刷新/双击缩放/长按菜单全面禁用

## 本地开发

```bash
npm installnpm run dev        # 开发npm test           # 单元测试npm run lint       # ESLintnpm run build      # 产物在 dist/（tsc 类型检查 → vite 构建）
```

所有可调参数集中在 `src/game/config.ts`（换轴间隔、速度曲线、完美容差等）。

## 目录结构

```
src/├── core/      # 主循环、事件总线
	├── game/      # 纯逻辑：切割、换轴、计分、会话状态机
	├── render/    # Three.js：场景、镜头、对象池、特效
	├── audio/     # Web Audio 合成音效
	├── ui/        # HUD、屏幕、分享卡片
	├── input/     # 统一输入
	└── storage/   # localStorage 封装
```

## License

MIT