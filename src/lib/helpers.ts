import * as THREE from 'three';

// Reusable Vector3 pool to reduce GC pressure in hot loops
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vC = new THREE.Vector3();

/** Create a polygonal cylinder between two 3D points */
export function tubeBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
  segments = 6,
): THREE.Mesh | THREE.Group {
  _dir.subVectors(end, start);
  const len = _dir.length();
  if (len < 1e-6) return new THREE.Group();
  _mid.addVectors(start, end).multiplyScalar(0.5);
  const geo = new THREE.CylinderGeometry(radius, radius, len, segments);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(_mid);
  mesh.setRotationFromQuaternion(
    _quat.setFromUnitVectors(_yAxis, _dir.normalize()),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Create a box between two 3D points */
export function boxBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  width: number,
  depth: number,
  material: THREE.Material,
): THREE.Mesh | THREE.Group {
  _dir.subVectors(end, start);
  const len = _dir.length();
  if (len < 1e-6) return new THREE.Group();
  _mid.addVectors(start, end).multiplyScalar(0.5);
  const geo = new THREE.BoxGeometry(width, len, depth);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(_mid);
  mesh.setRotationFromQuaternion(
    _quat.setFromUnitVectors(_yAxis, _dir.normalize()),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Icosahedron joint sphere at a connection point */
export function jointAt(
  pos: THREE.Vector3,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const geo = new THREE.IcosahedronGeometry(radius, 0);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(pos);
  mesh.castShadow = true;
  return mesh;
}

/** Create a flat-shaded standard material */
export function mkMat(
  hex: string,
  roughness = 0.55,
  metalness = 0.05,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: hex,
    roughness,
    metalness,
    flatShading: true,
  });
}

// Additional reusable vectors for BikeMesh hot loops
export { _vA, _vB, _vC };
