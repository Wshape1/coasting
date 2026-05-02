import * as THREE from 'three'

export type PoseDef = Record<string, [number, number, number]>

export function makePose(defs: PoseDef): Record<string, THREE.Quaternion> {
  const pose: Record<string, THREE.Quaternion> = {}
  for (const [name, [rx, ry, rz]] of Object.entries(defs)) {
    pose[name] = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'))
  }
  return pose
}

export function clonePose(pose: Record<string, THREE.Quaternion>): Record<string, THREE.Quaternion> {
  const cloned: Record<string, THREE.Quaternion> = {}
  for (const [name, q] of Object.entries(pose)) {
    cloned[name] = q.clone()
  }
  return cloned
}

export function blendPoseQ(
  current: Record<string, THREE.Quaternion>,
  target: Record<string, THREE.Quaternion>,
  speed: number
) {
  for (const name of Object.keys(current)) {
    if (target[name] && current[name]) current[name].slerp(target[name], speed)
  }
}

export const P_STAND_Q = makePose({
  lowerTorso:   [0.03, 0, 0],
  upperTorso:   [0.05, 0, 0],
  head:         [0.05, 0, 0],
  lShoulder:    [Math.PI, 0, -0.06],
  rShoulder:    [Math.PI, 0,  0.06],
  lElbow:       [0.06, 0,  0.02],
  rElbow:       [0.06, 0, -0.02],
  lHipLeg:      [Math.PI, 0,  0.02],
  rHipLeg:      [Math.PI, 0, -0.02],
  lKnee:        [-0.03, 0, 0],
  rKnee:        [-0.03, 0, 0],
  lAnkle:       [0, 0, 0],
  rAnkle:       [0, 0, 0],
  lFoot:        [0, 0, 0],
  rFoot:        [0, 0, 0],
})

export const JOINT_NAMES = [
  'lowerTorso', 'upperTorso', 'head',
  'lShoulder', 'rShoulder', 'lElbow', 'rElbow',
  'lHipLeg', 'rHipLeg', 'lKnee', 'rKnee',
  'lAnkle', 'rAnkle', 'lFoot', 'rFoot',
] as const

export type JointName = typeof JOINT_NAMES[number]
