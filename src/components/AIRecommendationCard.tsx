import { useMemo } from 'react';
import { useBikeStore } from '@/store/useBikeStore';
import { BikeGeometrySolver } from '@/core/BikeGeometrySolver';
import { calculatePoseAnalysis } from '@/lib/poseAnalysis';
import { generateBikeRecommendation } from '@/lib/bikeRecommendation';

export function AIRecommendationCard() {
  const { height, inseam, weight, armSpan, shoulderWidth, pose, currentParams } = useBikeStore();

  const recommendation = useMemo(() => {
    const solver = new BikeGeometrySolver(currentParams);
    const { derived } = solver.solve();

    const poseAnalysis = calculatePoseAnalysis(
      currentParams,
      { height, weight, inseam, armSpan, shoulderWidth },
      pose,
      derived
    );

    return generateBikeRecommendation(
      { height, weight, inseam, armSpan, shoulderWidth },
      currentParams,
      pose,
      poseAnalysis
    );
  }, [height, weight, inseam, armSpan, shoulderWidth, currentParams, pose]);

  const poseLabel =
    pose === 'seated' ? '坐姿' : pose === 'sprint' ? '冲刺' : pose === 'climbing' ? '爬坡' : '低风阻';

  return (
    <div className="space-y-3 rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
          AI
        </div>
        <span className="text-base font-semibold text-foreground">
          选车建议
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {poseLabel}模式
        </span>
      </div>

      <div className="h-px bg-black/5" />

      {/* 推荐尺码 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">推荐尺码</p>
          <p className="text-lg font-bold text-foreground">{recommendation.sizeLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">适配度</p>
          <p className={`text-lg font-bold ${
            recommendation.fitScore >= 80 ? 'text-green-600' :
            recommendation.fitScore >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {recommendation.fitScore}%
          </p>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-3 gap-2">
        {recommendation.keyMetrics.slice(0, 3).map((metric, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            <p className={`text-sm font-semibold ${
              metric.status === 'good' ? 'text-green-600' :
              metric.status === 'warning' ? 'text-amber-600' : 'text-foreground'
            }`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* 理想几何 */}
      <div className="rounded-lg bg-background/30 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">理想几何参数</p>
        <div className="flex justify-between text-xs">
          <span>Stack: <b>{recommendation.idealStack}mm</b></span>
          <span>Reach: <b>{recommendation.idealReach}mm</b></span>
          <span>比例: <b>{recommendation.idealStackReachRatio}</b></span>
        </div>
      </div>

      {/* 车架建议 */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary">车架建议</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.frameAdvice}
        </p>
      </div>

      {/* 配件建议 */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary">配件建议</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.componentAdvice}
        </p>
      </div>

      {/* 姿态建议 */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary">姿态建议</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.postureAdvice}
        </p>
      </div>

      {/* 推荐车型 */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary">推荐车型</p>
        <div className="flex flex-wrap gap-1">
          {recommendation.suggestedBikes.map((bike, i) => (
            <span key={i} className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              {bike}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
