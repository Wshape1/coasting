# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + production build
pnpm test         # Run tests once (Vitest)
pnpm test:watch   # Watch mode
pnpm lint         # ESLint
pnpm format       # Prettier (src/**/*.{ts,tsx,css})
```

## Project Architecture

### Responsive Layout Strategy

Single-page app with three breakpoint-driven layouts in `src/App.tsx`:

| Layout | Breakpoint | Structure |
|--------|-----------|-----------|
| Desktop | `>=1024px` | 3-column (left 280px + center flex + right 320px) |
| Tablet  | `>=768px`  | 2-column (viewport flex + right 320px panel) |
| Mobile  | `<768px`   | Tab-driven: fixed top nav + scrollable sections + floating bottom tab bar |

`useMediaQuery` (`src/hooks/useMediaQuery.ts`) drives layout switching. All three layouts share the same components; only arrangement differs.

On **mobile**, the bottom `MobileTabBar` controls which section is visible via `activeTab` state in `MobileLayout` (姿态模拟/选车/数据/个人中心). Sections are shown/hidden with Tailwind `hidden`.

### State Management (Zustand)

`src/store/useBikeStore.ts` — global store with `zustand/middleware` **persist** (localStorage key `coasting-store`):

- **Measurements**: height (cm), weight (kg), inseam (cm)
- **Selections**: bikeType (`road|mountain|urban`), pose (`seated|sprint|climbing|aero`), scene (`city|mountain|seaside`)

### 3D Rendering (React Three Fiber)

Stack: `@react-three/fiber` v10 alpha + `three@0.183.0` + `@react-three/drei`

**glTF Model Pipeline**: Both models loaded from `public/models/` using `GLTFLoader`.

| Model | File | Loader | Notes |
|-------|------|--------|-------|
| Bike | `models/bike_opt/bike.gltf` (+ `.bin` + 2 PNG textures) | `useLoader(GLTFLoader, url)` → `<primitive>` | Node has `scale[100]`, root scale `0.38` |
| Human | `models/human.glb` (234KB, 4944 verts, 1 mesh) | Raw `GLTFLoader.load()` in `useEffect` → extract geometry → render as `<mesh>` | Z-up coordinate system, needs `rotateX(π/2)` on geometry to convert to Y-up |

**HumanModel loading pattern** — glTF node transforms must be accounted for:
1. Load via `GLTFLoader.load()`
2. Find `THREE.Mesh` by traversing `gltf.scene.traverse()`
3. Clone geometry, `rotateX(Math.PI / 2)` (Z-up → Y-up), center via bounding box, `computeVertexNormals()`
4. Render via `<mesh geometry={geo}>` with override material and `rotation={[0, -PI/2, 0]}` to face +X

**VehicleModel** — bike color changes with `bikeType` by reading `useBikeStore` and calling `material.color.set()` on the loaded scene's materials.

**Important**: When moving R3F content into a flex layout, ensure the parent of any `flex-1` element is a flex container (`flex flex-col`), otherwise the flex item collapses to 0 height.

### API

`api/ai/recommend.ts` — Vercel Edge Function, stub POST endpoint. Accepts `{height, inseam, weight, bikeType, pose}`, returns `{size, stack, reach, analysis}`. The `AIRecommendationCard` has hardcoded fallback data when the API is unreachable (offline-first).

### UI Component Tree

```
App (QueryClientProvider)
└── MobileLayout / TabletLayout / DesktopLayout
    ├── NavBar           — floating pill (mobile) / full-width (desktop)
    ├── Viewport         — 3D wrapper with overlay labels
    │   └── BikeCanvas   — R3F Canvas (scene background, ErrorBoundary, Suspense)
    │       ├── HumanModel
    │       ├── BikeModel
    │       ├── SimpleGrid
    │       └── CameraControls
    ├── PoseSwitcher     — 4-pose capsule selector
    ├── BikeSelection    — 3 bike type cards
    ├── SceneSelection   — 3 scene cards (changes Canvas bg color)
    ├── DataPanel        — Bike frame/weight/gears spec
    ├── BodyInput        — Height/Weight/Inseam number inputs
    ├── PoseAnalysis     — SVG ring score + match message
    ├── AIRecommendationCard — skeleton loading fallback
    └── MobileTabBar     — 4-tab bottom island (mobile only)
```

### Styling

- Tailwind CSS v4 with `@theme` custom HSL palette (warm cream + golden primary)
- Glassmorphism: `bg-white/70 shadow-lg ring-1 ring-black/5 backdrop-blur-xl`
- `src/index.css` defines `:root` variables, scrollbar styling, fluid font utilities

### Design Files

UI mockups in `pencil/main.pen` (Pencil format). Exported snapshots in `snapshot/`.

## Package Manager

pnpm (v11) with `three@0.183.0` pinned via overrides.
