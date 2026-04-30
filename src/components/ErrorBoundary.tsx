import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[#EAE6DE] p-8 text-center">
            <div>
              <p className="text-lg font-semibold text-foreground">加载遇到问题</p>
              <p className="mt-1 text-sm text-muted-foreground">请刷新页面重试</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
              >
                刷新页面
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
