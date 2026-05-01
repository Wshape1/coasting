import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BikeParams } from '@/types/bike';
import { PRESETS, GEO_PARAM_KEYS, COLOR_PARAM_KEYS } from '@/config/presets';
import type { PresetKey } from '@/config/presets';

export type { PresetKey };
export type Pose = 'seated' | 'sprint' | 'climbing' | 'aero';
export type Scene = 'city' | 'mountain' | 'seaside';

export interface BikeStore {
  // User measurements
  height: number;
  weight: number;
  inseam: number;
  // Bike config
  presetKey: PresetKey;
  targetParams: BikeParams;
  currentParams: BikeParams;
  // Pose & scene
  pose: Pose;
  scene: Scene;
  // Animation
  isAnimating: boolean;
  animAngle: number;

  // Actions
  setMeasurements: (h: number, w: number, i: number) => void;
  setPresetKey: (key: PresetKey) => void;
  setParam: (key: string, value: number) => void;
  setColor: (key: string, value: string) => void;
  setPose: (pose: Pose) => void;
  setScene: (scene: Scene) => void;
  toggleAnimation: () => void;
  resetParams: () => void;
  lerpToTarget: (speed: number) => boolean;
  tickAnimation: (dt: number, rpm: number) => number;
}

const LERP_SPEED = 0.18;

export const useBikeStore = create<BikeStore>()(
  persist(
    (set, get) => ({
      height: 178,
      weight: 72,
      inseam: 82,
      presetKey: 'road',
      targetParams: { ...PRESETS.road },
      currentParams: { ...PRESETS.road },
      pose: 'seated',
      scene: 'city',
      isAnimating: false,
      animAngle: 0,

      setMeasurements: (height, weight, inseam) => set({ height, weight, inseam }),

      setPresetKey: (key) => {
        const p = { ...PRESETS[key] };
        set({ presetKey: key, targetParams: p, currentParams: p });
      },

      setParam: (key, value) => {
        set((s) => ({
          targetParams: { ...s.targetParams, [key]: value },
        }));
      },

      setColor: (key, value) => {
        set((s) => ({
          targetParams: { ...s.targetParams, [key]: value },
          currentParams: { ...s.currentParams, [key]: value },
        }));
      },

      setPose: (pose) => set({ pose }),
      setScene: (scene) => set({ scene }),

      toggleAnimation: () => set((s) => ({ isAnimating: !s.isAnimating })),

      resetParams: () => {
        const key = get().presetKey;
        const p = { ...PRESETS[key] };
        set({ targetParams: p, currentParams: p });
      },

      lerpToTarget: (speed = LERP_SPEED) => {
        const { currentParams, targetParams } = get();
        const next = { ...currentParams };
        let dirty = false;

        for (const k of GEO_PARAM_KEYS) {
          const t = targetParams[k] as number;
          const c = currentParams[k] as number;
          if (Math.abs(c - t) > 0.05) {
            (next as unknown as Record<string, unknown>)[k] = c + (t - c) * speed;
            dirty = true;
          } else if (c !== t) {
            (next as unknown as Record<string, unknown>)[k] = t;
            dirty = true;
          }
        }

        for (const k of COLOR_PARAM_KEYS) {
          if ((next as unknown as Record<string, unknown>)[k] !== (targetParams as unknown as Record<string, unknown>)[k]) {
            (next as unknown as Record<string, unknown>)[k] = (targetParams as unknown as Record<string, unknown>)[k];
            dirty = true;
          }
        }

        if (dirty) set({ currentParams: next });
        return dirty;
      },

      tickAnimation: (dt, rpm) => {
        const { animAngle } = get();
        const newAngle = animAngle + (rpm / 60) * Math.PI * 2 * dt;
        set({ animAngle: newAngle });
        return newAngle;
      },
    }),
    {
      name: 'coasting-store',
      partialize: (state) => ({
        height: state.height,
        weight: state.weight,
        inseam: state.inseam,
        presetKey: state.presetKey,
        targetParams: state.targetParams,
        pose: state.pose,
        scene: state.scene,
      }),
    },
  ),
);
