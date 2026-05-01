import { useState } from 'react';
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
import { MobileTabBar, type TabKey } from '@/components/MobileTabBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>('姿态模拟');

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Mobile top bar — floating island */}
      <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
        <NavBar />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-3 pt-16 pb-20">
        {/* 姿态模拟 section */}
        <div className={activeTab === '姿态模拟' ? '' : 'hidden'}>
          <div className="flex flex-col overflow-hidden rounded-2xl" style={{ height: 'calc(100dvh - 200px)' }}>
            <Viewport />
          </div>
          <div className="mt-3 flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* 选车 section */}
        <div className={activeTab === '选车' ? 'space-y-4' : 'hidden'}>
          <BikeSelection />
          <SceneSelection />
          <DataPanel />
        </div>

        {/* 数据 section */}
        <div className={activeTab === '数据' ? 'space-y-4' : 'hidden'}>
          <BodyInput />
          <PoseAnalysis />
          <AIRecommendationCard />
        </div>

        {/* 个人中心 section */}
        <div className={activeTab === '个人中心' ? 'space-y-4' : 'hidden'}>
          <BodyInput />
          <PoseAnalysis />
          <AIRecommendationCard />
        </div>
      </div>

      {/* Bottom tab bar */}
      <MobileTabBar active={activeTab} onChange={setActiveTab} />
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
        {/* Left column — 选车 */}
        <div id="bike-section" className="flex w-[280px] shrink-0 flex-col gap-5 overflow-y-auto pb-2">
          <BikeSelection />
          <SceneSelection />
          <DataPanel />
        </div>

        {/* Center column — 姿态模拟 */}
        <div id="viewport-section" className="flex min-w-0 flex-1 flex-col gap-4 pb-6">
          <Viewport />
          <div className="flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* Right column — 数据/个人中心 */}
        <div id="data-section" className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto pb-2">
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
