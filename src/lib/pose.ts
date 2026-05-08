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

// 基础站立/坐姿姿态
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

// 冲刺姿态：躯干收紧，头部抬起看前方
export const P_SPRINT_Q = makePose({
  lowerTorso:   [0.05, 0, 0],
  upperTorso:   [0.08, 0, 0],
  head:         [1.00, 0, 0],
  lShoulder:    [Math.PI + 0.15, 0, -0.10],
  rShoulder:    [Math.PI + 0.15, 0,  0.10],
  lElbow:       [0.20, 0,  0.02],
  rElbow:       [0.20, 0, -0.02],
  lHipLeg:      [Math.PI, 0,  0.02],
  rHipLeg:      [Math.PI, 0, -0.02],
  lKnee:        [-0.03, 0, 0],
  rKnee:        [-0.03, 0, 0],
  lAnkle:       [0, 0, 0],
  rAnkle:       [0, 0, 0],
  lFoot:        [0, 0, 0],
  rFoot:        [0, 0, 0],
})

// 站立爬坡姿态：躯干略微前倾
export const P_CLIMBING_Q = makePose({
  lowerTorso:   [0.10, 0, 0],
  upperTorso:   [0.08, 0, 0],
  head:         [0.25, 0, 0],
  lShoulder:    [Math.PI - 0.10, 0, -0.08],
  rShoulder:    [Math.PI - 0.10, 0,  0.08],
  lElbow:       [0.15, 0,  0.02],
  rElbow:       [0.15, 0, -0.02],
  lHipLeg:      [Math.PI, 0,  0.02],
  rHipLeg:      [Math.PI, 0, -0.02],
  lKnee:        [-0.03, 0, 0],
  rKnee:        [-0.03, 0, 0],
  lAnkle:       [0, 0, 0],
  rAnkle:       [0, 0, 0],
  lFoot:        [0, 0, 0],
  rFoot:        [0, 0, 0],
})

// 低风阻姿态：头部平视
export const P_AERO_Q = makePose({
  lowerTorso:   [0.02, 0, 0],
  upperTorso:   [0.04, 0, 0],
  head:         [1.10, 0, 0],
  lShoulder:    [Math.PI + 0.20, 0, -0.12],
  rShoulder:    [Math.PI + 0.20, 0,  0.12],
  lElbow:       [0.25, 0,  0.02],
  rElbow:       [0.25, 0, -0.02],
  lHipLeg:      [Math.PI, 0,  0.02],
  rHipLeg:      [Math.PI, 0, -0.02],
  lKnee:        [-0.03, 0, 0],
  rKnee:        [-0.03, 0, 0],
  lAnkle:       [0, 0, 0],
  rAnkle:       [0, 0, 0],
  lFoot:        [0, 0, 0],
  rFoot:        [0, 0, 0],
})

// 姿态映射表
export const POSE_MAP: Record<string, Record<string, THREE.Quaternion>> = {
  seated: P_STAND_Q,
  sprint: P_SPRINT_Q,
  climbing: P_CLIMBING_Q,
  aero: P_AERO_Q,
}

export const JOINT_NAMES = [
  'lowerTorso', 'upperTorso', 'head',
  'lShoulder', 'rShoulder', 'lElbow', 'rElbow',
  'lHipLeg', 'rHipLeg', 'lKnee', 'rKnee',
  'lAnkle', 'rAnkle', 'lFoot', 'rFoot',
] as const

export type JointName = typeof JOINT_NAMES[number]
