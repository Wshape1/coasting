import { create } from 'zustand';

export type BikeType = 'road' | 'mountain';
export type Pose = 'static' | 'riding';

export interface BikeStore {
  height: number;
  inseam: number;
  armLength: number;
  bikeType: BikeType;
  pose: Pose;
  setMeasurements: (h: number, i: number, a: number) => void;
  setBikeType: (type: BikeType) => void;
  setPose: (pose: Pose) => void;
}

export const useBikeStore = create<BikeStore>((set) => ({
  height: 175,
  inseam: 80,
  armLength: 60,
  bikeType: 'road',
  pose: 'static',
  setMeasurements: (height, inseam, armLength) =>
    set({ height, inseam, armLength }),
  setBikeType: (bikeType) => set({ bikeType }),
  setPose: (pose) => set({ pose }),
}));
