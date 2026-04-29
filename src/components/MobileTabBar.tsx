const tabs = [
  { icon: '🎯', label: '姿态模拟' },
  { icon: '🚲', label: '选车' },
  { icon: '📊', label: '数据' },
  { icon: '👤', label: '个人中心' },
];

export function MobileTabBar() {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[85vw] max-w-[400px] -translate-x-1/2 items-center justify-around rounded-full bg-white/70 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      {tabs.map((tab, i) => {
        const active = i === 0;
        return (
          <button
            key={tab.label}
            className={`flex flex-col items-center gap-0 rounded-xl px-3 py-1.5 transition-colors ${
              active
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <span
              className={`text-base ${
                active ? 'text-primary' : ''
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] ${
                active
                  ? 'font-semibold text-foreground'
                  : 'font-normal'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
