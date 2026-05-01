import { useBikeStore, type PresetKey } from '@/store/useBikeStore';

const bikes: { key: PresetKey; label: string; en: string; desc: string }[] = [
  { key: 'mountain', label: '山地车', en: 'MTB', desc: '越野全地形 · 29寸' },
  { key: 'road', label: '公路车', en: 'Road', desc: '竞速公路 · 700c' },
  { key: 'commuter', label: '城市车', en: 'City', desc: '通勤休闲 · 700c' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2.5">
      {children}
    </h4>
  );
}

export function BikeSelection() {
  const presetKey = useBikeStore((s) => s.presetKey);
  const setPresetKey = useBikeStore((s) => s.setPresetKey);

  return (
    <div>
      <SectionTitle>车型选择 Bike Type</SectionTitle>
      <div className="flex gap-2">
        {bikes.map((b) => {
          const active = presetKey === b.key;
          return (
            <button
              key={b.key}
              onClick={() => setPresetKey(b.key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-center transition-all ${
                active
                  ? 'shadow-sm bg-primary/10 ring-1 ring-primary/30'
                  : 'hover:bg-muted/50'
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {b.label}
              </span>
              <span className="text-[10px] text-muted-foreground/60">{b.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
