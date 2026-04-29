import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavBar } from '@/components/NavBar';
import { BikeSelection } from '@/components/BikeSelection';
import { SceneSelection } from '@/components/SceneSelection';
import { DataPanel } from '@/components/DataPanel';
import { Viewport } from '@/components/Viewport';
import { PoseSwitcher } from '@/components/PoseSwitcher';
import { BodyInput } from '@/components/BodyInput';
import { PoseAnalysis } from '@/components/PoseAnalysis';
import { AIRecommendationCard } from '@/components/AIRecommendationCard';
import { MobileTabBar } from '@/components/MobileTabBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MobileLayout() {
  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Mobile top bar — floating island */}
      <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
        <NavBar />
      </div>

      {/* Scrollable content — all same sections as desktop */}
      <div className="flex-1 space-y-4 overflow-y-auto px-3 pt-16 pb-28">
        {/* Viewport with overlays */}
        <div className="relative flex h-[220px] overflow-hidden rounded-2xl">
          <Viewport />
        </div>

        {/* Pose switcher */}
        <div className="flex justify-center">
          <PoseSwitcher />
        </div>

        {/* Bike selection */}
        <BikeSelection />

        {/* Scene selection */}
        <SceneSelection />

        {/* Data panel */}
        <DataPanel />

        {/* Body data */}
        <BodyInput />

        {/* Pose analysis */}
        <PoseAnalysis />

        {/* AI recommendation */}
        <AIRecommendationCard />
      </div>

      {/* Bottom tab bar — floating island */}
      <MobileTabBar />
    </div>
  );
}

function TabletLayout() {
  return (
    <div className="flex h-dvh flex-col bg-background p-4">
      <NavBar />
      <div className="mt-4 flex flex-1 gap-4 overflow-hidden">
        {/* Left: Viewport + PoseSwitcher */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-4">
          <Viewport />
          <div className="flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* Right panel - scrollable */}
        <div className="flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto pb-2">
          <BikeSelection />
          <SceneSelection />
          <DataPanel />
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <BodyInput />
          </div>
          <PoseAnalysis />
          <AIRecommendationCard />
        </div>
      </div>
    </div>
  );
}

function DesktopLayout() {
  return (
    <div className="flex h-dvh flex-col bg-background p-4">
      <NavBar />
      <div className="mt-4 flex flex-1 gap-6 overflow-hidden">
        {/* Left column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-5 overflow-y-auto pb-2">
          <BikeSelection />
          <SceneSelection />
          <DataPanel />
        </div>

        {/* Center column */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6">
          <Viewport />
          <div className="flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto pb-2">
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <BodyInput />
          </div>
          <PoseAnalysis />
          <AIRecommendationCard />
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  if (isDesktop) return <DesktopLayout />;
  if (isTablet) return <TabletLayout />;
  return <MobileLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}
