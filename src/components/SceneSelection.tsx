import { useBikeStore, type Scene } from '@/store/useBikeStore';

const scenes: { key: Scene; icon: string; label: string }[] = [
  { key: 'city', icon: '🌆', label: '城市' },
  { key: 'mountain', icon: '⛰️', label: '山地' },
  { key: 'seaside', icon: '🌊', label: '海边' },
];

export function SceneSelection() {
  const scene = useBikeStore((s) => s.scene);
  const setScene = useBikeStore((s) => s.setScene);

  return (
    <div className="space-y-2.5">
      <h3 className="text-lg font-semibold text-foreground">场景选择</h3>
      <div className="flex gap-2">
        {scenes.map((s) => {
          const active = scene === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setScene(s.key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-4 text-center transition-all ${
                active
                  ? 'shadow-md bg-card ring-1 ring-primary/30'
                  : 'shadow-md bg-card hover:bg-card/80'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{s.icon}</span>
              <span
                className={`text-xs ${
                  active
                    ? 'font-medium text-foreground'
                    : 'font-normal text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
