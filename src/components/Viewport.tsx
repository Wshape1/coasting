import { useState, useCallback, useRef, useEffect } from 'react';
import { useBikeStore, speedRef } from '@/store/useBikeStore';
import { BikeCanvas } from './BikeCanvas';

const SPEED_STEPS = [0.1, 0.3, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];

export function Viewport() {
  const isAnimating = useBikeStore((s) => s.isAnimating);
  const showHuman = useBikeStore((s) => s.showHuman);
  const toggleAnimation = useBikeStore((s) => s.toggleAnimation);
  const toggleHuman = useBikeStore((s) => s.toggleHuman);
  const setSpeedMultiplier = useBikeStore((s) => s.setSpeedMultiplier);

  // Refs to avoid React re-renders during slider drag
  const storeVal = useBikeStore.getState().speedMultiplier;
  const closestIdx = SPEED_STEPS.reduce((best, v, i) =>
    Math.abs(v - storeVal) < Math.abs(SPEED_STEPS[best]! - storeVal) ? i : best, 0);
  const stepIndexRef = useRef(closestIdx);
  const sliderRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);

  // Sync slider position and speedRef on mount and when animation starts
  useEffect(() => {
    const idx = stepIndexRef.current;
    const v = SPEED_STEPS[idx] ?? 1.0;
    speedRef.current = v;
    if (sliderRef.current) sliderRef.current.value = String(idx);
    if (displayRef.current) displayRef.current.textContent = v.toFixed(1) + 'x';
  }, [isAnimating]);
  const [canvasKey, setCanvasKey] = useState(0);
  const [reloadMinMs, setReloadMinMs] = useState(0);

  const handleReload = useCallback(() => {
    const store = useBikeStore.getState();
    if (store.isAnimating) store.toggleAnimation();
    setReloadMinMs(800);
    setCanvasKey((k) => k + 1);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 3D Canvas area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <BikeCanvas key={canvasKey} minLoadMs={reloadMinMs} />

        {/* Scene label - top left */}
        {/* <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-md">
          {sceneLabels[scene]} · {poseLabels[pose]}
        </div> */}

        {/* Bottom bar: animation button + info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            onClick={toggleAnimation}
            title={isAnimating ? '暂停骑行' : '骑行动画'}
            className={`flex h-9 items-center justify-center rounded-xl backdrop-blur-md cursor-pointer transition-all duration-500 ease-in-out overflow-hidden ${
              isAnimating
                ? 'w-58 bg-primary text-primary-foreground gap-2 px-2'
                : 'w-9 bg-white/60 text-foreground shadow-lg ring-1 ring-black/5'
            }`}
          >
            {isAnimating ? (
              <>
                <svg width="12" height="12" viewBox="0 0 10 10" className="shrink-0"><rect x="0" y="0" width="3.5" height="10" rx="1" fill="currentColor"/><rect x="6.5" y="0" width="3.5" height="10" rx="1" fill="currentColor"/></svg>
                <input
                  ref={sliderRef}
                  type="range"
                  min={0}
                  max={SPEED_STEPS.length - 1}
                  step={1}
                  defaultValue={stepIndexRef.current}
                  onInput={(e) => {
                    const idx = parseInt((e.target as HTMLInputElement).value);
                    stepIndexRef.current = idx;
                    const v = SPEED_STEPS[idx] ?? 1.0;
                    speedRef.current = v;
                    if (displayRef.current) displayRef.current.textContent = v.toFixed(1) + 'x';
                  }}
                  onPointerUp={() => setSpeedMultiplier(SPEED_STEPS[stepIndexRef.current] ?? 1.0)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-1 appearance-none bg-white/25 rounded-full outline-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span ref={displayRef} className="shrink-0 text-[10px] font-mono font-bold tabular-nums w-8 text-right">
                  1.0x
                </span>
              </>
            ) : (
              <svg width="12" height="12" viewBox="0 0 10 10"><polygon points="1,0 10,5 1,10" fill="currentColor"/></svg>
            )}
          </button>
          <button
            onClick={toggleHuman}
            title={showHuman ? '隐藏人物' : '显示人物'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md transition-colors cursor-pointer ${
              showHuman
                ? 'bg-white/60 text-foreground shadow-lg ring-1 ring-black/5'
                : 'bg-foreground/10 text-muted-foreground ring-1 ring-black/10'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              {!showHuman && <line x1="2" y1="2" x2="22" y2="22" />}
            </svg>
          </button>
        </div>

        {/* Reload button - bottom right */}
        <button
          aria-label="重新加载场景 Reload Scene"
          onClick={handleReload}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/80 active:scale-95 cursor-pointer"
          title="重新加载 3D 场景"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
