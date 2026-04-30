import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function BikeModel() {
  const gltf = useLoader(GLTFLoader, '/models/bike_opt/bike.gltf');

  return (
    <primitive
      object={gltf.scene}
      scale={0.38}
      position={[0, 0.7, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}
