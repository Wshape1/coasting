import { useBikeStore } from '@/store/useBikeStore';
import { PARAM_DEFS } from '@/config/presets';

let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

function showTooltip(text: string, e: React.MouseEvent) {
  const el = document.getElementById('tooltip');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.left = e.clientX + 14 + 'px';
  el.style.top = e.clientY - 10 + 'px';
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => el.classList.add('hidden'), 2800);
}

function moveTooltip(e: React.MouseEvent) {
  const el = document.getElementById('tooltip');
  if (!el) return;
  el.style.left = e.clientX + 14 + 'px';
  el.style.top = e.clientY - 10 + 'px';
}

function hideTooltip() {
  const el = document.getElementById('tooltip');
  if (!el) return;
  el.classList.add('hidden');
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
}

export function ParamSliders() {
  const targetParams = useBikeStore((s) => s.targetParams);
  const setParam = useBikeStore((s) => s.setParam);

  return (
    <div className="space-y-2">
      {PARAM_DEFS.map((def) => {
        const value = (targetParams as unknown as Record<string, unknown>)[def.key] as number;
        return (
          <div key={def.key}>
            <div
              className="flex items-baseline justify-between text-xs cursor-help"
              onMouseEnter={def.tip ? (e) => showTooltip(def.tip, e) : undefined}
              onMouseMove={def.tip ? moveTooltip : undefined}
              onMouseLeave={def.tip ? hideTooltip : undefined}
            >
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                {def.name}
              </span>
              <span className="font-bold text-primary tabular-nums min-w-[52px] text-right">
                {Number.isInteger(value) ? value : value.toFixed(1)}
                <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">
                  {def.unit}
                </span>
              </span>
            </div>
            <input
              type="range"
              min={def.min}
              max={def.max}
              step={def.step}
              value={value}
              onChange={(e) => setParam(def.key, parseFloat(e.target.value))}
              className="w-full h-1 mt-0.5 appearance-none bg-black/10 rounded-full outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        );
      })}
    </div>
  );
}
