import { useMemo } from 'react';
import * as THREE from 'three';
import type { FramePoints, DerivedData } from '@/types/bike';
import type { Materials } from '@/lib/materials';
import { tubeBetween, jointAt, _vA, _vB, _vC } from '@/lib/helpers';

interface BikeMeshProps {
  pts: FramePoints;
  derived: DerivedData;
  mats: Materials;
  barStyle: 'drop' | 'flat';
  tireWidth: number;
  crankLength: number;
  handlebarWidth: number;
  isMTB: boolean;
  crankRef: React.Ref<THREE.Group>;
  rearWheelRef: React.Ref<THREE.Group>;
  frontWheelRef: React.Ref<THREE.Group>;
}

// Shared reusable Vector3s for hot loops
const _sv = new THREE.Vector3();
const _ev = new THREE.Vector3();
const _pos = new THREE.Vector3();

// Pre-allocated spoke matrix/pos/quat/scale
const _spokeMatrix = new THREE.Matrix4();
const _spokePos = new THREE.Vector3();
const _spokeQuat = new THREE.Quaternion();
const _spokeScale = new THREE.Vector3();

export function BikeMesh({
  pts, derived, mats, barStyle, tireWidth, crankLength, handlebarWidth, isMTB,
  crankRef, rearWheelRef, frontWheelRef,
}: BikeMeshProps) {
  const { bb, seatTop, rearAxle, htTop, htBottom, frontAxle, stemEnd, spTop } = pts;

  const bikeParts = useMemo(() => {
    const parts: React.ReactElement[] = [];
    const add = (el: React.ReactElement) => parts.push(el);
    const key = (() => { let i = 0; return () => `p${i++}`; })();

    const tR = 0.022, sR = 0.011, ssR = 0.0085, fkR = 0.014, htR = 0.030;
    const csZ = 0.022, reZ = 0.014;

    // Main triangle
    add(<primitive key={key()} object={tubeBetween(bb, htBottom, tR, mats.frameMat)} />);
    add(<primitive key={key()} object={tubeBetween(bb, seatTop, tR * 1.12, mats.frameMat)} />);
    add(<primitive key={key()} object={tubeBetween(seatTop, htTop, tR * 0.92, mats.frameMat)} />);
    add(<primitive key={key()} object={tubeBetween(htBottom, htTop, htR, mats.frameMat)} />);

    // Rear triangle — reuse _sv, _ev
    for (const s of [-1, 1]) {
      _sv.set(bb.x, bb.y, s * csZ);
      _ev.set(rearAxle.x, rearAxle.y, s * reZ);
      add(<primitive key={key()} object={tubeBetween(_sv, _ev, sR, mats.frameMat)} />);
      _sv.set(seatTop.x, seatTop.y, s * csZ * 0.85);
      add(<primitive key={key()} object={tubeBetween(_sv, _ev, ssR, mats.frameMat)} />);
    }

    // Fork — reuse _sv, _ev, _vA
    for (const s of [-1, 1]) {
      _sv.set(htBottom.x, htBottom.y, s * 0.024);
      _ev.set(frontAxle.x, frontAxle.y, s * 0.017);
      if (isMTB) {
        _vA.addVectors(_sv, _ev).multiplyScalar(0.5);
        _vA.x += 0.015;
        add(<primitive key={key()} object={tubeBetween(_sv, _vA, fkR, mats.matComponent)} />);
        add(<primitive key={key()} object={tubeBetween(_vA, _ev, fkR * 0.9, mats.matComponent)} />);
      } else {
        add(<primitive key={key()} object={tubeBetween(_sv, _ev, fkR, mats.matComponent)} />);
      }
    }
    // Crown
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.028, 0.055), mats.matComponent);
    crown.position.copy(htBottom);
    crown.castShadow = true;
    add(<primitive key={key()} object={crown} />);

    // Brake calipers
    const brakeF = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.032), mats.matBrake);
    brakeF.position.set(htBottom.x - 0.01, htBottom.y - 0.03, 0);
    brakeF.castShadow = true;
    add(<primitive key={key()} object={brakeF} />);

    const brakeR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.028), mats.matBrake);
    brakeR.position.set(
      (seatTop.x + rearAxle.x) * 0.5 + 0.03,
      (seatTop.y + rearAxle.y) * 0.5 + 0.04, 0);
    brakeR.castShadow = true;
    add(<primitive key={key()} object={brakeR} />);

    // Joints
    const jR = 0.02;
    add(<primitive key={key()} object={jointAt(bb, jR, mats.frameMat)} />);
    add(<primitive key={key()} object={jointAt(seatTop, jR, mats.frameMat)} />);
    add(<primitive key={key()} object={jointAt(htTop, jR * 1.35, mats.frameMat)} />);
    add(<primitive key={key()} object={jointAt(htBottom, jR * 1.35, mats.frameMat)} />);
    for (const s of [-1, 1]) {
      _sv.set(rearAxle.x, rearAxle.y, s * reZ);
      add(<primitive key={key()} object={jointAt(_sv, jR * 0.7, mats.frameMat)} />);
    }

    // Seatpost + Saddle
    add(<primitive key={key()} object={tubeBetween(seatTop, spTop, 0.013, mats.matComponent)} />);
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.075), mats.matSaddle);
    saddle.position.copy(spTop).add(_vB.set(0, 0.016, 0));
    saddle.castShadow = true;
    add(<primitive key={key()} object={saddle} />);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.022, 0.045), mats.matSaddleNose);
    nose.position.copy(spTop).add(_vB.set(0.09, 0.008, 0));
    add(<primitive key={key()} object={nose} />);
    for (const s of [-1, 1]) {
      _sv.set(spTop.x - 0.03, spTop.y - 0.008, s * 0.018);
      _ev.set(spTop.x + 0.06, spTop.y - 0.008, s * 0.018);
      add(<primitive key={key()} object={tubeBetween(_sv, _ev, 0.004, mats.matComponent)} />);
    }

    // Stem + Handlebars
    add(<primitive key={key()} object={tubeBetween(htTop, stemEnd, 0.015, mats.matComponent)} />);
    const faceplate = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.025, 0.025), mats.matComponent);
    faceplate.position.copy(stemEnd);
    faceplate.castShadow = true;
    add(<primitive key={key()} object={faceplate} />);

    const barW = handlebarWidth / 1000;

    if (barStyle === 'drop') {
      const barY = stemEnd.y;
      const tb = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, barW), mats.matComponent);
      tb.position.set(stemEnd.x, barY, 0);
      tb.castShadow = true;
      add(<primitive key={key()} object={tb} />);

      for (const s of [-1, 1]) {
        const dH = 0.11;
        _sv.set(stemEnd.x, barY, s * barW * 0.42);
        _ev.set(stemEnd.x + 0.05, barY - dH * 0.30, s * barW * 0.46);
        _vA.set(stemEnd.x + 0.02, barY - dH, s * barW * 0.44);
        add(<primitive key={key()} object={tubeBetween(_sv, _ev, 0.011, mats.matComponent)} />);
        add(<primitive key={key()} object={tubeBetween(_ev, _vA, 0.010, mats.matComponent)} />);

        _vB.addVectors(_sv, _ev).multiplyScalar(0.5);
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.026, 0.026), mats.matGrip);
        hood.position.copy(_vB);
        hood.position.y += 0.013;
        hood.castShadow = true;
        add(<primitive key={key()} object={hood} />);
      }
    } else {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.016, barW), mats.matComponent);
      bar.position.set(stemEnd.x, stemEnd.y, 0);
      bar.castShadow = true;
      add(<primitive key={key()} object={bar} />);

      for (const s of [-1, 1]) {
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), mats.matGrip);
        grip.rotation.x = Math.PI / 2;
        grip.position.set(stemEnd.x, stemEnd.y, s * (barW / 2 + 0.015));
        grip.castShadow = true;
        add(<primitive key={key()} object={grip} />);
      }
    }

    // Chain
    const cassR = 0.032;
    const cass = new THREE.Mesh(new THREE.CylinderGeometry(cassR, cassR, 0.028, 12), mats.matChainring);
    cass.rotation.x = Math.PI / 2;
    cass.position.copy(rearAxle);
    cass.castShadow = true;
    add(<primitive key={key()} object={cass} />);

    // Segmented chain — reuse _pos for lerp
    for (const [s, e] of [
      [_sv.set(bb.x, bb.y + 0.082, 0).clone(), _ev.set(rearAxle.x, rearAxle.y + cassR, 0).clone()],
      [_vA.set(bb.x, bb.y - 0.082, 0).clone(), _vB.set(rearAxle.x, rearAxle.y - cassR, 0).clone()],
    ] as [THREE.Vector3, THREE.Vector3][]) {
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        _pos.lerpVectors(s, e, t);
        const mat = i % 2 === 0 ? mats.matChain : mats.matAccent;
        const link = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.003, 0.005), mat);
        link.position.copy(_pos);
        link.castShadow = true;
        add(<primitive key={key()} object={link} />);
      }
    }

    // Wheels
    const tw = tireWidth / 2000;
    const rearWheel = buildWheelGroup(rearAxle, derived.wheelR, tw, mats);
    const frontWheel = buildWheelGroup(frontAxle, derived.wheelR, tw, mats);
    add(<primitive key={key()} object={rearWheel} ref={rearWheelRef} />);
    add(<primitive key={key()} object={frontWheel} ref={frontWheelRef} />);

    // Crankset (separate group for rotation)
    const crankG = new THREE.Group();
    crankG.position.copy(bb);
    const crL = crankLength / 1000;

    [0.08, 0.06].forEach((r, i) => {
      const cr = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.007, 18), mats.matChainring);
      cr.rotation.x = Math.PI / 2;
      cr.position.z = i * 0.008;
      cr.castShadow = true;
      crankG.add(cr);
    });
    crankG.add(new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.003, 6, 24), mats.matChainring));

    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.08, 8), mats.matCrank);
    axle.rotation.x = Math.PI / 2;
    axle.castShadow = true;
    crankG.add(axle);

    // Right crank
    crankG.add(tubeBetween(
      _sv.set(0, 0, -0.020), _ev.set(0, -crL, -0.055), 0.013, mats.matCrank));
    const rPed = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.014, 0.032), mats.matPedal);
    rPed.position.set(0, -crL, -0.055);
    rPed.castShadow = true;
    crankG.add(rPed);

    // Left crank
    crankG.add(tubeBetween(
      _sv.set(0, 0, 0.020), _ev.set(0, crL, 0.055), 0.013, mats.matCrank));
    const lPed = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.014, 0.032), mats.matPedal);
    lPed.position.set(0, crL, 0.055);
    lPed.castShadow = true;
    crankG.add(lPed);

    add(<primitive key={key()} object={crankG} ref={crankRef} />);

    return parts;
  }, [pts, derived, mats, barStyle, tireWidth, crankLength, isMTB, crankRef, rearWheelRef, frontWheelRef]);

  return <group>{bikeParts}</group>;
}

// Wheel builder with InstancedMesh spokes (16 spokes → 1 draw call)
function buildWheelGroup(
  center: THREE.Vector3,
  radius: number,
  tireW: number,
  mats: Materials,
): THREE.Group {
  const g = new THREE.Group();
  g.position.copy(center);

  const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, tireW, 7, 36), mats.matTire);
  tire.castShadow = true;
  tire.receiveShadow = true;
  g.add(tire);

  g.add(new THREE.Mesh(new THREE.TorusGeometry(radius - 0.012, 0.007, 7, 36), mats.matRim));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(radius - 0.020, 0.005, 7, 32), mats.matRimInner));

  // InstancedMesh for spokes — 16 spokes as one draw call
  const hR = 0.022;
  const spokeLen = radius - hR;
  const spokeGeo = new THREE.CylinderGeometry(0.0012, 0.0012, spokeLen, 4);
  const spokeInstanced = new THREE.InstancedMesh(spokeGeo, mats.matSpoke, 16);
  spokeInstanced.castShadow = true;

  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const cx = Math.cos(ang);
    const cy = Math.sin(ang);
    const midX = cx * (hR + spokeLen * 0.5);
    const midY = cy * (hR + spokeLen * 0.5);

    _spokeMatrix.compose(
      _spokePos.set(midX, midY, 0),
      _spokeQuat.setFromUnitVectors(
        _vC.set(0, 1, 0),
        _spokePos.clone().normalize(),
      ),
      _spokeScale.set(1, 1, 1),
    );
    spokeInstanced.setMatrixAt(i, _spokeMatrix);
  }
  spokeInstanced.instanceMatrix.needsUpdate = true;
  g.add(spokeInstanced);

  // Hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.065, 8), mats.matHub);
  hub.rotation.x = Math.PI / 2;
  hub.castShadow = true;
  g.add(hub);
  for (const z of [-0.032, 0.032]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 8), mats.matHub);
    c.rotation.x = Math.PI / 2;
    c.position.z = z;
    g.add(c);
  }

  return g;
}
