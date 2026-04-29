import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function CameraControls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.target.set(0, 0.8, 0);
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.45;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controls.update();

    return () => controls.dispose();
  }, [camera, gl]);

  return null;
}
