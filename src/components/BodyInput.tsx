import { useBikeStore } from '@/store/useBikeStore';

interface InputRowProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}

function InputRow({ id, label, value, unit, onChange }: InputRowProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="shadow-sm flex h-11 items-center gap-2 rounded-xl bg-card px-3.5">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-0 flex-1 bg-transparent text-sm text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export function BodyInput() {
  const { height, weight, inseam, setMeasurements } = useBikeStore();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">人体数据</h3>
      <InputRow
        id="body-height"
        label="身高"
        value={height}
        unit="cm"
        onChange={(v) => setMeasurements(v, weight, inseam)}
      />
      <InputRow
        id="body-weight"
        label="体重"
        value={weight}
        unit="kg"
        onChange={(v) => setMeasurements(height, v, inseam)}
      />
      <InputRow
        id="body-inseam"
        label="跨高"
        value={inseam}
        unit="cm"
        onChange={(v) => setMeasurements(height, weight, v)}
      />
    </div>
  );
}
