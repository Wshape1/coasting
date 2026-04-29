import { useBikeStore, type BikeType } from '@/store/useBikeStore';

const bikes: { key: BikeType; icon: string; name: string; desc: string }[] = [
  { key: 'mountain', icon: '🚵', name: '山地车', desc: '越野全地形 | 27速' },
  { key: 'road', icon: '🚴', name: '公路车', desc: '竞速公路 | 22速' },
  { key: 'urban', icon: '🚲', name: '城市车', desc: '通勤休闲 | 内7速' },
];

export function BikeSelection() {
  const bikeType = useBikeStore((s) => s.bikeType);
  const setBikeType = useBikeStore((s) => s.setBikeType);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">选择车型</h3>
      <div className="space-y-2">
        {bikes.map((b) => {
          const active = bikeType === b.key;
          return (
            <button
              key={b.key}
              onClick={() => setBikeType(b.key)}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all ${
                active
                  ? 'shadow-md bg-card ring-1 ring-primary/30'
                  : 'shadow-md bg-card hover:bg-card/80'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                {b.icon}
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-foreground">
                  {b.name}
                </div>
                <div className="text-xs text-muted-foreground">{b.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
