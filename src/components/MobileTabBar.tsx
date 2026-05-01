export type TabKey = '姿态模拟' | '选车' | '数据' | '个人中心';

const tabs: { key: TabKey; icon: string }[] = [
  { key: '姿态模拟', icon: '🎯' },
  { key: '选车', icon: '🚲' },
  { key: '数据', icon: '📊' },
  { key: '个人中心', icon: '👤' },
];

export function MobileTabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 flex w-[85vw] max-w-[400px] -translate-x-1/2 items-center justify-around rounded-full bg-white/70 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl"
      role="tablist"
      aria-label="页面导航"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center gap-0 rounded-xl px-3 py-1.5 transition-colors ${
              isActive
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden="true" className={`text-base ${isActive ? 'text-primary' : ''}`}>
              {tab.icon}
            </span>
            <span
              className={`text-[10px] ${
                isActive
                  ? 'font-semibold text-foreground'
                  : 'font-normal'
              }`}
            >
              {tab.key}
            </span>
          </button>
        );
      })}
    </div>
  );
}
