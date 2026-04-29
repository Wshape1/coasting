import { useBikeStore, type BikeType, type Pose } from '@/store/useBikeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, X } from 'lucide-react';
import { AIRecommendationCard } from './AIRecommendationCard';

function MeasurementSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => v !== undefined && onChange(v)}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function ControlsContent() {
  const { height, inseam, weight, bikeType, pose, setMeasurements, setBikeType, setPose } =
    useBikeStore();

  return (
    <div className="space-y-6">
      {/* Headers */}
      <div>
        <h2 className="text-fluid-lg font-semibold">Body Measurements</h2>
        <p className="text-fluid-sm text-muted-foreground">
          Adjust to find your ideal bike fit
        </p>
      </div>

      {/* Measurement sliders */}
      <div className="space-y-4">
        <MeasurementSlider
          label="Height"
          value={height}
          min={150}
          max={200}
          unit="cm"
          onChange={(v) => setMeasurements(v, weight, inseam)}
        />
        <MeasurementSlider
          label="Inseam"
          value={inseam}
          min={65}
          max={95}
          unit="cm"
          onChange={(v) => setMeasurements(height, v, inseam)}
        />
        <MeasurementSlider
          label="Weight"
          value={weight}
          min={40}
          max={120}
          unit="kg"
          onChange={(v) => setMeasurements(height, v, inseam)}
        />
      </div>

      {/* Bike type selector */}
      <div className="space-y-2">
        <Label>Bike Type</Label>
        <Select
          value={bikeType}
          onValueChange={(v: BikeType) => setBikeType(v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="road">Road</SelectItem>
            <SelectItem value="mountain">Mountain</SelectItem>
            <SelectItem value="urban">Urban</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pose selector */}
      <div className="space-y-2">
        <Label>Pose</Label>
        <Select value={pose} onValueChange={(v: Pose) => setPose(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seated">Seated</SelectItem>
            <SelectItem value="sprint">Sprint</SelectItem>
            <SelectItem value="climbing">Climbing</SelectItem>
            <SelectItem value="aero">Aero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Recommendation */}
      <AIRecommendationCard />
    </div>
  );
}

export function ControlsPanel() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <aside
        className="flex h-full flex-col overflow-y-auto border-r bg-background p-6 container controls-panel"
        style={{ width: 'clamp(300px, 30vw, 420px)' }}
      >
        <ControlsContent />
      </aside>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Coasting Controls</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <ControlsContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
