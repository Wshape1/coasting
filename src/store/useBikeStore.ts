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
  armSpan: number;
  shoulderWidth: number;
  legScale: number;
  torsoScl: number;
  // Bike config
  presetKey: PresetKey;
  targetParams: BikeParams;
  currentParams: BikeParams;
  // Pose & scene
  pose: Pose;
  scene: Scene;
  // Animation
  isAnimating: boolean;
  showHuman: boolean;
  showDebug: boolean;
  animAngle: number;

  // Actions
  setMeasurements: (h: number, w: number, i: number) => void;
  setBodyDims: (h: number, w: number, i: number, a: number, s: number) => void;
  setArmSpan: (v: number) => void;
  setShoulderWidth: (v: number) => void;
  setLegScale: (v: number) => void;
  setTorsoScl: (v: number) => void;
  setPresetKey: (key: PresetKey) => void;
  setParam: (key: string, value: number) => void;
  setColor: (key: string, value: string) => void;
  setPose: (pose: Pose) => void;
  setScene: (scene: Scene) => void;
  toggleAnimation: () => void;
  toggleHuman: () => void;
  toggleDebug: () => void;
  resetParams: () => void;
  resetHumanMeasurements: () => void;
  lerpToTarget: (speed: number) => boolean;
  tickAnimation: (dt: number, rpm: number) => number;
}

const LERP_SPEED = 0.18;

export const useBikeStore = create<BikeStore>()(
  persist(
    (set, get) => ({
      height: 178,
      weight: 72,
      inseam: 93,
      armSpan: 178,
      shoulderWidth: 41,
      legScale: 0.52,
      torsoScl: 0.48,
      presetKey: 'road',
      targetParams: { ...PRESETS.road },
      currentParams: { ...PRESETS.road },
      pose: 'seated',
      scene: 'city',
      isAnimating: false,
      showHuman: true,
      showDebug: false,
      animAngle: 0,

      setMeasurements: (height, weight, inseam) => {
        const L = height > 0 ? inseam / height : 0.47;
        return set({ height, weight, inseam, legScale: L, torsoScl: 1 - L });
      },
      setBodyDims: (height, weight, inseam, armSpan, shoulderWidth) => {
        const L = height > 0 ? inseam / height : 0.47;
        return set({ height, weight, inseam, armSpan, shoulderWidth, legScale: L, torsoScl: 1 - L });
      },
      setArmSpan: (v) => set({ armSpan: v }),
      setShoulderWidth: (v) => set({ shoulderWidth: v }),
      // L = legScale ∈ [0.40, 0.618], T = 1 - L ∈ [0.382, 0.60]; C = H × L
      setLegScale: (L) => set((s) => {
        const v = Math.min(0.618, Math.max(0.400, L));
        const newInseam = Math.round(s.height * v);
        return { legScale: v, torsoScl: 1 - v, inseam: newInseam };
      }),
      setTorsoScl: (T) => set((s) => {
        const v = Math.min(0.600, Math.max(0.382, T));
        const L = 1 - v;
        const newInseam = Math.round(s.height * L);
        return { torsoScl: v, legScale: L, inseam: newInseam };
      }),
      resetHumanMeasurements: () => {
        const H = 178, L = 0.52;
        return set({
          height: H, weight: 72, inseam: Math.round(H * L),
          armSpan: H, shoulderWidth: 41, legScale: L, torsoScl: 1 - L,
        });
      },

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
      toggleHuman: () => set((s) => ({ showHuman: !s.showHuman })),
      toggleDebug: () => set((s) => ({ showDebug: !s.showDebug })),

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
        armSpan: state.armSpan,
        shoulderWidth: state.shoulderWidth,
        legScale: state.legScale,
        torsoScl: state.torsoScl,
        presetKey: state.presetKey,
        targetParams: state.targetParams,
        pose: state.pose,
        scene: state.scene,
      }),
    },
  ),
);
