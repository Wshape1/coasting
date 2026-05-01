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
  city: '#F9F6F0',
  mountain: '#F0F4EC',
  seaside: '#EDF3F8',
};

function SceneContent() {
  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.8} />
      <hemisphereLight args={['#b8d4f0', '#c4a882', 0.7]} />

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
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#F9F6F0] p-8">
      <div className="text-center">
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
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#F9F6F0] p-8">
            <div className="text-center">
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
            near: 0.5,
            far: 20,
          }}
          gl={{
            antialias: true,
            alpha: false,
            outputColorSpace: 'srgb',
            toneMapping: 4,
            toneMappingExposure: 1.15,
            logarithmicDepthBuffer: true,
          }}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          style={{ background: sceneColors[scene] ?? '#EAE6DE' }}
        >
          <SceneContent />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
