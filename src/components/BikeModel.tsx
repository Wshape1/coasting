import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBikeStore } from '@/store/useBikeStore';
import { BikeGeometrySolver } from '@/core/BikeGeometrySolver';
import { createMaterials } from '@/lib/materials';
import { GEO_PARAM_KEYS, PRESETS } from '@/config/presets';
import { BikeMesh } from './BikeMesh';
import type { FramePoints, DerivedData, BikeParams } from '@/types/bike';

const GEOMETRY_THROTTLE_MS = 120;
const INITIAL = PRESETS.road;

function geoKey(p: BikeParams): string {
  let k = '';
  const r = p as unknown as Record<string, unknown>;
  for (const key of GEO_PARAM_KEYS) k += r[key] + ',';
  return k;
}

export function BikeModel() {
  const groupRef = useRef<THREE.Group>(null);
  const crankRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Group>(null);

  const init = (() => {
    const s = new BikeGeometrySolver(INITIAL);
    return s.solve();
  })();

  const [pts, setPts] = useState<FramePoints>(init.pts);
  const [derived, setDerived] = useState<DerivedData>(init.derived);
  const [mats] = useState(() => createMaterials(INITIAL));
  const [barStyle, setBarStyle] = useState<'drop' | 'flat'>(INITIAL.barStyle);
  const [tireWidth, setTireWidth] = useState(INITIAL.tireWidth);
  const [crankLength, setCrankLength] = useState(INITIAL.crankLength);
  const [handlebarWidth, setHandlebarWidth] = useState(INITIAL.handlebarWidth);
  const [isMTB, setIsMTB] = useState(INITIAL.headTubeAngle < 69);

  const lastGeoKey = useRef(geoKey(INITIAL));
  const lastGeoUpdateTime = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);

    // Lerp current params toward target (runs every frame)
    useBikeStore.getState().lerpToTarget(0.18);

    const store = useBikeStore.getState();

    // Update material colors every frame (cheap in-place mutation)
    createMaterials(store.currentParams);

    // Animate crank + wheels via direct ref mutation
    if (store.isAnimating) {
      const newAngle = store.tickAnimation(dt, 80);
      if (crankRef.current) crankRef.current.rotation.z = -newAngle;
      const wr = -newAngle * 2.5;
      if (rearWheelRef.current) rearWheelRef.current.rotation.z = wr;
      if (frontWheelRef.current) frontWheelRef.current.rotation.z = wr;
    }

    // Throttle geometry rebuilds to avoid overwhelming the GPU
    const now = performance.now();
    if (now - lastGeoUpdateTime.current < GEOMETRY_THROTTLE_MS) return;
    lastGeoUpdateTime.current = now;

    const gk = geoKey(store.currentParams);
    if (gk !== lastGeoKey.current) {
      lastGeoKey.current = gk;
      const solver = new BikeGeometrySolver(store.currentParams);
      const result = solver.solve();
      setPts(result.pts);
      setDerived(result.derived);
      setBarStyle(store.currentParams.barStyle);
      setTireWidth(store.currentParams.tireWidth);
      setCrankLength(store.currentParams.crankLength);
      setHandlebarWidth(store.currentParams.handlebarWidth);
      setIsMTB(store.currentParams.headTubeAngle < 69);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Forward = World +Z, right = -X (local X rotated -π/2 around Y) */}
      <BikeMesh
        pts={pts}
        derived={derived}
        mats={mats}
        barStyle={barStyle}
        tireWidth={tireWidth}
        crankLength={crankLength}
        handlebarWidth={handlebarWidth}
        isMTB={isMTB}
        crankRef={crankRef}
        rearWheelRef={rearWheelRef}
        frontWheelRef={frontWheelRef}
      />
    </group>
  );
}
