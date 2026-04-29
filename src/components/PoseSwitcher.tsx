import { useBikeStore, type Pose } from '@/store/useBikeStore';

const poses: { key: Pose; label: string }[] = [
  { key: 'seated', label: '坐姿骑行' },
  { key: 'sprint', label: '冲刺姿态' },
  { key: 'climbing', label: '站立爬坡' },
  { key: 'aero', label: '低风阻姿态' },
];

export function PoseSwitcher() {
  const pose = useBikeStore((s) => s.pose);
  const setPose = useBikeStore((s) => s.setPose);

  return (
    <div className="flex gap-1 rounded-[22px] bg-black/5 p-1">
      {poses.map((p) => {
        const active = pose === p.key;
        return (
          <button
            key={p.key}
            onClick={() => setPose(p.key)}
            className={`rounded-[18px] px-4 py-1.5 text-sm transition-all ${
              active
                ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                : 'font-normal text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
