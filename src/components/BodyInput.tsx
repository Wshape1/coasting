import { useBikeStore } from '@/store/useBikeStore';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
      {children}
    </h4>
  );
}

interface SliderRowProps {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}

function SliderRow({ name, value, unit, min, max, step, onChange, fmt }: SliderRowProps) {
  const display = fmt ? fmt(value) : (Number.isInteger(value) ? String(value) : value.toFixed(2));
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-bold text-primary tabular-nums min-w-[48px] text-right">
          {display}
          <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 mt-0.5 appearance-none bg-black/10 rounded-full outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function BodyInput() {
  const height = useBikeStore((s) => s.height);
  const weight = useBikeStore((s) => s.weight);
  const inseam = useBikeStore((s) => s.inseam);
  const armSpan = useBikeStore((s) => s.armSpan);
  const shoulderWidth = useBikeStore((s) => s.shoulderWidth);
  const legScale = useBikeStore((s) => s.legScale);
  const torsoScl = useBikeStore((s) => s.torsoScl);
  const setBodyDims = useBikeStore((s) => s.setBodyDims);
  const setArmSpan = useBikeStore((s) => s.setArmSpan);
  const setShoulderWidth = useBikeStore((s) => s.setShoulderWidth);
  const setLegScale = useBikeStore((s) => s.setLegScale);
  const setTorsoScl = useBikeStore((s) => s.setTorsoScl);

  return (
    <div className="space-y-2">
      <SectionTitle>身体尺寸 Body</SectionTitle>
      <SliderRow name="身高 Height" value={height} unit="cm" min={140} max={210} step={1}
        onChange={(v) => setBodyDims(v, weight, inseam, armSpan, shoulderWidth)} />
      <SliderRow name="体重 Weight" value={weight} unit="kg" min={40} max={150} step={1}
        onChange={(v) => setBodyDims(height, v, inseam, armSpan, shoulderWidth)} />
      <SliderRow name="跨高 Inseam" value={inseam} unit="cm" min={55} max={130} step={1}
        onChange={(v) => setBodyDims(height, weight, v, armSpan, shoulderWidth)} />
      <SliderRow name="臂展 Arm Span" value={armSpan} unit="cm" min={Math.max(100, height - 20)} max={height + 20} step={1}
        onChange={setArmSpan} />
      <SliderRow name="肩宽 Shoulder" value={shoulderWidth} unit="cm" min={30} max={55} step={1}
        onChange={setShoulderWidth} />
      <div className="mt-3" />
      <SectionTitle>肢体比例 Proportions</SectionTitle>
      <SliderRow name="腿长 Legs" value={legScale} unit="" min={0.400} max={0.618} step={0.001}
        onChange={setLegScale} fmt={(v) => v.toFixed(3)} />
      <SliderRow name="躯干 Torso" value={torsoScl} unit="" min={0.382} max={0.600} step={0.001}
        onChange={setTorsoScl} fmt={(v) => v.toFixed(3)} />
    </div>
  );
}
