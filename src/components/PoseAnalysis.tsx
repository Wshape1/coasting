import { useMemo } from 'react';
import { useBikeStore } from '@/store/useBikeStore';
import { BikeGeometrySolver } from '@/core/BikeGeometrySolver';
import { calculatePoseAnalysis, type PoseType } from '@/lib/poseAnalysis';

const poseLabels: Record<PoseType, string> = {
  seated: '坐姿骑行',
  sprint: '冲刺姿态',
  climbing: '站立爬坡',
  aero: '低风阻姿态',
};

export function PoseAnalysis() {
  const pose = useBikeStore((s) => s.pose);
  const height = useBikeStore((s) => s.height);
  const weight = useBikeStore((s) => s.weight);
  const inseam = useBikeStore((s) => s.inseam);
  const armSpan = useBikeStore((s) => s.armSpan);
  const shoulderWidth = useBikeStore((s) => s.shoulderWidth);
  const currentParams = useBikeStore((s) => s.currentParams);

  const analysis = useMemo(() => {
    const solver = new BikeGeometrySolver(currentParams);
    const { derived } = solver.solve();

    return calculatePoseAnalysis(
      currentParams,
      { height, weight, inseam, armSpan, shoulderWidth },
      pose,
      derived
    );
  }, [pose, height, weight, inseam, armSpan, shoulderWidth, currentParams]);

  const circumference = 2 * Math.PI * 32;
  const offset = circumference * (1 - analysis.overallScore / 100);

  return (
    <div className="space-y-2.5 rounded-2xl bg-white/70 p-3.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-foreground">姿态分析</h3>

      {/* 主要评分环 */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="32" fill="none" stroke="hsl(0 0% 0% / 0.06)" strokeWidth="5" />
            <circle
              cx="36" cy="36" r="32" fill="none"
              stroke="hsl(38 70% 55%)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-foreground">{analysis.overallScore}%</span>
            <span className="text-[10px] text-muted-foreground">匹配度</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {poseLabels[pose]}匹配度
          </p>
          <p className="text-xs text-muted-foreground">
            {analysis.poseDescription}
          </p>
        </div>
      </div>

      {/* 详细数据 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-background/50 p-2">
          <p className="text-[10px] text-muted-foreground">躯干角度</p>
          <p className="text-sm font-semibold">{analysis.torsoAngle}°</p>
        </div>
        <div className="rounded-lg bg-background/50 p-2">
          <p className="text-[10px] text-muted-foreground">膝关节</p>
          <p className="text-sm font-semibold">{analysis.kneeFlexion}°</p>
        </div>
        <div className="rounded-lg bg-background/50 p-2">
          <p className="text-[10px] text-muted-foreground">髋关节</p>
          <p className="text-sm font-semibold">{analysis.hipAngle}°</p>
        </div>
      </div>

      {/* 计算方法提示 */}
      <p className="text-[10px] text-muted-foreground text-center">
        坐垫高度计算：{analysis.saddleHeightMethod}
      </p>

      {/* 评分行 */}
      <div className="space-y-1.5">
        <ScoreBar label="坐垫高度" score={analysis.saddleHeightFit} />
        <ScoreBar label="前伸量" score={analysis.reachFit} />
        <ScoreBar label="堆高" score={analysis.stackFit} />
        <ScoreBar label="功率效率" score={analysis.powerEfficiency} />
        <ScoreBar label="舒适度" score={analysis.comfortScore} />
        <ScoreBar label="气动性" score={analysis.aeroScore} />
        <ScoreBar label="柔韧性" score={100 - analysis.flexibilityDemand} hint="需求越低越好" />
      </div>

      {/* 问题提示 */}
      {analysis.issues.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-600">注意事项</p>
          {analysis.issues.map((issue, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">• {issue}</p>
          ))}
        </div>
      )}

      {/* 建议 */}
      {analysis.recommendations.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary">建议</p>
          {analysis.recommendations.map((rec, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">• {rec}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score, hint }: { label: string; score: number; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[11px] text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? 'hsl(142 71% 45%)' : score >= 60 ? 'hsl(38 70% 55%)' : 'hsl(0 84% 60%)',
          }}
        />
      </div>
      <span className="w-8 text-right text-[11px] font-medium">{score}</span>
      {hint && <span className="text-[9px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
