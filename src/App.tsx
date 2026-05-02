import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavBar } from '@/components/NavBar';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { Viewport } from '@/components/Viewport';
import { PoseSwitcher } from '@/components/PoseSwitcher';
import { BodyInput } from '@/components/BodyInput';
import { HumanDerivedPanel } from '@/components/HumanDerivedPanel';
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
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{ height: 'calc(100dvh - 200px)' }}
          >
            <Viewport />
          </div>
          <div className="mt-3 flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* 车辆配置 section */}
        <div className={activeTab === '车辆配置' ? 'space-y-4' : 'hidden'}>
          <CustomizationPanel />
        </div>

        {/* 个人数据 section */}
        <div className={activeTab === '个人数据' ? 'space-y-4' : 'hidden'}>
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <BodyInput />
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <HumanDerivedPanel />
          </div>
          <PoseAnalysis />
          <AIRecommendationCard />
        </div>

        {/* 关于 section */}
        <div className={activeTab === '关于' ? '' : 'hidden'}>
          <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl text-center">
            <p className="text-lg font-bold text-foreground">Coasting · 悠骑</p>
            <p className="text-xs text-muted-foreground mt-1">3D 自行车车架几何配置器</p>
            <p className="text-xs text-muted-foreground mt-3">
              完全由 AI (Claude Code) 生成 · MIT 开源
            </p>
            <a
              href="https://github.com/Wshape1/coasting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-medium text-primary hover:underline"
            >
              GitHub → Wshape1/coasting
            </a>
          </div>
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
        <div className="flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto scrollbar-none pb-2">
          <CustomizationPanel />
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <BodyInput />
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <HumanDerivedPanel />
          </div>
          <PoseAnalysis />
          <AIRecommendationCard />
          <div id="about-section" />
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
        {/* Left column — 自定义面板 */}
        <div
          id="bike-section"
          className="flex w-[300px] shrink-0 flex-col gap-4 overflow-y-auto scrollbar-none pb-2"
        >
          <CustomizationPanel />
        </div>

        {/* Center column — 姿态模拟 */}
        <div
          id="viewport-section"
          className="flex min-w-0 flex-1 flex-col gap-4 pb-6"
        >
          <Viewport />
          <div className="flex justify-center">
            <PoseSwitcher />
          </div>
        </div>

        {/* Right column — 数据/个人中心 */}
        <div
          id="data-section"
          className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto scrollbar-none pb-2"
        >
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <BodyInput />
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <HumanDerivedPanel />
          </div>
          <PoseAnalysis />
          <AIRecommendationCard />
          <div id="about-section" />
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
      {/* Tooltip for parameter sliders */}
      <div
        id="tooltip"
        className="hidden fixed pointer-events-none z-[100] text-xs px-2.5 py-1.5 rounded-lg
          max-w-[220px] shadow-xl ring-1 ring-black/5 backdrop-blur-md
          bg-white/90 text-foreground border border-amber-200/50"
      />
    </QueryClientProvider>
  );
}
