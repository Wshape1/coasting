import { useBikeStore } from '@/store/useBikeStore';

const matchScores: Record<string, number> = {
  seated: 89,
  sprint: 76,
  climbing: 82,
  aero: 71,
};

const poseMessages: Record<string, string> = {
  seated: '基于你的身体数据\n骑行效率评分：优秀',
  sprint: '高功率输出姿态\n核心力量要求较高',
  climbing: '适合爬坡路段\n建议调整座垫高度',
  aero: '低风阻姿态\n需要灵活度训练',
};

export function PoseAnalysis() {
  const pose = useBikeStore((s) => s.pose);

  const score = matchScores[pose] ?? 75;
  const message = poseMessages[pose] ?? '身体数据匹配中';

  const circumference = 2 * Math.PI * 32; // r=32
  const offset = circumference * (1 - score / 100);

  return (
    <div className="space-y-2.5 rounded-2xl bg-white/70 p-3.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-foreground">姿态分析</h3>
      <div className="flex items-center gap-3">
        {/* Ring */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="32"
              fill="none"
              stroke="hsl(0 0% 0% / 0.06)"
              strokeWidth="5"
            />
            <circle
              cx="36"
              cy="36"
              r="32"
              fill="none"
              stroke="hsl(38 70% 55%)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-foreground">{score}%</span>
            <span className="text-[10px] text-muted-foreground">匹配度</span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            冲刺姿态匹配度
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
