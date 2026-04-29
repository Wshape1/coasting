import { create } from 'zustand';

export type BikeType = 'road' | 'mountain' | 'urban';
export type Pose = 'seated' | 'sprint' | 'climbing' | 'aero';
export type Scene = 'city' | 'mountain' | 'seaside';

export interface BikeStore {
  height: number;
  weight: number;
  inseam: number;
  bikeType: BikeType;
  pose: Pose;
  scene: Scene;
  setMeasurements: (h: number, w: number, i: number) => void;
  setBikeType: (type: BikeType) => void;
  setPose: (pose: Pose) => void;
  setScene: (scene: Scene) => void;
}

export const useBikeStore = create<BikeStore>((set) => ({
  height: 178,
  weight: 72,
  inseam: 82,
  bikeType: 'road',
  pose: 'seated',
  scene: 'city',
  setMeasurements: (height, weight, inseam) =>
    set({ height, weight, inseam }),
  setBikeType: (bikeType) => set({ bikeType }),
  setPose: (pose) => set({ pose }),
  setScene: (scene) => set({ scene }),
}));
