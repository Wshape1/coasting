import { Canvas } from '@react-three/fiber';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HumanModel } from './HumanModel';
import { BikeModel } from './BikeModel';
import { SimpleGrid } from './SimpleGrid';
import { CameraControls } from './CameraControls';

export function BikeCanvas() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="absolute inset-0">
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
          toneMapping: 3, // ACESFilmic
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
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

        <HumanModel />
        <BikeModel />

        <SimpleGrid />

        <CameraControls />
      </Canvas>
    </div>
  );
}
