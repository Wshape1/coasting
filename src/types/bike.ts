import type * as THREE from 'three';

// ── Parameter definition ──
export interface ParamDef {
  key: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  tip: string;
}

// ── Bike parameters (all values in user-facing units: mm, degrees) ──
export interface BikeParams {
  // Geometry
  wheelDiameter: number;
  topTubeLength: number;
  seatTubeLength: number;
  headTubeAngle: number;
  seatTubeAngle: number;
  chainstayLength: number;
  headTubeLength: number;
  bbDrop: number;
  forkOffset: number;
  stemLength: number;
  handlebarWidth: number;
  crankLength: number;
  seatpostExt: number;
  tireWidth: number;
  // Appearance
  frameColor: string;
  rimColor: string;
  tireColor: string;
  saddleColor: string;
  gripColor: string;
  accentColor: string;
  // Style
  barStyle: 'drop' | 'flat';
  // Meta
  label: string;
  badgeBg: string;
  badgeBorder: string;
}

// ── Bike preset ──
export type BikePreset = BikeParams;

// ── Frame points computed by solver ──
export interface FramePoints {
  bb: THREE.Vector3;
  seatTop: THREE.Vector3;
  rearAxle: THREE.Vector3;
  htTop: THREE.Vector3;
  htBottom: THREE.Vector3;
  frontAxle: THREE.Vector3;
  stemEnd: THREE.Vector3;
  spTop: THREE.Vector3;
}

// ── Derived geometry data ──
export interface DerivedData {
  stack: number;
  reach: number;
  wheelbase: number;
  stayLen: number;
  forkLen: number;
  trail: number;
  wheelR: number;
}

// ── Color customization definition ──
export interface ColorDef {
  key: string;
  label: string;
}
