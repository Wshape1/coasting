# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server (HMR)
pnpm build        # Type-check + production build → dist/
pnpm preview      # Preview production build
pnpm test         # Run tests once (Vitest)
pnpm test:watch   # Watch mode
pnpm lint         # ESLint
pnpm format       # Prettier (src/**/*.{ts,tsx,css})
```

Build output goes to `dist/`. Base path is set via `VITE_BASE` env var (default `/coasting/`).

## Architecture Overview

### Coordinate System

The bike model group sits at `[0, 0.35, 0]` with rotation `[0, -π/2, 0]`.
**Bike forward = World +Z, bike right = World -X, up = +Y.**

The human model group shares the same Y-rotation and positions itself dynamically to sit on the saddle.
All bike geometry is computed in local 2D (X forward, Y up, Z left/right), then rotated into world space.

### Responsive Layouts (`src/App.tsx`)

Three breakpoint-driven layouts via `useMediaQuery`:

| Layout | Breakpoint | Structure |
|--------|-----------|-----------|
| Desktop | `>=1024px` | 3-column: left(CustomizationPanel) + center(Viewport+PoseSwitcher) + right(BodyInput+HumanDerived+PoseAnalysis+AIRecommend) |
| Tablet | `>=768px` | 2-column: left(Viewport+PoseSwitcher) + right 320px panel |
| Mobile | `<768px` | Tab-driven: NavBar top island + sections + MobileTabBar bottom island |

Mobile tabs: 姿态模拟 / 车辆配置 / 个人数据 / 关于.
Desktop nav items (for scroll-to-section): 姿态模拟 / 选车建议 / 关于.

### State Management (`src/store/useBikeStore.ts`)

Single Zustand store with `persist` middleware (localStorage key `coasting-store`):

- **Human body**: height(cm), weight(kg), inseam(cm), armScale, legScale, torsoScl
- **Bike config**: `targetParams` + `currentParams` (lerp-interpolated per-frame), `presetKey`
- **Pose & scene**: pose (`seated|sprint|climbing|aero`), scene (`city|mountain|seaside`)
- **Animation**: `isAnimating`, `showHuman`, `animAngle`
- **Geometry lerp**: `lerpToTarget(speed)` interpolates `currentParams` toward `targetParams` every frame. Only `GEO_PARAM_KEYS` are lerped; color params sync instantly.
- **Persist**: measurement + preset + targetParams + pose + scene survive reload.

### 3D Scene (`src/components/BikeCanvas.tsx`)

R3F `Canvas` with transparent background (`alpha: true`), Neutral tone mapping (5), exposure 1.05, PMREM-generated environment map for PBR metal reflections. Three-point lighting setup (warm key + cool fill + rim). Loading overlay with indeterminate progress bar + LoadSignal pattern for post-Suspense ready detection.

### Bike Model — Procedural Geometry

No glTF files. The bike is built entirely from `CylinderGeometry` / `BoxGeometry` / `TorusGeometry` primitives.

- **`BikeGeometrySolver`** (`src/core/`): Chain-derivation solver. BB=(0,0,0) is absolute origin. Computes 8 key frame points (seatTop, rearAxle, htTop, htBottom, frontAxle, stemEnd, spTop) in strict dependency order. Returns derived metrics (stack, reach, wheelbase, trail).
- **`BikeModel`** (`src/components/BikeModel.tsx`): Reads `currentParams` from store. Every frame: calls `lerpToTarget` + `tickAnimation` if animating. Geometry rebuilds throttled to 120ms (time-based, not frame-count). Materials updated in-place every frame (cheap color.set()). Animation drives crank and wheel rotation.z directly via refs.
- **`BikeMesh`** (`src/components/BikeMesh.tsx`): Pure presentational. Receives `FramePoints` + `DerivedData` + `Materials` as props. Builds 50+ mesh primitives in a single `useMemo`. Includes `buildWheelGroup` with 16-spoke `InstancedMesh` for performance.
- **Materials** (`src/lib/materials.ts`): Module-level cached `MeshStandardMaterial` instances. `createMaterials(params)` updates colors in-place on the same reference — no React re-render needed.
- **Config** (`src/config/presets.ts`): `GEO_PARAM_KEYS` (14 numeric params), `COLOR_PARAM_KEYS`, `PRESETS` (mountain/road/commuter with real-world geometry data), `PARAM_DEFS` (ranges/tips), `COLOR_DEFS`.

### Human Model — Procedural Skeleton (`src/components/HumanModel.tsx`)

No glTF. Full bone hierarchy built from `THREE.Bone` with cylinder/box/icosahedron meshes.

- **Bone tree** (17 joints): hips → lowerTorso → upperTorso → head, (left/right) shoulder → elbow → hand, (left/right) hipLeg → knee → ankle → foot. All bone references stored in module-level `bones` / `boneByName` / `boneList` registries.
- **Pose system** (`src/lib/pose.ts`): Quaternion-only animation. `P_STAND_Q` defines default standing pose as Euler→quaternion. `blendPoseQ` uses `Quaternion.slerp` for smooth transitions. All joint rotations use `.quaternion.copy()`, never `.rotation`.
- **IK solver** (`src/lib/ik.ts`): 2-bone analytical IK (law of cosines) in 2D sagittal plane. Returns rotation angles for hip/shoulder and knee/elbow. Used for pedaling animation and handlebar reach.
- **Measurement scaling**: `applyMeasurements()` scales mesh Y by height/inseam/proportions, and mesh X/Z by BMI-derived width factor. `hipsBone.position.y = 0` (seated — hips at group origin which is saddle position).
- **Bike binding**: `useFrame` computes bike geometry via `BikeGeometrySolver(currentParams)` to get saddle/handlebar/BB world positions. Group positioned at saddle. Leg IK targets pedal positions relative to BB. Arm IK targets handlebar positions relative to shoulder.

### Styling

- Tailwind CSS v4 with `@theme` custom HSL palette (warm cream `--background: 40 30% 96%`, golden primary `--primary: 38 70% 55%`)
- Glassmorphism cards: `rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl`
- Custom scrollbar hiding via `.scrollbar-none` utility class
- Indeterminate loading bar animation: `.animate-loading-bar`

### API

`api/ai/recommend.ts` — Vercel Edge Function stub. `AIRecommendationCard` uses `@tanstack/react-query` with fallback data when API is unreachable. Query key limited to `{bikeType, pose}` to avoid flicker on measurement changes.

## Key Patterns

- **Geometry params vs color params**: Geometry uses `targetParams → lerp → currentParams` for smooth transitions. Colors set instantly on both.
- **Direct ref mutation for animation**: Crank/wheel rotation.z mutated directly on refs in `useFrame` — no React state involved per frame.
- **Module-level caches**: Materials (`_cached`), bone registries (`boneByName`), derived data (`_cachedDerived`) all use module-level state to avoid re-computation across renders.
- **Throttle geometry rebuilds**: `GEOMETRY_THROTTLE_MS = 120` — prevents GPU overload from rapid slider changes.
- **Scene cleanup**: SceneSelection is commented out (not deleted), scene label in Viewport is commented out. Both kept for potential future use.
- **PMREM environment**: Generated once on Canvas `onCreated` from a simple scene with bright top + dark ground + directional light. Provides reflections for metallic PBR materials despite transparent canvas.

## Layout / Scroll Notes

- Desktop left column (bike-section) and right column (data-section) are `overflow-y-auto scrollbar-none`.
- Tablet right panel same.
- Mobile uses `hidden` class to toggle tab sections (no remounting — preserves 3D scene).
- Viewport area has NO background color, no border-radius, no shadow (model blends with page).
- Viewport bottom bar: animation button (icon-only) + human toggle button (icon + slash when hidden) + pose info label + reload button.
