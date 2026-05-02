export type TabKey = '姿态模拟' | '车辆配置' | '个人数据' | '关于';

function TabIcon({ tab }: { tab: TabKey }) {
  const base = 'w-4 h-4';
  switch (tab) {
    case '姿态模拟':
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case '车辆配置':
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4" />
          <circle cx="17" cy="7" r="4" />
          <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" />
        </svg>
      );
    case '个人数据':
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case '关于':
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

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
      {(['姿态模拟', '车辆配置', '个人数据', '关于'] as TabKey[]).map((key) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-0 rounded-xl px-3 py-1.5 transition-colors ${
              isActive
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden="true" className={isActive ? 'text-primary' : ''}>
              <TabIcon tab={key} />
            </span>
            <span
              className={`text-[10px] ${
                isActive
                  ? 'font-semibold text-foreground'
                  : 'font-normal'
              }`}
            >
              {key}
            </span>
          </button>
        );
      })}
    </div>
  );
}
