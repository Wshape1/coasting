import { useState, useCallback } from 'react';
import { useBikeStore, type Pose, /* type Scene, */ type PresetKey } from '@/store/useBikeStore';
import { BikeCanvas } from './BikeCanvas';

// const sceneLabels: Record<Scene, string> = {
//   city: '城市 City',
//   mountain: '山地 MTB Park',
//   seaside: '海边 Seaside',
// };

const poseLabels: Record<Pose, string> = {
  seated: '坐姿骑行',
  sprint: '冲刺姿态',
  climbing: '站立爬坡',
  aero: '低风阻姿态',
};

const bikeSizeLabels: Record<PresetKey, string> = {
  road: 'S 码',
  mountain: 'M 码',
  commuter: 'S 码',
};

export function Viewport() {
  const pose = useBikeStore((s) => s.pose);
  // const scene = useBikeStore((s) => s.scene);
  const presetKey = useBikeStore((s) => s.presetKey);
  const isAnimating = useBikeStore((s) => s.isAnimating);
  const showHuman = useBikeStore((s) => s.showHuman);
  const showDebug = useBikeStore((s) => s.showDebug);
  const toggleAnimation = useBikeStore((s) => s.toggleAnimation);
  const toggleHuman = useBikeStore((s) => s.toggleHuman);
  const toggleDebug = useBikeStore((s) => s.toggleDebug);
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
            className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md transition-colors cursor-pointer ${
              isAnimating
                ? 'bg-emerald-500/80 text-white'
                : 'bg-white/60 text-foreground shadow-lg ring-1 ring-black/5'
            }`}
          >
            {isAnimating ? (
              <svg width="12" height="12" viewBox="0 0 10 10"><rect x="0" y="0" width="3.5" height="10" rx="1" fill="currentColor"/><rect x="6.5" y="0" width="3.5" height="10" rx="1" fill="currentColor"/></svg>
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
          <button
            onClick={toggleDebug}
            title={showDebug ? '隐藏 Debug' : '显示 Debug'}
            className={`flex h-9 items-center justify-center rounded-xl backdrop-blur-md transition-colors cursor-pointer px-3 text-xs font-mono ${
              showDebug
                ? 'bg-amber-400/80 text-amber-900'
                : 'bg-white/60 text-muted-foreground shadow-lg ring-1 ring-black/5'
            }`}
          >
            {showDebug ? 'DBG' : 'DBG'}
          </button>
          <div className="pointer-events-none rounded-xl bg-white/60 px-3.5 py-2.5 text-xs font-medium text-foreground backdrop-blur-md">
            当前姿态：{poseLabels[pose]} | 推荐车架：{bikeSizeLabels[presetKey]}
          </div>
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
