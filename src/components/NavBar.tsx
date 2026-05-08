import { useBikeStore } from '@/store/useBikeStore';

export type NavPage = 'pose' | 'about';

interface NavBarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export function NavBar({ activePage, onNavigate }: NavBarProps) {
  const { height } = useBikeStore();
  const initial = 'U';

  return (
    <nav className="flex h-14 items-center gap-4 rounded-full bg-white/60 px-5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl md:w-auto md:gap-6 md:rounded-2xl md:px-6 w-[90vw]" aria-label="主导航">
      <span className="text-xl font-bold tracking-tight text-foreground">
        Coasting
      </span>

      <div className="hidden items-center justify-center gap-8 md:flex" role="menubar">
        <button
          role="menuitem"
          aria-current={activePage === 'pose' ? 'page' : undefined}
          onClick={() => onNavigate('pose')}
          className={`text-sm transition-colors ${
            activePage === 'pose'
              ? 'font-medium text-foreground'
              : 'font-normal text-muted-foreground hover:text-foreground'
          }`}
        >
          姿态模拟
        </button>
        <button
          role="menuitem"
          aria-current={activePage === 'about' ? 'page' : undefined}
          onClick={() => onNavigate('about')}
          className={`text-sm transition-colors ${
            activePage === 'about'
              ? 'font-medium text-foreground'
              : 'font-normal text-muted-foreground hover:text-foreground'
          }`}
        >
          关于
        </button>
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
