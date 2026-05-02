import type * as THREE from 'three'

export interface HumanMeasurements {
  height: number   // m, 1.40-2.10
  inseam: number   // m, 0.55-1.05
  armScale: number  // 0.6-1.5
  legScale: number  // 0.6-1.5
  torsoScl: number // 0.6-1.5
}

export type AnimationMode = 'idle' | 'pedaling' | 'walking'

export interface BoneEntry {
  name: string
  bone: THREE.Bone
  parent: THREE.Bone | null
  children: THREE.Bone[]
  len: number
  mesh: THREE.Mesh | null
}
