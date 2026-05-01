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
- 外观定制：车架、轮圈、轮胎、座垫、把套、点缀色自由配色
- PBR 材质 + 环境反射贴图 + Neutral 色调映射
- 踩踏动画 + 车轮/曲柄旋转
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
