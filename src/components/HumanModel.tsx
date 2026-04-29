import { useBikeStore } from '@/store/useBikeStore';

function BodyPart({
  position,
  rotation,
  scale,
  color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]}>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function HumanModel() {
  const { height, inseam } = useBikeStore();

  // Normalize measurements: height in cm → 3D units (1 unit = 1 meter)
  const h = height / 100;
  const legRatio = inseam / height;
  const armRatio = 0.35; // default arm ratio

  // Derived proportions
  const legLen = h * legRatio;
  const armLen = h * armRatio;
  const torsoLen = h * 0.3;
  const headSize = h * 0.13;
  const shoulderWidth = h * 0.22;
  const hipWidth = h * 0.2;
  const bodyDepth = h * 0.12;

  // Joint positions
  const footY = legLen / 2;
  const kneeY = legLen * 0.55;
  const hipY = legLen;
  const shoulderY = hipY + torsoLen;
  const headY = shoulderY + headSize * 0.5;
  const elbowY = shoulderY - armLen * 0.45;

  return (
    <group position={[0, 0.01, 0]}>
      {/* Head */}
      <mesh position={[0, headY + 0.02, 0]}>
        <sphereGeometry args={[headSize * 0.45, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Neck */}
      <BodyPart
        position={[0, shoulderY + headSize * 0.1, 0]}
        scale={[headSize * 0.35, headSize * 0.2, headSize * 0.35]}
        color="#f5d0b0"
      />

      {/* Torso */}
      <BodyPart
        position={[0, hipY + torsoLen * 0.5, 0]}
        scale={[shoulderWidth * 0.8, torsoLen, bodyDepth]}
        color="#3b82f6"
      />

      {/* Left upper arm */}
      <BodyPart
        position={[-shoulderWidth * 0.55, shoulderY - armLen * 0.25, 0]}
        rotation={[0, 0, 0.15]}
        scale={[h * 0.035, armLen * 0.45, h * 0.035]}
        color="#f5d0b0"
      />

      {/* Right upper arm */}
      <BodyPart
        position={[shoulderWidth * 0.55, shoulderY - armLen * 0.25, 0]}
        rotation={[0, 0, -0.15]}
        scale={[h * 0.035, armLen * 0.45, h * 0.035]}
        color="#f5d0b0"
      />

      {/* Left lower arm */}
      <BodyPart
        position={[-shoulderWidth * 0.52, elbowY - armLen * 0.25, 0.02]}
        rotation={[0.3, 0, 0.1]}
        scale={[h * 0.03, armLen * 0.45, h * 0.03]}
        color="#f5d0b0"
      />

      {/* Right lower arm */}
      <BodyPart
        position={[shoulderWidth * 0.52, elbowY - armLen * 0.25, 0.02]}
        rotation={[0.3, 0, -0.1]}
        scale={[h * 0.03, armLen * 0.45, h * 0.03]}
        color="#f5d0b0"
      />

      {/* Left thigh */}
      <BodyPart
        position={[-hipWidth * 0.3, hipY - legLen * 0.25, 0]}
        rotation={[0.05, 0, 0]}
        scale={[h * 0.045, legLen * 0.45, h * 0.045]}
        color="#1e40af"
      />

      {/* Right thigh */}
      <BodyPart
        position={[hipWidth * 0.3, hipY - legLen * 0.25, 0]}
        rotation={[-0.05, 0, 0]}
        scale={[h * 0.045, legLen * 0.45, h * 0.045]}
        color="#1e40af"
      />

      {/* Left shin */}
      <BodyPart
        position={[-hipWidth * 0.3, kneeY - legLen * 0.25, 0]}
        scale={[h * 0.035, legLen * 0.45, h * 0.035]}
        color="#f5d0b0"
      />

      {/* Right shin */}
      <BodyPart
        position={[hipWidth * 0.3, kneeY - legLen * 0.25, 0]}
        scale={[h * 0.035, legLen * 0.45, h * 0.035]}
        color="#f5d0b0"
      />

      {/* Left foot */}
      <BodyPart
        position={[-hipWidth * 0.3, footY - legLen * 0.05, 0.03]}
        scale={[h * 0.04, h * 0.02, h * 0.06]}
        color="#1e40af"
      />

      {/* Right foot */}
      <BodyPart
        position={[hipWidth * 0.3, footY - legLen * 0.05, 0.03]}
        scale={[h * 0.04, h * 0.02, h * 0.06]}
        color="#1e40af"
      />
    </group>
  );
}
