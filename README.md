# Coasting · 悠骑

3D 自行车车架几何配置器 — 程序化建模、实时参数调节、PBR 金属渲染。

[📎 在线演示](https://wshape1.github.io/coasting)

## 技术栈

- **React 19** + TypeScript
- **Three.js 0.183** / React Three Fiber 9
- **Zustand** 状态管理 + 持久化
- **Tailwind CSS v4** 响应式三栏布局
- **Vite 8** 构建

## 功能

- 三种车型预设（山地/公路/通勤），14 个车架几何参数实时滑块调节
- 程序化车架几何生成（无 glTF 文件依赖），参数联动推导 Stack / Reach / Trail
- 程序化人体骨骼模型（17 关节），实时 IK 求解踩踏 + 握把姿态
- 身体参数：身高、体重、跨高、臂展、肩宽，L+T=1 比例公式联动
- 衍生数据面板：BMI 指标、肢体长度推导、比例可视化
- 车把宽度自适应握把位置（flat / drop bar 不同公式）
- 外观定制：车架、轮圈、轮胎、座垫、把套、点缀色自由配色
- PBR 材质 + 环境反射贴图 + Neutral 色调映射
- 踩踏动画 + 可调倍率滑块（0.1x–3.0x，13 挡离散步进）
- 桌面三栏 / 平板两栏 / 手机 tab 式自适应布局

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # 生产构建 → dist/
pnpm preview      # 预览构建结果
```

## 部署

构建输出在 `dist/`，直接部署到任意静态服务器。

如需更改部署路径，构建时设置环境变量：

```bash
VITE_BASE=/ pnpm build     # 根路径
VITE_BASE=/app/ pnpm build # 子路径
```

---

> ⚠️ **特别提示：本项目完全由 AI 生成。** 所有代码、文档、配置均由 AI 工具自主完成，人工仅提供需求描述与反馈。仅供学习参考，使用前请自行审查代码质量与安全性。

## License

MIT — 详见 [LICENSE](./LICENSE) 文件。
