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
| Mobile  | `<768px`   | Single-column scroll + floating top nav + bottom tab bar |

The `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`) drives layout switching. All three layouts compose from the same shared components — they are not separate code paths.

### State Management (Zustand)

`src/store/useBikeStore.ts` — singular global store:

- **Measurements**: height, weight, inseam
- **Selections**: bikeType (`road|mountain|urban`), pose (`seated|sprint|climbing|aero`), scene (`city|mountain|seaside`)

### 3D Rendering (React Three Fiber)

Stack: `@react-three/fiber` + `three@0.183.0`

| Component | Role |
|-----------|------|
| `BikeCanvas.tsx` | Sets up Canvas, lights, shadows, tone mapping |
| `BikeModel.tsx` | Geometric bike from Tube/Wheel primitives — frame color varies by bikeType |
| `HumanModel.tsx` | Rider figure with pose-driven animation |
| `CameraControls.tsx` | Orbit-style camera |
| `SimpleGrid.tsx` | Ground grid + reflection |

### UI Component Tree

```
App (QueryClientProvider)
└── AppLayout
    ├── NavBar           — Apple-style floating nav
    ├── Viewport         — 3D Canvas wrapper
    │   └── BikeCanvas   — R3F Canvas + scene
    ├── PoseSwitcher     — 4-pose capsule selector
    ├── BikeSelection    — Bike type pills
    ├── SceneSelection   — Scene environment picker
    ├── DataPanel        — Bike spec summary
    ├── BodyInput        — Height/Weight/Inseam sliders
    ├── PoseAnalysis     — Donut chart + match score
    ├── AIRecommendationCard — AI-powered fit suggestion
    └── MobileTabBar     — (mobile only) bottom tab navigation
```

### UI Primitives (src/components/ui/)

shadcn-style components built on Radix primitives: Button, Card, Drawer (vaul), Input, Label, Select, Slider. Uses `cn()` utility (clsx + tailwind-merge).

### Styling

- Tailwind CSS v4 with `@theme` custom palette
- HSL color tokens in `:root` (warm cream/yellow scheme)
- Glassmorphism via `bg-white/70 backdrop-blur-xl`
- Fluid font sizing via `clamp()` utilities

## Design Files

UI mockups in `pencil/main.pen` (Pencil format). Exported snapshots in `snapshot/`.

## Package Manager

pnpm (v11) with `three@0.183.0` pinned via overrides.
