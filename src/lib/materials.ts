import { mkMat } from './helpers';
import type { BikeParams } from '@/types/bike';

let _cached: ReturnType<typeof createRaw> | null = null;

function createRaw(p: BikeParams) {
  return {
    frameMat: mkMat(p.frameColor, 0.10, 0.88),
    matTire: mkMat(p.tireColor, 0.96, 0.00),
    matRim: mkMat(p.rimColor, 0.18, 0.92),
    matRimInner: mkMat(p.accentColor, 0.12, 0.35),
    matHub: mkMat('#0a0a0a', 0.30, 0.65),
    matSpoke: mkMat('#c8c8c8', 0.20, 0.92),
    matComponent: mkMat('#151515', 0.38, 0.78),
    matSaddle: mkMat(p.saddleColor, 0.88, 0.00),
    matSaddleNose: mkMat(p.saddleColor, 0.82, 0.02),
    matCrank: mkMat('#1a1a1a', 0.22, 0.88),
    matPedal: mkMat('#0a0a0a', 0.52, 0.12),
    matChainring: mkMat('#0a0a0a', 0.18, 0.92),
    matChain: mkMat('#0a0a0a', 0.25, 0.90),
    matGrip: mkMat(p.gripColor, 0.94, 0.00),
    matBrake: mkMat('#0a0a0a', 0.42, 0.38),
    matAccent: mkMat(p.accentColor, 0.12, 0.38),
  };
}

/** Create materials, reusing cached instances and updating colors in-place. */
export function createMaterials(p: BikeParams) {
  if (!_cached) {
    _cached = createRaw(p);
    return _cached;
  }
  _cached.frameMat.color.set(p.frameColor);
  _cached.matTire.color.set(p.tireColor);
  _cached.matRim.color.set(p.rimColor);
  _cached.matSaddle.color.set(p.saddleColor);
  _cached.matSaddleNose.color.set(p.saddleColor);
  _cached.matGrip.color.set(p.gripColor);
  _cached.matAccent.color.set(p.accentColor);
  _cached.matRimInner.color.set(p.accentColor);
  return _cached;
}

export type Materials = ReturnType<typeof createMaterials>;
