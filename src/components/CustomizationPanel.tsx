import { useBikeStore } from '@/store/useBikeStore';
import { COLOR_DEFS } from '@/config/presets';
import { BikeSelection } from './BikeSelection';
// import { SceneSelection } from './SceneSelection';
import { ParamSliders } from './ParamSliders';
import { DerivedPanel } from './DerivedPanel';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
      {children}
    </h4>
  );
}

export function CustomizationPanel() {
  const targetParams = useBikeStore((s) => s.targetParams);
  const setColor = useBikeStore((s) => s.setColor);
  const isAnimating = useBikeStore((s) => s.isAnimating);
  const toggleAnimation = useBikeStore((s) => s.toggleAnimation);
  const resetParams = useBikeStore((s) => s.resetParams);

  return (
    <div className="flex flex-col gap-4">
      {/* 车型选择 */}
      <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl flex flex-col gap-4">
        <BikeSelection />
        {/* <div className="h-px bg-black/5" />
        <SceneSelection /> */}
      </div>

      {/* 外观定制 */}
      <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
        <SectionTitle>外观定制 Appearance</SectionTitle>
        <div className="space-y-1.5">
          {COLOR_DEFS.map((def) => (
            <div key={def.key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{def.label}</span>
              <input
                type="color"
                value={(targetParams as unknown as Record<string, unknown>)[def.key] as string}
                onChange={(e) => setColor(def.key, e.target.value)}
                className="w-7 h-5 border-2 border-black/10 rounded cursor-pointer bg-transparent
                  [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 车架几何 */}
      <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
        <SectionTitle>车架几何 Frame Geometry</SectionTitle>
        <ParamSliders />
      </div>

      {/* 衍生数据 */}
      <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
        <SectionTitle>衍生数据 Derived</SectionTitle>
        <DerivedPanel />
        <div className="flex gap-2 mt-3">
          <button
            onClick={toggleAnimation}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              isAnimating
                ? 'bg-emerald-500 text-white'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isAnimating ? '暂停动画' : '骑行动画'}
          </button>
          <button
            onClick={resetParams}
            className="flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-black/20 transition-colors"
          >
            重置参数
          </button>
        </div>
      </div>
    </div>
  );
}
