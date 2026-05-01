import { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBikeStore } from '@/store/useBikeStore';
import * as THREE from 'three';

const BIKE_COLORS: Record<string, string> = {
  road: '#C0392B',
  mountain: '#27AE60',
  urban: '#2980B9',
};

export function BikeModel() {
  const bikeType = useBikeStore((s) => s.bikeType);
  const gltf = useLoader(GLTFLoader, '/models/bike_opt/bike.gltf');
  const colorRef = useRef(bikeType);

  // Apply color on mount and when bikeType changes
  useEffect(() => {
    if (colorRef.current === bikeType) return;
    colorRef.current = bikeType;

    const color = BIKE_COLORS[bikeType] ?? '#C0392B';
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat) mat.color.set(color);
      }
    });
  }, [bikeType, gltf]);

  // Initial color on first load
  useEffect(() => {
    const color = BIKE_COLORS[bikeType] ?? '#C0392B';
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat) mat.color.set(color);
      }
    });
  }, []);

  return (
    <primitive
      object={gltf.scene}
      scale={0.38}
      position={[0, 0.7, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}
