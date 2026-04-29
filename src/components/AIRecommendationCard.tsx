import { useQuery } from '@tanstack/react-query';
import { useBikeStore } from '@/store/useBikeStore';

interface AIRecommendation {
  size: string;
  stack: number;
  reach: number;
  analysis: string;
}

const fallbackData: Record<string, AIRecommendation> = {
  seated: {
    size: '公路车 S 码',
    stack: 54,
    reach: 38,
    analysis: '适合休闲骑行，身体角度舒适。',
  },
  sprint: {
    size: '公路车 S 码 · 54cm',
    stack: 52,
    reach: 40,
    analysis: '适合高功率输出骑行风格，建议选择竞技几何车架。',
  },
  climbing: {
    size: '公路车 M 码',
    stack: 56,
    reach: 37,
    analysis: '爬坡姿态需要更高车头，建议选大一码。',
  },
  aero: {
    size: '公路车 S 码 · 低风阻',
    stack: 50,
    reach: 42,
    analysis: '低风阻姿态需要更激进几何，建议选专业气动车架。',
  },
};

export function AIRecommendationCard() {
  const { height, inseam, weight, bikeType, pose } = useBikeStore();

  const { data, isLoading, error } = useQuery<AIRecommendation>({
    queryKey: ['aiRecommendation', { height, inseam, weight, bikeType, pose }],
    queryFn: async () => {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height, inseam, weight, bikeType, pose }),
      });
      if (!res.ok) throw new Error('Failed to fetch recommendation');
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });

  const fallback = fallbackData[pose] ?? fallbackData.seated;
  const displayData = data ?? fallback;

  return (
    <div className="space-y-3 rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
          AI
        </div>
        <span className="text-base font-semibold text-foreground">
          选车建议
        </span>
      </div>

      <div className="h-px bg-black/5" />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">分析中...</p>
      ) : error ? (
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            根据你的{pose === 'seated' ? '坐姿' : pose === 'sprint' ? '冲刺' : pose === 'climbing' ? '爬坡' : '低风阻'}
            姿态和身高 {height}cm{weight ? `，体重 ${weight}kg` : ''}，推荐 {displayData!.size}
            ，适合{pose === 'sprint' ? '高功率输出' : '你当前'}骑行风格。
          </p>
          <div className="mt-2">
            <span className="inline-block rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              推荐：{displayData!.size}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {displayData!.analysis}
          </p>
          <div className="mt-2">
            <span className="inline-block rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              推荐：{displayData!.size}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
