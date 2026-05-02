import { useBikeStore } from '@/store/useBikeStore';

const navItems: { label: string; section: string }[] = [
  { label: '姿态模拟', section: 'viewport-section' },
  { label: '选车建议', section: 'bike-section' },
  { label: '关于', section: 'about-section' },
];

export function NavBar() {
  const { height } = useBikeStore();
  const initial = 'U';

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="flex h-14 items-center gap-4 rounded-full bg-white/60 px-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl md:w-auto md:gap-6 md:rounded-2xl md:px-6 w-[90vw]" aria-label="主导航">
      <span className="text-xl font-bold tracking-tight text-foreground">
        Coasting
      </span>
      <span className="rounded-full bg-amber-400/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
        In Development
      </span>

      <div className="hidden items-center justify-center gap-8 md:flex" role="menubar">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            role="menuitem"
            aria-current={i === 0 ? 'page' : undefined}
            onClick={() => scrollTo(item.section)}
            className={`text-sm transition-colors ${
              i === 0
                ? 'font-medium text-foreground'
                : 'font-normal text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground md:inline">
          {height}cm
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initial}
        </div>
      </div>
    </nav>
  );
}
