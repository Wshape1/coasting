import { useState, useEffect, useRef } from 'react';
import { useBikeStore } from '@/store/useBikeStore';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
      {children}
    </h4>
  );
}

// ─── BMI Tooltip content (lazy: computed only when visible) ───
function BmiTooltipContent({ bmi }: { bmi: number }) {
  const bmiMin = 15, bmiMax = 35
  const bmiPct = Math.max(0, Math.min(100, ((bmi - bmiMin) / (bmiMax - bmiMin)) * 100))
  const s1 = ((18.5 - bmiMin) / (bmiMax - bmiMin)) * 100
  const s2 = ((24 - bmiMin) / (bmiMax - bmiMin)) * 100
  const s3 = ((28 - bmiMin) / (bmiMax - bmiMin)) * 100
  const bmiColor = bmi < 18.5 ? '#5b9bd5' : bmi < 24 ? '#4caf50' : bmi < 28 ? '#f0a500' : '#e94560'

  return (
    <div className="rounded-xl bg-white/95 px-3 py-2.5 shadow-xl ring-1 ring-black/10 backdrop-blur-xl">
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
        <span>偏瘦</span><span>正常</span><span>偏重</span><span>肥胖</span>
      </div>
      <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-black/8">
        <div className="absolute inset-y-0 rounded-full overflow-hidden flex w-full">
          <div className="h-full bg-[#5b9bd5]" style={{ width: `${s1}%` }} />
          <div className="h-full bg-[#4caf50]" style={{ width: `${s2 - s1}%` }} />
          <div className="h-full bg-[#f0a500]" style={{ width: `${s3 - s2}%` }} />
          <div className="h-full bg-[#e94560]" style={{ width: `${100 - s3}%` }} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-md"
          style={{ left: `${bmiPct}%`, background: bmiColor }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-0.5">
        <span>15</span><span>18.5</span><span>24</span><span>28</span><span>35</span>
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-black/5 text-[10px] text-muted-foreground leading-relaxed">
        中国成人标准：偏瘦&lt;18.5 · 正常18.5-23.9 · 偏重24-27.9 · 肥胖≥28
      </div>
    </div>
  );
}

const D = { upperLeg: 42, lowerLeg: 40, lowTorso: 23, upTorso: 27, upperArm: 30, lowerArm: 26, headR: 10 }

export function HumanDerivedPanel() {
  const height = useBikeStore((s) => s.height);
  const weight = useBikeStore((s) => s.weight);
  const inseam = useBikeStore((s) => s.inseam);
  const armScale = useBikeStore((s) => s.armScale);
  const legScale = useBikeStore((s) => s.legScale);
  const torsoScl = useBikeStore((s) => s.torsoScl);
  const resetHumanMeasurements = useBikeStore((s) => s.resetHumanMeasurements);
  const hScl = height / 170;
  const iScl = inseam / 80;

  const bmi = weight / ((height / 100) * (height / 100))
  const widthScl = Math.sqrt(weight / (22.5 * (height / 100) * (height / 100)))

  const items = [
    { label: '身形宽', value: widthScl.toFixed(2) },
    { label: '上臂长', value: `${(D.upperArm * armScale * hScl).toFixed(0)} cm` },
    { label: '前臂长', value: `${(D.lowerArm * armScale * hScl).toFixed(0)} cm` },
    { label: '大腿长', value: `${(D.upperLeg * iScl * legScale * hScl).toFixed(0)} cm` },
    { label: '小腿长', value: `${(D.lowerLeg * iScl * legScale * hScl).toFixed(0)} cm` },
    { label: '躯干长', value: `${((D.lowTorso + D.upTorso) * torsoScl * hScl).toFixed(0)} cm` },
  ]

  const bmiLabel = bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏重' : '肥胖'
  const bmiColor = bmi < 18.5 ? '#5b9bd5' : bmi < 24 ? '#4caf50' : bmi < 28 ? '#f0a500' : '#e94560'

  const [showBmiTip, setShowBmiTip] = useState(false)
  const bmiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showBmiTip) return
    const onDown = (e: MouseEvent) => {
      if (bmiRef.current && !bmiRef.current.contains(e.target as Node)) setShowBmiTip(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showBmiTip])

  return (
    <div>
      <SectionTitle>衍生数据 Derived</SectionTitle>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold text-primary">{value}</span>
          </div>
        ))}
      </div>

      {/* BMI row */}
      <div ref={bmiRef} className="relative mt-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            BMI
            <button
              className="w-3.5 h-3.5 rounded-full bg-black/8 text-[8px] font-bold text-muted-foreground hover:bg-black/15 hover:text-foreground transition-colors inline-flex items-center justify-center leading-none"
              onClick={(e) => { e.stopPropagation(); setShowBmiTip(!showBmiTip) }}
              title="BMI 指标说明"
            >?</button>
          </span>
          <span className="font-bold tabular-nums" style={{ color: bmiColor }}>
            {bmi.toFixed(1)}
            <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">{bmiLabel}</span>
          </span>
        </div>

        {showBmiTip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 z-50">
            <BmiTooltipContent bmi={bmi} />
          </div>
        )}
      </div>

      {/* Reset button */}
      <button
        onClick={resetHumanMeasurements}
        className="mt-3 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-black/20 transition-colors"
      >
        重置身体数据
      </button>
    </div>
  );
}
