import { useBikeStore, type Scene } from '@/store/useBikeStore';

const scenes: { key: Scene; label: string; en: string }[] = [
  { key: 'city', label: '城市', en: 'City' },
  { key: 'mountain', label: '山地', en: 'MTB Park' },
  { key: 'seaside', label: '海边', en: 'Seaside' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2.5">
      {children}
    </h4>
  );
}

export function SceneSelection() {
  const scene = useBikeStore((s) => s.scene);
  const setScene = useBikeStore((s) => s.setScene);

  return (
    <div>
      <SectionTitle>场景选择 Scene</SectionTitle>
      <div className="flex gap-2">
        {scenes.map((s) => {
          const active = scene === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setScene(s.key)}
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
                {s.label}
              </span>
              <span className="text-[10px] text-muted-foreground/60">{s.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
