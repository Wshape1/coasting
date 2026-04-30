import { OrbitControls } from '@react-three/drei';

export function CameraControls() {
  return (
    <OrbitControls
      target={[0, 0.8, 0]}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.45}
      minDistance={1.5}
      maxDistance={8}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
