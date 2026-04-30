import { useMemo } from 'react';
import { useBikeStore, type Pose } from '@/store/useBikeStore';

const poseAngles: Record<Pose, { arm: number; leg: number; torso: number }> = {
  seated: { arm: 0.3, leg: 0.05, torso: 0 },
  sprint: { arm: -0.4, leg: 0.3, torso: 0.15 },
  climbing: { arm: 0.6, leg: -0.2, torso: -0.1 },
  aero: { arm: -0.6, leg: 0.15, torso: 0.2 },
};

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
  const { height, inseam, pose } = useBikeStore();
  const angles = poseAngles[pose];

  const parts = useMemo(() => {
    const h = height / 100;
    const legRatio = inseam / height;
    const armRatio = 0.35;

    const legLen = h * legRatio;
    const armLen = h * armRatio;
    const torsoLen = h * 0.3;
    const headSize = h * 0.13;
    const shoulderWidth = h * 0.22;
    const hipWidth = h * 0.2;
    const bodyDepth = h * 0.12;

    const footY = legLen / 2;
    const kneeY = legLen * 0.55;
    const hipY = legLen;
    const shoulderY = hipY + torsoLen;
    const headY = shoulderY + headSize * 0.5;
    const elbowY = shoulderY - armLen * 0.45;

    return {
      headSize,
      headY,
      shoulderY,
      hipY,
      torsoLen,
      shoulderWidth,
      hipWidth,
      bodyDepth,
      armLen,
      legLen,
      elbowY,
      kneeY,
      footY,
      h,
    };
  }, [height, inseam]);

  return (
    <group position={[0, 0.01, 0]} rotation={[angles.torso, 0, 0]}>
      {/* Head */}
      <mesh position={[0, parts.headY + 0.02, 0]}>
        <sphereGeometry args={[parts.headSize * 0.45, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Neck */}
      <BodyPart
        position={[0, parts.shoulderY + parts.headSize * 0.1, 0]}
        scale={[parts.headSize * 0.35, parts.headSize * 0.2, parts.headSize * 0.35]}
        color="#f5d0b0"
      />

      {/* Torso */}
      <BodyPart
        position={[0, parts.hipY + parts.torsoLen * 0.5, 0]}
        scale={[parts.shoulderWidth * 0.8, parts.torsoLen, parts.bodyDepth]}
        color="#3b82f6"
      />

      {/* Left upper arm */}
      <BodyPart
        position={[-parts.shoulderWidth * 0.55, parts.shoulderY - parts.armLen * 0.25, 0]}
        rotation={[angles.arm, 0, 0.15]}
        scale={[parts.h * 0.035, parts.armLen * 0.45, parts.h * 0.035]}
        color="#f5d0b0"
      />

      {/* Right upper arm */}
      <BodyPart
        position={[parts.shoulderWidth * 0.55, parts.shoulderY - parts.armLen * 0.25, 0]}
        rotation={[angles.arm, 0, -0.15]}
        scale={[parts.h * 0.035, parts.armLen * 0.45, parts.h * 0.035]}
        color="#f5d0b0"
      />

      {/* Left lower arm */}
      <BodyPart
        position={[-parts.shoulderWidth * 0.52, parts.elbowY - parts.armLen * 0.25, 0.02]}
        rotation={[angles.arm + 0.3, 0, 0.1]}
        scale={[parts.h * 0.03, parts.armLen * 0.45, parts.h * 0.03]}
        color="#f5d0b0"
      />

      {/* Right lower arm */}
      <BodyPart
        position={[parts.shoulderWidth * 0.52, parts.elbowY - parts.armLen * 0.25, 0.02]}
        rotation={[angles.arm + 0.3, 0, -0.1]}
        scale={[parts.h * 0.03, parts.armLen * 0.45, parts.h * 0.03]}
        color="#f5d0b0"
      />

      {/* Left thigh */}
      <BodyPart
        position={[-parts.hipWidth * 0.3, parts.hipY - parts.legLen * 0.25, 0]}
        rotation={[angles.leg, 0, 0]}
        scale={[parts.h * 0.045, parts.legLen * 0.45, parts.h * 0.045]}
        color="#1e40af"
      />

      {/* Right thigh */}
      <BodyPart
        position={[parts.hipWidth * 0.3, parts.hipY - parts.legLen * 0.25, 0]}
        rotation={[-angles.leg, 0, 0]}
        scale={[parts.h * 0.045, parts.legLen * 0.45, parts.h * 0.045]}
        color="#1e40af"
      />

      {/* Left shin */}
      <BodyPart
        position={[-parts.hipWidth * 0.3, parts.kneeY - parts.legLen * 0.25, 0]}
        scale={[parts.h * 0.035, parts.legLen * 0.45, parts.h * 0.035]}
        color="#f5d0b0"
      />

      {/* Right shin */}
      <BodyPart
        position={[parts.hipWidth * 0.3, parts.kneeY - parts.legLen * 0.25, 0]}
        scale={[parts.h * 0.035, parts.legLen * 0.45, parts.h * 0.035]}
        color="#f5d0b0"
      />

      {/* Left foot */}
      <BodyPart
        position={[-parts.hipWidth * 0.3, parts.footY - parts.legLen * 0.05, 0.03]}
        scale={[parts.h * 0.04, parts.h * 0.02, parts.h * 0.06]}
        color="#1e40af"
      />

      {/* Right foot */}
      <BodyPart
        position={[parts.hipWidth * 0.3, parts.footY - parts.legLen * 0.05, 0.03]}
        scale={[parts.h * 0.04, parts.h * 0.02, parts.h * 0.06]}
        color="#1e40af"
      />
    </group>
  );
}
