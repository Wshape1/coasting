import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useBikeStore } from '@/store/useBikeStore'
import { P_STAND_Q, blendPoseQ, clonePose, JOINT_NAMES } from '@/lib/pose'
import { solveIK2D, PEDAL_RADIUS, PEDAL_Y_OFFSET, PEDAL_Z_OFFSET } from '@/lib/ik'
import { mkMat } from '@/lib/helpers'
import type { BoneEntry } from '@/types/human'

// ─── Materials (PBR, matching bike project) ───
const M_SKIN  = mkMat('#E8C8A8', 0.55, 0.02)
const M_JOINT = mkMat('#9B6B3D', 0.40, 0.05)
const M_SHIRT = mkMat('#5B8FA8', 0.30, 0.02)
const M_PANTS = mkMat('#3D3D4D', 0.25, 0.02)
const M_SHOE  = mkMat('#1A1A1A', 0.40, 0.05)

// ─── Body dimensions in meters (converted from cm) ───
const D = {
  headR: 0.10,
  lowTorso: 0.23,
  upTorso: 0.27,
  upperArm: 0.30,
  lowerArm: 0.26,
  upperLeg: 0.42,
  lowerLeg: 0.40,
  hand: 0.08,
  ankleH: 0.06,
  shoulderW: 0.15,
  hipW: 0.13,
}

// ─── Geometry helpers (bottom-origin, matching bike helpers convention) ───
function cyl(rt: number, rb: number, h: number, seg = 8) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1)
  g.translate(0, h / 2, 0)
  return g
}
function box(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(0, h / 2, 0)
  return g
}

// ─── Module-level bone registry ───
const bones: Record<string, THREE.Bone> = {}
const segs: { mesh: THREE.Mesh; bone: THREE.Bone; baseLen: number; group: string }[] = []
const boneList: BoneEntry[] = []
const boneByName: Record<string, BoneEntry> = {}

function registerBone(name: string, bone: THREE.Bone, parent: THREE.Bone | null, mesh: THREE.Mesh | null) {
  const entry: BoneEntry = { name, bone, parent, children: [], len: 0, mesh }
  boneList.push(entry)
  boneByName[name] = entry
  if (parent) {
    const pe = boneList.find(b => b.bone === parent)
    if (pe) pe.children.push(bone)
  }
}

function computeBoneLengths() {
  for (const entry of boneList) {
    if (!entry.parent) continue
    const cp = new THREE.Vector3(); entry.bone.getWorldPosition(cp)
    const pp = new THREE.Vector3(); entry.parent.getWorldPosition(pp)
    entry.len = cp.distanceTo(pp)
  }
}

function addSegment(
  parent: THREE.Bone,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  len: number,
  grp: string,
  jr = 0
) {
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true; m.receiveShadow = true
  parent.add(m)
  const childBone = new THREE.Bone()
  childBone.position.y = len
  parent.add(childBone)
  if (jr > 0) {
    const jm = new THREE.Mesh(new THREE.IcosahedronGeometry(jr, 1), M_JOINT)
    jm.castShadow = true; childBone.add(jm)
  }
  segs.push({ mesh: m, bone: childBone, baseLen: len, group: grp })
  return { mesh: m, bone: childBone, baseLen: len }
}

function buildCharacter(hipsBone: THREE.Bone) {
  segs.length = 0; boneList.length = 0
  for (const k of Object.keys(boneByName)) delete boneByName[k]
  for (const k of Object.keys(bones)) delete bones[k]
  hipsBone.clear()

  // Torso
  const lt = addSegment(hipsBone, box(D.shoulderW - 0.03, D.lowTorso, 0.085), M_SHIRT, D.lowTorso, 'torso')
  bones.lowerTorso = lt.bone; registerBone('lowerTorso', lt.bone, hipsBone, lt.mesh)
  const ut = addSegment(lt.bone, box(D.shoulderW - 0.02, D.upTorso, 0.08), M_SHIRT, D.upTorso, 'torso')
  bones.upperTorso = ut.bone; registerBone('upperTorso', ut.bone, lt.bone, ut.mesh)

  // Head
  const headBone = new THREE.Bone()
  headBone.position.y = 0; ut.bone.add(headBone)
  const hm = new THREE.Mesh(new THREE.IcosahedronGeometry(D.headR, 1), M_SKIN)
  hm.position.y = D.headR; hm.castShadow = true; headBone.add(hm)
  bones.head = headBone; registerBone('head', headBone, ut.bone, hm)

  // Arms
  function arm(sign: number) {
    const shBone = new THREE.Bone()
    shBone.position.set(sign * D.shoulderW / 2, -D.upTorso * 0.12, 0)
    ut.bone.add(shBone)
    shBone.rotation.set(Math.PI, 0, sign * (-0.06))
    const ua = addSegment(shBone, cyl(0.028, 0.024, D.upperArm, 8), M_SKIN, D.upperArm, 'arm', 0.025)
    const elBone = ua.bone; elBone.rotation.set(0.06, 0, sign * 0.02)
    const la = addSegment(elBone, cyl(0.024, 0.020, D.lowerArm, 8), M_SKIN, D.lowerArm, 'arm', 0.020)
    const handBone = new THREE.Bone()
    handBone.position.y = 0; la.bone.add(handBone)
    handBone.add(new THREE.Mesh(box(0.026, D.hand, 0.022), M_SKIN))
    return { shoulder: shBone, elbow: elBone, hand: handBone }
  }

  const LA = arm(-1), RA = arm(1)
  bones.lShoulder = LA.shoulder; bones.rShoulder = RA.shoulder
  bones.lElbow = LA.elbow; bones.rElbow = RA.elbow
  bones.lHand = LA.hand; bones.rHand = RA.hand
  registerBone('lShoulder', LA.shoulder, ut.bone, null)
  registerBone('rShoulder', RA.shoulder, ut.bone, null)
  registerBone('lElbow', LA.elbow, LA.shoulder, null)
  registerBone('rElbow', RA.elbow, RA.shoulder, null)
  registerBone('lHand', LA.hand, LA.elbow, null)
  registerBone('rHand', RA.hand, RA.elbow, null)

  // Legs
  function leg(sign: number) {
    const hlBone = new THREE.Bone()
    hlBone.position.set(sign * D.hipW / 2, 0, 0); hipsBone.add(hlBone)
    hlBone.rotation.set(Math.PI, 0, sign * (-0.02))
    const ul = addSegment(hlBone, cyl(0.042, 0.034, D.upperLeg, 8), M_PANTS, D.upperLeg, 'leg', 0.036)
    const knBone = ul.bone; knBone.rotation.set(-0.03, 0, 0)
    const ll = addSegment(knBone, cyl(0.034, 0.026, D.lowerLeg, 8), M_PANTS, D.lowerLeg, 'leg', 0.028)
    const footBone = new THREE.Bone()
    footBone.position.y = 0; ll.bone.add(footBone)
    const ftm = new THREE.Mesh(box(0.034, D.ankleH, 0.09), M_SHOE)
    ftm.position.z = 0.03; ftm.castShadow = true; ftm.receiveShadow = true; footBone.add(ftm)
    return { hip: hlBone, knee: knBone, ankle: ll.bone, foot: footBone }
  }

  const LL = leg(-1), RL = leg(1)
  bones.lHipLeg = LL.hip; bones.rHipLeg = RL.hip
  bones.lKnee = LL.knee; bones.rKnee = RL.knee
  bones.lAnkle = LL.ankle; bones.rAnkle = RL.ankle
  bones.lFoot = LL.foot; bones.rFoot = RL.foot
  registerBone('lHipLeg', LL.hip, hipsBone, null)
  registerBone('rHipLeg', RL.hip, hipsBone, null)
  registerBone('lKnee', LL.knee, LL.hip, null)
  registerBone('rKnee', RL.knee, RL.hip, null)
  registerBone('lAnkle', LL.ankle, LL.knee, null)
  registerBone('rAnkle', RL.ankle, RL.knee, null)
  registerBone('lFoot', LL.foot, LL.ankle, null)
  registerBone('rFoot', RL.foot, RL.ankle, null)
}

function applyMeasurements(
  m: { height: number; weight: number; inseam: number; armScale: number; legScale: number; torsoScl: number },
  hipsBone: THREE.Bone
) {
  const hScl = m.height / 1.70
  const iScl = m.inseam / 0.80
  hipsBone.position.y = m.inseam + D.ankleH * hScl

  // Width scale from weight and height (BMI-based)
  const expectedWeight = 22.5 * (m.height * m.height)
  const wScl = Math.sqrt(m.weight / expectedWeight)

  const scales: Record<string, number> = {
    torso: m.torsoScl,
    leg: iScl * m.legScale,
    arm: m.armScale,
  }
  for (const s of segs) {
    const sc = (scales[s.group] ?? 1) * hScl
    s.mesh.scale.y = sc
    s.mesh.scale.x = wScl
    s.mesh.scale.z = wScl
    s.bone.position.y = s.baseLen * sc
  }
  computeBoneLengths()
}

export function HumanModel() {
  const hipsBone = useMemo(() => new THREE.Bone(), [])
  const currentQ = useRef(clonePose(P_STAND_Q)).current
  const phaseRef = useRef({ pedal: 0, walk: 0 })
  const tRef = useRef(0)
  const isAnimating = useBikeStore((s) => s.isAnimating)
  const showHuman = useBikeStore((s) => s.showHuman)
  const height = useBikeStore((s) => s.height)
  const weight = useBikeStore((s) => s.weight)
  const inseam = useBikeStore((s) => s.inseam)
  const armScale = useBikeStore((s) => s.armScale)
  const legScale = useBikeStore((s) => s.legScale)
  const torsoScl = useBikeStore((s) => s.torsoScl)
  const built = useRef(false)

  // Build once
  useEffect(() => {
    if (built.current) return
    built.current = true
    buildCharacter(hipsBone)
    applyMeasurements({ height: 1.70, weight: 72, inseam: 0.80, armScale: 1.0, legScale: 1.0, torsoScl: 1.0 }, hipsBone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-apply measurements
  useEffect(() => {
    if (!built.current) return
    applyMeasurements({
      height: height / 100,
      weight,
      inseam: inseam / 100,
      armScale,
      legScale,
      torsoScl,
    }, hipsBone)
  }, [height, weight, inseam, armScale, legScale, torsoScl, hipsBone])

  useFrame((_, dt) => {
    const safeDt = Math.min(dt, 0.1)
    const t = (tRef.current += safeDt)
    const animMode = isAnimating ? 'pedaling' : 'idle' as const

    blendPoseQ(currentQ, P_STAND_Q, 1 - Math.exp(-5 * safeDt))

    // Apply standing pose to all bones
    for (const name of JOINT_NAMES) {
      const q = currentQ[name]
      const b = bones[name]
      if (q && b) b.quaternion.copy(q)
    }

    if (animMode === 'pedaling') {
      phaseRef.current.pedal += Math.PI * 2 * safeDt
      const ph = phaseRef.current.pedal
      const lLen = boneByName['lKnee']?.len || D.upperLeg
      const rLen = boneByName['rKnee']?.len || D.upperLeg
      const lLen2 = boneByName['lAnkle']?.len || D.lowerLeg
      const rLen2 = boneByName['rAnkle']?.len || D.lowerLeg
      const lIK = solveIK2D(
        PEDAL_Y_OFFSET + Math.cos(ph) * PEDAL_RADIUS,
        PEDAL_Z_OFFSET + Math.sin(ph) * PEDAL_RADIUS, lLen, lLen2)
      const rIK = solveIK2D(
        PEDAL_Y_OFFSET + Math.cos(ph + Math.PI) * PEDAL_RADIUS,
        PEDAL_Z_OFFSET + Math.sin(ph + Math.PI) * PEDAL_RADIUS, rLen, rLen2)
      bones.lHipLeg?.quaternion.setFromEuler(new THREE.Euler(lIK.upper, 0, 0.03, 'YXZ'))
      bones.rHipLeg?.quaternion.setFromEuler(new THREE.Euler(rIK.upper, 0, -0.03, 'YXZ'))
      bones.lKnee?.quaternion.setFromEuler(new THREE.Euler(lIK.lower, 0, 0, 'YXZ'))
      bones.rKnee?.quaternion.setFromEuler(new THREE.Euler(rIK.lower, 0, 0, 'YXZ'))
    } else {
      // Idle sway
      const sw = Math.sin(t * 1.3) * 0.012
      const br = Math.sin(t * 2.1) * 0.008
      bones.lowerTorso?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(br, 0, sw)))
      bones.head?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(br * 0.4 + sw * 0.2, 0, 0)))
    }
  })

  if (!showHuman) return null
  return <primitive object={hipsBone} />
}
