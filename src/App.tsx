import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavBar, type NavPage } from '@/components/NavBar';
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

function AboutContent() {
  return (
    <div className="space-y-4">
      {/* 项目介绍 */}
      <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-foreground">Coasting · 悠骑</h2>
        <p className="text-sm text-muted-foreground mt-1">3D 自行车车架几何配置器</p>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>完全由 AI 生成 · MIT 开源协议</p>
        </div>
        <a
          href="https://github.com/Wshape1/coasting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
        >
          GitHub → Wshape1/coasting
        </a>
      </div>

        {/* 免责声明 */}
        <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">免责声明</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>本工具仅供参考，不构成专业建议。</strong>
              本应用提供的姿态分析、选车建议和几何计算结果基于公开的学术研究和行业标准公式，仅供参考和学习用途。
            </p>
            <p>
              <strong>个体差异显著。</strong>
              每个人的身体条件、柔韧性、骑行经验和运动目标都不同。本工具无法替代专业的 Bike Fitting 服务。如需精确的自行车设定，建议寻求认证的专业 Fitter 进行动态评估。
            </p>
            <p>
              <strong>骑行安全。</strong>
              不当的自行车设定可能导致运动损伤。在调整自行车设定前，请咨询专业人士。使用本工具产生的任何后果，开发者不承担责任。
            </p>
            <p>
              <strong>数据准确性。</strong>
              本工具使用的计算公式和参数基于公开文献，可能存在简化或近似。实际骑行中应结合个人感受进行调整。
            </p>
          </div>
        </div>

        {/* 计算公式说明 */}
        <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">计算公式</h3>
          <div className="space-y-4 text-sm">
            {/* 坐垫高度 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">坐垫高度计算</h4>
              <div className="bg-background/50 rounded-lg p-3 space-y-2 font-mono text-xs">
                <p><strong>LeMond法：</strong>坐垫高度 = 跨高 × 0.883</p>
                <p><strong>Hamley法：</strong>坐垫高度 = 跨高 × 1.09 - 曲柄长度</p>
                <p><strong>Genzling法：</strong>坐垫高度 = 跨高 × 0.885</p>
                <p><strong>Gatti方程 (2022)：</strong></p>
                <p className="pl-4">基于最小膝屈角：H = 7.41 + 0.82×I - 0.1×θ + 0.003×I×STA</p>
                <p className="pl-4">基于最大膝屈角：H = 41.63 + 0.78×I - 0.25×θ + 0.002×I×STA</p>
                <p className="text-muted-foreground">其中 H=坐垫高度, I=跨高, θ=膝关节角度, STA=立管角</p>
              </div>
            </div>

            {/* 膝关节角度 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">膝关节角度参考范围</h4>
              <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                <p><strong>低强度骑行：</strong>33° - 43° (理想值 38°)</p>
                <p><strong>高强度骑行：</strong>30° - 40° (理想值 33°)</p>
                <p><strong>损伤预防：</strong>25° - 35° (Holmes法)</p>
              </div>
            </div>

            {/* 躯干角度 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">躯干角度参考范围</h4>
              <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                <p><strong>平均值：</strong>38° ± 5° (Hsiao & Chou, 2015)</p>
                <p><strong>坐姿骑行：</strong>40° - 55°</p>
                <p><strong>爬坡姿态：</strong>50° - 65°</p>
                <p><strong>冲刺姿态：</strong>25° - 40°</p>
                <p><strong>低风阻姿态：</strong>15° - 25°</p>
              </div>
            </div>

            {/* Stack/Reach比例 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Stack/Reach比例参考</h4>
              <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                <p><strong>竞赛公路：</strong>1.40 - 1.50 (理想 1.45)</p>
                <p><strong>耐力公路：</strong>1.50 - 1.65 (理想 1.55)</p>
                <p><strong>山地车：</strong>1.60 - 1.80 (理想 1.70)</p>
                <p><strong>TT/铁三：</strong>1.30 - 1.40 (理想 1.35)</p>
              </div>
            </div>

            {/* 东亚人修正 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">东亚人体型修正系数</h4>
              <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                <p><strong>坐垫高度因子：</strong>0.875 (东亚) vs 0.883 (欧美)</p>
                <p><strong>躯干长度因子：</strong>1.03 (躯干相对较长)</p>
                <p><strong>四肢长度因子：</strong>0.97 (四肢相对较短)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 参考文献 */}
        <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">参考文献</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            {/* 核心研究 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">核心研究</h4>
              <ul className="space-y-2 list-decimal list-inside">
                <li>
                  <strong>Gatti et al. (2022)</strong> - Equations to prescribe bicycle saddle height based on desired joint kinematics and bicycle geometry.
                  <em> European Journal of Sport Science.</em>
                </li>
                <li>
                  <strong>Millour et al. (2019)</strong> - Comparison of two static methods of saddle height adjustment for cyclists of different morphologies.
                  <em> Sports Biomechanics.</em>
                </li>
                <li>
                  <strong>Swart & Holliday (2019)</strong> - Cycling Biomechanics Optimization—the (R)Evolution of Bicycle Fitting.
                  <em> Current Sports Medicine Reports.</em>
                </li>
                <li>
                  <strong>Muthiah et al. (2022)</strong> - Comparative Analysis of Male Cyclist Population in Four Asia Countries for Anthropometric Measurements.
                  <em> Int J Environ Res Public Health.</em>
                </li>
              </ul>
            </div>

            {/* 专家共识 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">专家共识与指南</h4>
              <ul className="space-y-2 list-decimal list-inside">
                <li>
                  <strong>Priego-Quesada et al. (2024)</strong> - Bicycle Set-Up Dimensions and Cycling Kinematics: A Consensus Statement Using Delphi Methodology.
                  <em> Sports Medicine.</em>
                </li>
                <li>
                  <strong>Holliday & Swart (2021)</strong> - Anthropometrics, flexibility and training history as determinants for bicycle configuration.
                  <em> Science & Medicine in Football.</em>
                </li>
              </ul>
            </div>

            {/* 经典公式 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">经典公式验证</h4>
              <ul className="space-y-2 list-decimal list-inside">
                <li>
                  <strong>Mauch et al. (2009)</strong> - Evaluation of Saddle Height in Elite Cyclists.
                  <em> Medicine & Science in Sports & Exercise.</em>
                </li>
                <li>
                  <strong>Peveler et al. (2005)</strong> - Comparing Methods for setting saddle height in trained cyclists.
                  <em> Journal of Sports Science & Medicine.</em>
                </li>
                <li>
                  <strong>Holmes et al. (1994)</strong> - 经典坐垫高度公式 (LeMond法) 的提出者。
                </li>
              </ul>
            </div>

            {/* 姿态优化 */}
            <div>
              <h4 className="font-medium text-foreground mb-2">骑行姿态优化</h4>
              <ul className="space-y-2 list-decimal list-inside">
                <li>
                  <strong>Hsiao & Chou (2015)</strong> - Applying riding-posture optimization on bicycle frame design.
                  <em> Applied Ergonomics.</em>
                </li>
                <li>
                  <strong>Phil Burt</strong> - <em>Bike Fit</em>. 英国自行车国家队理疗师著作。
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 数据来源 */}
        <div className="rounded-2xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">数据来源</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>车架几何数据参考以下品牌 2024-2025 款车型：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Giant (TCR, Defy, Talon, Anthem 系列)</li>
              <li>Merida (Scultura, Reacto, Big.Trail 系列)</li>
              <li>Decathlon (Elops 系列)</li>
            </ul>
            <p className="mt-3">人体测量数据参考：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>亚洲骑行者人体测量对比研究 (Muthiah et al., 2022)</li>
              <li>国际自行车联盟 (UCI) 车手数据</li>
            </ul>
          </div>
        </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="max-w-3xl mx-auto space-y-6 p-4">
        <AboutContent />
      </div>
    </div>
  );
}

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>('姿态模拟');

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Mobile top bar — floating island */}
      <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
        <NavBar activePage="pose" onNavigate={() => {}} />
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
          <AboutContent />
        </div>
      </div>

      {/* Bottom tab bar */}
      <MobileTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TabletLayout() {
  const [activePage, setActivePage] = useState<NavPage>('pose');

  return (
    <div className="flex h-dvh flex-col bg-background p-4">
      <NavBar activePage={activePage} onNavigate={setActivePage} />
      <div className="mt-4 flex flex-1 gap-4 overflow-hidden">
        {activePage === 'about' ? (
          <AboutPage />
        ) : (
          <>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DesktopLayout() {
  const [activePage, setActivePage] = useState<NavPage>('pose');

  return (
    <div className="flex h-dvh flex-col bg-background p-4">
      <NavBar activePage={activePage} onNavigate={setActivePage} />
      <div className="mt-4 flex flex-1 gap-6 overflow-hidden">
        {activePage === 'about' ? (
          <AboutPage />
        ) : (
          <>
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
            </div>
          </>
        )}
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
