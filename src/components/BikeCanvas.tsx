import { Suspense, lazy, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { HumanModel } from './HumanModel';
import { DebugHelper } from './DebugHelper';

const BikeModel = lazy(() =>
  import('./BikeModel').then((m) => ({ default: m.BikeModel })),
);
// const SimpleGrid = lazy(() =>
//   import('./SimpleGrid').then((m) => ({ default: m.SimpleGrid })),
// );
const CameraControls = lazy(() =>
  import('./CameraControls').then((m) => ({ default: m.CameraControls })),
);


function LoadSignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const t = setTimeout(onReady, 200);
    return () => clearTimeout(t);
  }, [onReady]);
  return null;
}

function GroundShadow() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2,
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(0.08, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(0.2, 'rgba(0,0,0,0.50)');
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.40)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.25)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.03)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0.08]}>
      <circleGeometry args={[0.66, 48]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function SceneContent({ onReady }: { onReady: () => void }) {
  return (
    <>
      <ambientLight args={['#8a9ac0', 1.3]} />
      <directionalLight
        args={['#fff8e7', 3.5]}
        position={[5, 7, 4]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.00015}
      />
      <directionalLight args={['#8899cc', 1.2]} position={[-2, 1.5, -1.5]} />
      <directionalLight args={['#ffffff', 1.5]} position={[0, 0.3, -3]} />

      <Suspense fallback={null}>
        <HumanModel />
        <BikeModel />
        <DebugHelper />
        {/* <SimpleGrid /> */}
        <GroundShadow />
        <CameraControls />
        <LoadSignal onReady={onReady} />
      </Suspense>
    </>
  );
}

function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
      <div className="relative h-1.5 w-44 overflow-hidden rounded-full bg-black/8">
        <div className="animate-loading-bar absolute top-0 h-full rounded-full bg-primary" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        {message ?? '加载 3D 场景...'}
      </p>
    </div>
  );
}

function WebGLUnsupported() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#EDE8DE] p-8">
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

interface BikeCanvasProps {
  minLoadMs?: number;
}

export function BikeCanvas({ minLoadMs = 0 }: BikeCanvasProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [ready, setReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const mountedAt = useRef(performance.now());

  const handleReady = useCallback(() => {
    const elapsed = performance.now() - mountedAt.current;
    const remaining = Math.max(0, minLoadMs - elapsed);
    setTimeout(() => {
      setReady(true);
      setShowOverlay(false);
    }, remaining);
  }, [minLoadMs]);

  const handleCreated = useCallback(({ scene, gl }: { scene: THREE.Scene; gl: THREE.WebGLRenderer }) => {
    const envScene = new THREE.Scene();
    // Bright sky dome for reflective highlights
    envScene.background = new THREE.Color('#e8e0d4');
    // Key light in env scene (simulates the main directional light in reflections)
    const envKey = new THREE.DirectionalLight('#ffffff', 3);
    envKey.position.set(5, 7, 4);
    envScene.add(envKey);
    // Darker ground plane for contrast in reflections
    const envGround = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: '#3a3530' }),
    );
    envGround.rotation.x = -Math.PI / 2;
    envGround.position.y = -2;
    envScene.add(envGround);
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(envScene, 0.02).texture;
    pmrem.dispose();
  }, []);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  if (typeof document !== 'undefined' && !hasWebGLSupport()) {
    return <WebGLUnsupported />;
  }

  return (
    <div className="absolute inset-0">
      {showOverlay && <LoadingOverlay message={ready ? undefined : '加载 3D 场景...'} />}

      <Canvas
        camera={{
          position: [3, 2, 4],
          fov: 45,
          near: 0.5,
          far: 20,
        }}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: 'srgb',
          toneMapping: 5,
          toneMappingExposure: 1.05,
          logarithmicDepthBuffer: true,
        }}
        onCreated={handleCreated}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <SceneContent onReady={handleReady} />
      </Canvas>
    </div>
  );
}
