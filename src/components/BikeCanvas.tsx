import { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useBikeStore } from '@/store/useBikeStore';
import { ErrorBoundary } from './ErrorBoundary';

const HumanModel = lazy(() =>
  import('./HumanModel').then((m) => ({ default: m.HumanModel })),
);
const BikeModel = lazy(() =>
  import('./BikeModel').then((m) => ({ default: m.BikeModel })),
);
const SimpleGrid = lazy(() =>
  import('./SimpleGrid').then((m) => ({ default: m.SimpleGrid })),
);
const CameraControls = lazy(() =>
  import('./CameraControls').then((m) => ({ default: m.CameraControls })),
);

const sceneColors: Record<string, string> = {
  city: '#EAE6DE',
  mountain: '#D4E6D4',
  seaside: '#D4E6F0',
};

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">加载 3D 场景...</p>
      </div>
    </div>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <hemisphereLight args={['#87ceeb', '#8b7355', 0.4]} />

      <Suspense fallback={null}>
        <HumanModel />
        <BikeModel />
        <SimpleGrid />
        <CameraControls />
      </Suspense>
    </>
  );
}

function WebGLUnsupported() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#EAE6DE] p-8">
      <div className="text-center">
        <p className="mb-2 text-4xl">🚴</p>
        <p className="text-base font-semibold text-foreground">
          您的浏览器不支持 3D 渲染
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          请使用最新版 Chrome、Safari 或 Firefox
        </p>
      </div>
    </div>
  );
}

function hasWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function BikeCanvas() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const scene = useBikeStore((s) => s.scene);

  if (typeof document !== 'undefined' && !hasWebGLSupport()) {
    return <WebGLUnsupported />;
  }

  return (
    <div className="absolute inset-0">
      <ErrorBoundary
        fallback={
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#EAE6DE] p-8">
            <div className="text-center">
              <p className="mb-2 text-4xl">⚠️</p>
              <p className="text-base font-semibold text-foreground">
                3D 场景加载失败
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                重新加载
              </button>
            </div>
          </div>
        }
      >
        <Canvas
          camera={{
            position: [3, 2, 4],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          gl={{
            antialias: true,
            alpha: false,
            outputColorSpace: 'srgb',
            toneMapping: 3,
          }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          style={{ background: sceneColors[scene] ?? '#EAE6DE' }}
        >
          <Suspense fallback={<SceneFallback />}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
