import { useBikeStore, type Pose, type Scene } from '@/store/useBikeStore';
import { BikeCanvas } from './BikeCanvas';

const sceneLabels: Record<Scene, string> = {
  city: '🌄 城市场景',
  mountain: '⛰️ 山地场景',
  seaside: '🌊 海边场景',
};

const poseLabels: Record<Pose, string> = {
  seated: '坐姿骑行',
  sprint: '冲刺姿态',
  climbing: '站立爬坡',
  aero: '低风阻姿态',
};

const bikeSizeLabels: Record<string, string> = {
  road: 'S 码',
  mountain: 'M 码',
  urban: 'S 码',
};

export function Viewport() {
  const { pose, scene, bikeType } = useBikeStore();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 3D Canvas area */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#EAE6DE] shadow-lg">
        <BikeCanvas />

        {/* Scene label - top left */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-md">
          {sceneLabels[scene]} · {poseLabels[pose]}
        </div>

        {/* Info bar - bottom center */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-white/60 px-3.5 py-3 text-xs font-medium text-foreground backdrop-blur-md">
          当前姿态：{poseLabels[pose]} | 推荐车架：{bikeSizeLabels[bikeType]}
        </div>

        {/* Rotate button - bottom right */}
        <button className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 text-lg shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-transform hover:scale-105 active:scale-95">
          🔄
        </button>
      </div>
    </div>
  );
}
