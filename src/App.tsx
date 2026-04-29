import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BikeCanvas } from '@/components/BikeCanvas';
import { ControlsPanel } from '@/components/ControlsPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background md:flex-row">
        {/* Controls Panel (desktop sidebar, mobile drawer) */}
        <ControlsPanel />

        {/* 3D Canvas */}
        <main
          className="flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-0 md:p-4 container"
          style={{ containerType: 'inline-size' }}
        >
          <BikeCanvas />
        </main>
      </div>
    </QueryClientProvider>
  );
}
