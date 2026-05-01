import { useBikeStore, type PresetKey } from '@/store/useBikeStore';

const bikeData: Record<PresetKey, { frame: string; weight: string; gears: string }> = {
  road: { frame: '碳纤维', weight: '7.2 kg', gears: 'Shimano Ultegra · 22速' },
  mountain: { frame: '铝合金碳纤', weight: '12.5 kg', gears: 'Shimano Deore XT · 27速' },
  commuter: { frame: '铝合金', weight: '10.8 kg', gears: 'Shimano Nexus 内7速' },
};

export function DataPanel() {
  const presetKey = useBikeStore((s) => s.presetKey);
  const data = bikeData[presetKey]!;

  return (
    <div className="space-y-3.5 rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-foreground">自行车数据</h3>
      <div className="h-px bg-black/5" />
      <div className="space-y-3">
        {[
          { label: '车架', value: data.frame },
          { label: '重量', value: data.weight },
          { label: '变速器', value: data.gears },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className="ml-auto text-right text-sm font-semibold text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
