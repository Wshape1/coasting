import { useMemo } from 'react';
import { useBikeStore } from '@/store/useBikeStore';
import { GEO_PARAM_KEYS } from '@/config/presets';
import { BikeGeometrySolver } from '@/core/BikeGeometrySolver';
import type { DerivedData } from '@/types/bike';

let _cachedDerived: DerivedData | null = null;
let _cachedGeoKey = '';

function geoKey(currentParams: unknown): string {
  let k = '';
  const p = currentParams as Record<string, unknown>;
  for (const key of GEO_PARAM_KEYS) k += p[key] + ',';
  return k;
}

export function DerivedPanel() {
  const currentParams = useBikeStore((s) => s.currentParams);

  const derived = useMemo(() => {
    const gk = geoKey(currentParams);
    if (gk !== _cachedGeoKey || !_cachedDerived) {
      _cachedGeoKey = gk;
      const solver = new BikeGeometrySolver(currentParams);
      _cachedDerived = solver.solve().derived;
    }
    return _cachedDerived;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParams]);

  const fmt = (v: number) => (v * 1000).toFixed(0) + ' mm';

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Stack 堆高</span>
        <span className="font-bold text-primary">{fmt(derived.stack)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Reach 前伸</span>
        <span className="font-bold text-primary">{fmt(derived.reach)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">轴距 WB</span>
        <span className="font-bold text-primary">{fmt(derived.wheelbase)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Trail 轨迹</span>
        <span className="font-bold text-[#6cb4ee]">{fmt(derived.trail)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">后上叉</span>
        <span className="font-bold text-primary">{fmt(derived.stayLen)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">前叉长</span>
        <span className="font-bold text-primary">{fmt(derived.forkLen)}</span>
      </div>
    </div>
  );
}
