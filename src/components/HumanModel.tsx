import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function HumanModel() {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/human.glb',
      (gltf) => {
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
        });
        if (meshes.length > 0) {
          const g = meshes[0]!.geometry.clone();
          g.computeBoundingBox();
          if (g.boundingBox) {
            const b = g.boundingBox;
            const cx = (b.max.x + b.min.x) / 2;
            const cy = (b.max.y + b.min.y) / 2;
            const cz = (b.max.z + b.min.z) / 2;
            g.translate(-cx, -cy, -cz);
          }
          g.computeVertexNormals();
          const bb = g.boundingBox;
          const s = bb ? `size: ${(bb.max.x - bb.min.x).toFixed(2)} x ${(bb.max.y - bb.min.y).toFixed(2)} x ${(bb.max.z - bb.min.z).toFixed(2)}` : '';
          const c = bb ? `center: ${((bb.max.x+bb.min.x)/2).toFixed(2)},${((bb.max.y+bb.min.y)/2).toFixed(2)},${((bb.max.z+bb.min.z)/2).toFixed(2)}` : '';
          console.log('Human geo ready, verts:', g.attributes.position?.count, s, c);
          setGeo(g);
        }
      },
      undefined,
      (err) => console.error('HumanModel error:', err),
    );
  }, []);

  return (
    <>
      {geo && (
        <mesh
          geometry={geo}
          position={[0, 0.8, 0]}
          scale={0.55}
          rotation={[Math.PI / 2, -Math.PI / 2, 0]}
          frustumCulled={false}
        >
          <meshStandardMaterial color="#f0c8a0" roughness={0.7} metalness={0.0} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}
