import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useBikeStore } from '@/store/useBikeStore'
import { P_STAND_Q, blendPoseQ, clonePose, JOINT_NAMES } from '@/lib/pose'
import { mkMat } from '@/lib/helpers'
import { BikeGeometrySolver } from '@/core/BikeGeometrySolver'
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
  m: { height: number; weight: number; inseam: number; armSpan: number; shoulderWidth: number; legScale: number; torsoScl: number },
  hipsBone: THREE.Bone
) {
  const heightM = m.height
  const hScl = heightM / 1.70
  const iScl = m.inseam / 0.80
  // 上半身参考长度 = 身高 - 跨高（参考值 1.70 - 0.80 = 0.90）
  const upperRef = 1.70 - 0.80
  const upperScl = (heightM - m.inseam) / upperRef
  hipsBone.position.y = m.inseam + D.ankleH * hScl

  // Width scale from weight and height (BMI-based)
  const expectedWeight = 22.5 * (heightM * heightM)
  const wScl = Math.sqrt(m.weight / expectedWeight)

  // Y 缩放：腿长 ∝ 跨高，躯干 ∝ (身高-跨高)
  // 臂展 → 单臂长 = (臂展 - 肩宽) / 2，参考臂长 0.56m
  const armLenM = ((m.armSpan - m.shoulderWidth) / 2) / 100;
  const armScale = Math.max(0.4, armLenM / 0.56);

  const scales: Record<string, number> = {
    torso: upperScl,
    leg: iScl,
    arm: armScale,
  }

  // 肩宽 → 躯干 X 缩放（参考肩宽 41cm）
  const shoulderScale = m.shoulderWidth / 41;
  for (const s of segs) {
    const sc = scales[s.group] ?? 1
    s.mesh.scale.y = sc
    s.mesh.scale.x = wScl * (s.group === 'torso' ? shoulderScale : 1)
    s.mesh.scale.z = wScl
    s.bone.position.y = s.baseLen * sc
  }
  computeBoneLengths()
}

export function HumanModel() {
  const hipsBone = useMemo(() => new THREE.Bone(), [])
  const groupRef = useRef<THREE.Group>(null)
  const currentQ = useRef(clonePose(P_STAND_Q)).current
  const phaseRef = useRef({ pedal: 0, walk: 0 })
  const tRef = useRef(0)
  const isAnimating = useBikeStore((s) => s.isAnimating)
  const showHuman = useBikeStore((s) => s.showHuman)
  const height = useBikeStore((s) => s.height)
  const weight = useBikeStore((s) => s.weight)
  const inseam = useBikeStore((s) => s.inseam)
  const armSpan = useBikeStore((s) => s.armSpan)
  const shoulderWidth = useBikeStore((s) => s.shoulderWidth)
  const legScale = useBikeStore((s) => s.legScale)
  const torsoScl = useBikeStore((s) => s.torsoScl)
  const currentParams = useBikeStore((s) => s.currentParams)
  const built = useRef(false)

  // Build once
  useEffect(() => {
    if (built.current) return
    built.current = true
    buildCharacter(hipsBone)
    applyMeasurements({ height: 1.70, weight: 72, inseam: 0.80, armSpan: 170, shoulderWidth: 41, legScale: 1.0, torsoScl: 1.0 }, hipsBone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-apply measurements
  useEffect(() => {
    if (!built.current) return
    applyMeasurements({
      height: height / 100,
      weight,
      inseam: inseam / 100,
      armSpan,
      shoulderWidth,
      legScale,
      torsoScl,
    }, hipsBone)
  }, [height, weight, inseam, armSpan, shoulderWidth, legScale, torsoScl, hipsBone])

  useFrame((_, dt) => {
    const safeDt = Math.min(dt, 0.1)
    const t = (tRef.current += safeDt)
    const animMode = isAnimating ? 'pedaling' : 'idle' as const

    const shouldLog = false
    // 调试开关：Math.floor(t) !== lastLogT.current

    // ── 1. 计算车架几何 ──
    const solver = new BikeGeometrySolver(currentParams)
    const { pts } = solver.solve()

    // ── 2. 人物定位：臀部靠近坐垫 ──
    const saddleWorld = new THREE.Vector3(0, 0.35 + pts.spTop.y, pts.spTop.x)
    const barWorld = new THREE.Vector3(0, 0.35 + pts.stemEnd.y, pts.stemEnd.x)
    if (groupRef.current) {
      groupRef.current.position.lerpVectors(saddleWorld, barWorld, 0.1)
    }
    // 臀部直接坐到坐垫上（负值下沉）
    hipsBone.position.set(0, 0.03, 0)

    // 【关键】强制更新骨骼世界矩阵，确保后续 IK 使用的局部坐标正确。
    // updateWorldMatrix(true, true) = 遍历父级和子级，全部刷新。
    hipsBone.updateWorldMatrix(true, true)

    // ── 3. 脚踏相位与踏板世界坐标 ──
    if (animMode === 'pedaling') {
      phaseRef.current.pedal -= (80 / 60) * Math.PI * 2 * safeDt
    }
    const ph = phaseRef.current.pedal
    const crankLen = (currentParams.crankLength || 172) / 1000
    const pedalLat = 0.055

    const rPedalWorld = new THREE.Vector3(
      pedalLat, 0.35 - crankLen * Math.cos(ph), crankLen * Math.sin(ph),
    )
    const lPedalWorld = new THREE.Vector3(
      -pedalLat, 0.35 + crankLen * Math.cos(ph), -crankLen * Math.sin(ph),
    )

    // ── 4. 获取骨骼长度 ──
    const lLen = boneByName['lKnee']?.len || D.upperLeg
    const rLen = boneByName['rKnee']?.len || D.upperLeg
    const lLen2 = boneByName['lAnkle']?.len || D.lowerLeg
    const rLen2 = boneByName['rAnkle']?.len || D.lowerLeg

    if (shouldLog) {
      console.log(`[IK] boneLengths: lLen=${lLen.toFixed(3)} rLen=${rLen.toFixed(3)} lLen2=${lLen2.toFixed(3)} rLen2=${rLen2.toFixed(3)}`)
      console.log(`[IK] rPedalWorld=(x:${rPedalWorld.x.toFixed(3)},y:${rPedalWorld.y.toFixed(3)},z:${rPedalWorld.z.toFixed(3)})`)
      console.log(`[IK] lPedalWorld=(x:${lPedalWorld.x.toFixed(3)},y:${lPedalWorld.y.toFixed(3)},z:${lPedalWorld.z.toFixed(3)})`)
    }

    // ── 5. 开始混合站立姿态（后续 IK 会覆盖腿部关节）──
    blendPoseQ(currentQ, P_STAND_Q, 1 - Math.exp(-5 * safeDt))

    // ── 6. 3D 双骨骼 IK 求解器 ──
    // 先外展（Z 旋转）让腿的弯曲平面包含目标，再屈伸（X 旋转）让腿踢向目标
    function solveLegIK3D(
      hipBone: THREE.Bone | undefined,
      kneeBone: THREE.Bone | undefined,
      pedalLocal: THREE.Vector3, // 在 hipsBone 局部空间中
      upperLen: number,
      lowerLen: number,
    ) {
      if (!hipBone || !kneeBone) return

      // 髋关节在 hipsBone 空间中的位置
      const hipLocal = hipBone.position.clone()
      // 脚踏相对髋关节的偏移
      const rel = new THREE.Vector3().subVectors(pedalLocal, hipLocal)

      const dist = rel.length()
      const maxLen = upperLen + lowerLen
      const effDist = Math.min(dist, maxLen * 0.997)

      // --- 步骤 A：外展角（Z 旋转）---
      const abduct = Math.atan2(rel.x, -rel.y)

      // --- 步骤 B：余弦定理计算弯曲角度 ---
      const cosKnee = (upperLen * upperLen + lowerLen * lowerLen - effDist * effDist)
        / (2 * upperLen * lowerLen)
      const kneeAngle = Math.acos(Math.max(-1, Math.min(1, cosKnee)))

      const cosHip = (upperLen * upperLen + effDist * effDist - lowerLen * lowerLen)
        / (2 * upperLen * effDist)
      const hipOffset = Math.acos(Math.max(-1, Math.min(1, cosHip)))

      // --- 步骤 C：统一 IK 配置，膝盖始终朝前弯（靠近车头）---
      const targetAngle = Math.atan2(-rel.z, -rel.y)
      const hipAngle = Math.PI + targetAngle + hipOffset

      // 膝盖始终向前弯曲，不切换配置，避免跳变
      const kneeBend = kneeAngle - Math.PI

      if (shouldLog) {
        const side = hipLocal.x < 0 ? 'L' : 'R'
        console.log(`[IK:${side}] rel=(x:${rel.x.toFixed(3)},y:${rel.y.toFixed(3)},z:${rel.z.toFixed(3)})`,
          `dist=${dist.toFixed(3)} max=${maxLen.toFixed(3)} eff=${effDist.toFixed(3)}`,
          `upperLen=${upperLen.toFixed(3)} lowerLen=${lowerLen.toFixed(3)}`,
          `tgt=${(targetAngle*57.3).toFixed(1)}° hip=${(hipAngle*57.3).toFixed(1)}°`,
          `knee=${(kneeAngle*57.3).toFixed(1)}° kneeBend=${(kneeBend*57.3).toFixed(1)}° abd=${(abduct*57.3).toFixed(1)}°`)
      }

      hipBone.quaternion.setFromEuler(
        new THREE.Euler(hipAngle, 0, abduct, 'YXZ'),
      )
      kneeBone.quaternion.setFromEuler(
        new THREE.Euler(kneeBend, 0, 0, 'YXZ'),
      )
    }

    // ── 7. 将世界脚踏坐标转为 hipsBone 局部空间 ──
    // hipsBone.matrixWorld 已经在 updateWorldMatrix 之后是最新的
    const hipsMatrixInv = new THREE.Matrix4().copy(hipsBone.matrixWorld).invert()
    const rPedalLocal = rPedalWorld.clone().applyMatrix4(hipsMatrixInv)
    const lPedalLocal = lPedalWorld.clone().applyMatrix4(hipsMatrixInv)

    // 按 X 符号匹配：lHipLeg 在 -X → 用 X 为负的脚踏；rHipLeg 在 +X → 用 X 为正的脚踏
    solveLegIK3D(bones.lHipLeg, bones.lKnee,
      lPedalLocal.x < rPedalLocal.x ? lPedalLocal : rPedalLocal, lLen, lLen2)
    solveLegIK3D(bones.rHipLeg, bones.rKnee,
      rPedalLocal.x > lPedalLocal.x ? rPedalLocal : lPedalLocal, rLen, rLen2)

    // ── 8. 非腿部关节使用站立姿态 ──
    for (const name of JOINT_NAMES) {
      if (name.startsWith('lHip') || name.startsWith('rHip') ||
          name.startsWith('lKnee') || name.startsWith('rKnee')) continue
      const q = currentQ[name]
      const b = bones[name]
      if (q && b) b.quaternion.copy(q)
    }

    // ── 9. 闲时摇摆 ──
    if (animMode === 'idle') {
      const sw = Math.sin(t * 1.3) * 0.012
      const br = Math.sin(t * 2.1) * 0.008
      bones.lowerTorso?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(br, 0, sw)))
      bones.head?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(br * 0.4 + sw * 0.2, 0, 0)))
    }

    // ── 10. 上半身骑行姿态：躯干前倾 + 手臂 IK 握把 ──
    // 前倾缩小肩-车把距离，使手臂能自然够到车把
    bones.lowerTorso?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.75, 0, 0, 'YXZ')))
    bones.upperTorso?.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0, 'YXZ')))
    // step 8-9 修改了骨骼 quaternion，需刷新矩阵
    hipsBone.updateWorldMatrix(true, true)

    // 手臂 IK：肩→肘→手，目标 = 车把（barWorld 已在 step 2 定义）
    function solveArmIK(
      shoulderBone: THREE.Bone | undefined,
      elbowBone: THREE.Bone | undefined,
      targetLocal: THREE.Vector3,
      upperLen: number,
      lowerLen: number,
    ) {
      if (!shoulderBone || !elbowBone) return
      const shLocal = shoulderBone.position.clone()
      const rel = new THREE.Vector3().subVectors(targetLocal, shLocal)
      const dist = rel.length()
      const maxLen = upperLen + lowerLen
      const effDist = Math.min(dist, maxLen * 0.997)

      // 外展角：暂设为 0，靠目标位置分开双手
      const abduct = 0
      const cosElbow = (upperLen * upperLen + lowerLen * lowerLen - effDist * effDist)
        / (2 * upperLen * lowerLen)
      const elbowAngle = Math.acos(Math.max(-1, Math.min(1, cosElbow)))
      const cosSh = (upperLen * upperLen + effDist * effDist - lowerLen * lowerLen)
        / (2 * upperLen * effDist)
      const shOffset = Math.acos(Math.max(-1, Math.min(1, cosSh)))
      const targetAngle = Math.atan2(-rel.z, -rel.y)
      const shAngle = Math.PI + targetAngle - shOffset

      const elbowBend = Math.PI - elbowAngle

      if (shouldLog) {
        const side = shoulderBone === bones.lShoulder ? 'L' : 'R'
        console.log(`[IK:${side}Arm] rel=(x:${rel.x.toFixed(3)},y:${rel.y.toFixed(3)},z:${rel.z.toFixed(3)})`,
          `dist=${dist.toFixed(3)} max=${maxLen.toFixed(3)}`,
          `tgt=${(targetAngle*57.3).toFixed(1)}° off=${(shOffset*57.3).toFixed(1)}° sh=${(shAngle*57.3).toFixed(1)}°`,
          `elbow=${(elbowAngle*57.3).toFixed(1)}° abd=${(abduct*57.3).toFixed(1)}°`)
      }

      shoulderBone.quaternion.setFromEuler(new THREE.Euler(shAngle, 0, abduct, 'YXZ'))
      elbowBone.quaternion.setFromEuler(new THREE.Euler(elbowBend, 0, 0, 'YXZ'))
    }

    // 获取车把在 upperTorso 局部空间的坐标（肩关节的父级，已含前倾）
    if (!bones.upperTorso) return
    const upperTorsoInv = new THREE.Matrix4().copy(bones.upperTorso.matrixWorld).invert()
    const barUpperLocal = barWorld.clone().applyMatrix4(upperTorsoInv)
    const lArmLen = boneByName['lElbow']?.len || D.upperArm
    const rArmLen = boneByName['rElbow']?.len || D.upperArm
    const lForeLen = boneByName['lHand']?.len || D.lowerArm
    const rForeLen = boneByName['rHand']?.len || D.lowerArm
    // 车把宽约 420mm，每侧偏移
    const gripOffset = 0.28

    solveArmIK(bones.lShoulder, bones.lElbow,
      new THREE.Vector3(barUpperLocal.x + gripOffset, barUpperLocal.y, barUpperLocal.z), lArmLen, lForeLen)
    solveArmIK(bones.rShoulder, bones.rElbow,
      new THREE.Vector3(barUpperLocal.x - gripOffset, barUpperLocal.y, barUpperLocal.z), rArmLen, rForeLen)
  })

  if (!showHuman) return null
  return (
    <>
      <group ref={groupRef} rotation={[0, Math.PI, 0]}>
        <primitive object={hipsBone} />
      </group>
      <SkeletonDebug />
    </>
  )
}

function SkeletonDebug() {
  const show = useBikeStore((s) => s.showDebug)
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!ref.current) return
    ref.current.visible = show
    if (!show) return

    const g = ref.current
    g.clear()

    for (const entry of boneList) {
      if (!entry.parent) continue
      const a = new THREE.Vector3()
      const b = new THREE.Vector3()
      entry.parent.getWorldPosition(a)
      entry.bone.getWorldPosition(b)
      const len = a.distanceTo(b)
      if (len > 0.001) {
        const geo = new THREE.BufferGeometry().setFromPoints([a, b])
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#ff4444', transparent: true, opacity: 0.8 }))
        g.add(line)
        const sp = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), new THREE.MeshBasicMaterial({ color: '#ff6666' }))
        sp.position.copy(a)
        g.add(sp)
      }
    }
    for (const entry of boneList) {
      const p = new THREE.Vector3()
      entry.bone.getWorldPosition(p)
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), new THREE.MeshBasicMaterial({ color: '#ff8888' }))
      sp.position.copy(p)
      g.add(sp)
    }
  })

  return <group ref={ref} />
}
