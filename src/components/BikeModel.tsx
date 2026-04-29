import { useMemo } from 'react';
import * as THREE from 'three';
import { useBikeStore } from '@/store/useBikeStore';

// Simple geometric bike model
function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.04, 16, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.015, 12, 32]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {/* Spokes (simple cross) */}
      <mesh>
        <boxGeometry args={[0.005, 0.005, 0.6]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.005, 0.005, 0.6]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.005, 0.005, 0.6]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.005, 0.005, 0.6]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </group>
  );
}

function Tube({
  from,
  to,
  radius = 0.018,
  color = '#ef4444',
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius?: number;
  color?: string;
}) {
  const meshRef = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { position: mid, quaternion, length };
  }, [from, to]);

  return (
    <mesh position={meshRef.position} quaternion={meshRef.quaternion}>
      <cylinderGeometry args={[radius, radius, meshRef.length, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function BikeModel() {
  const { bikeType } = useBikeStore();

  const frameColor = bikeType === 'road' ? '#ef4444' : '#22c55e';
  const wheelBase = bikeType === 'road' ? 0.98 : 1.05;
  const seatHeight = bikeType === 'road' ? 0.7 : 0.65;

  const wheelRadius = 0.35;
  const bbHeight = 0.28; // bottom bracket height

  // Key frame points
  const rearWheel = new THREE.Vector3(-wheelBase * 0.45, wheelRadius, 0);
  const frontWheel = new THREE.Vector3(wheelBase * 0.55, wheelRadius, 0);
  const bottomBracket = new THREE.Vector3(0, bbHeight, 0);
  const seatCluster = new THREE.Vector3(-0.1, seatHeight, 0);
  const headTubeBottom = new THREE.Vector3(wheelBase * 0.45, wheelRadius + 0.15, 0);
  const headTubeTop = new THREE.Vector3(wheelBase * 0.45, wheelRadius + 0.45, 0);

  return (
    <group position={[0, 0.01, 0]}>
      {/* Wheels */}
      <Wheel position={[rearWheel.x, rearWheel.y, rearWheel.z]} />
      <Wheel position={[frontWheel.x, frontWheel.y, frontWheel.z]} />

      {/* Frame tubes */}
      {/* Seat tube: seat cluster → bottom bracket */}
      <Tube from={seatCluster} to={bottomBracket} color={frameColor} />

      {/* Down tube: head tube bottom → bottom bracket */}
      <Tube from={headTubeBottom} to={bottomBracket} color={frameColor} />

      {/* Top tube: seat cluster → head tube top */}
      <Tube from={seatCluster} to={headTubeTop} color={frameColor} />

      {/* Seat stays: rear wheel → seat cluster */}
      <Tube from={rearWheel} to={seatCluster} color={frameColor} radius={0.012} />

      {/* Chain stays: rear wheel → bottom bracket */}
      <Tube from={rearWheel} to={bottomBracket} color={frameColor} radius={0.012} />

      {/* Fork: front wheel → head tube bottom */}
      <Tube from={frontWheel} to={headTubeBottom} color="#9ca3af" radius={0.015} />

      {/* Head tube */}
      <Tube from={headTubeBottom} to={headTubeTop} color="#6b7280" radius={0.025} />

      {/* Handlebars */}
      <mesh position={[headTubeTop.x + 0.05, headTubeTop.y + 0.08, 0]}>
        <boxGeometry args={[0.08, 0.025, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Handlebar stem */}
      <Tube
        from={headTubeTop}
        to={new THREE.Vector3(headTubeTop.x + 0.05, headTubeTop.y + 0.08, 0)}
        color="#6b7280"
        radius={0.015}
      />
      {/* Handlebar grips */}
      <mesh position={[headTubeTop.x + 0.02, headTubeTop.y + 0.08, -0.13]}>
        <boxGeometry args={[0.06, 0.025, 0.03]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[headTubeTop.x + 0.02, headTubeTop.y + 0.08, 0.13]}>
        <boxGeometry args={[0.06, 0.025, 0.03]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Saddle */}
      <mesh position={[seatCluster.x, seatCluster.y + 0.04, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.08]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Saddle nose */}
      <mesh position={[seatCluster.x + 0.08, seatCluster.y + 0.035, 0]}>
        <boxGeometry args={[0.06, 0.015, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Seatpost */}
      <Tube
        from={seatCluster}
        to={new THREE.Vector3(seatCluster.x, seatCluster.y - 0.1, 0)}
        color="#9ca3af"
        radius={0.012}
      />

      {/* Pedal area / crank */}
      <mesh position={[bottomBracket.x, bottomBracket.y - 0.04, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {/* Crank arm */}
      <mesh position={[bottomBracket.x, bottomBracket.y - 0.08, 0.02]}>
        <boxGeometry args={[0.015, 0.08, 0.015]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Pedal */}
      <mesh position={[bottomBracket.x, bottomBracket.y - 0.125, 0.02]}>
        <boxGeometry args={[0.03, 0.01, 0.04]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
