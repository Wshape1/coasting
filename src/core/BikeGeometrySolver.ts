import * as THREE from 'three';
import type { BikeParams, FramePoints, DerivedData } from '@/types/bike';

/**
 * Chain-derivation solver for bicycle frame geometry.
 * BB = (0,0,0) is the absolute origin.
 * Each step depends strictly on the previous step — no independent computation.
 */
export class BikeGeometrySolver {
  private p: BikeParams;
  pts!: FramePoints;
  wheelR!: number;
  private bbDropM!: number;
  private sta!: number;
  private hta!: number;
  private _derived!: DerivedData;

  constructor(params: BikeParams) {
    this.p = params;
  }

  solve(): { pts: FramePoints; derived: DerivedData } {
    this.wheelR = this.p.wheelDiameter / 2000;
    this.bbDropM = this.p.bbDrop / 1000;
    this.sta = THREE.MathUtils.degToRad(this.p.seatTubeAngle);
    this.hta = THREE.MathUtils.degToRad(this.p.headTubeAngle);

    this.pts = {} as FramePoints;

    // Step 1: Bottom Bracket — absolute origin
    this.pts.bb = new THREE.Vector3(0, 0, 0);

    // Step 2: Seat tube top (from BB at seat angle)
    this.pts.seatTop = this.calcSeatTop();

    // Step 3: Rear axle (from BB + chainstay)
    this.pts.rearAxle = this.calcRearAxle();

    // Step 4: Head tube top (from seatTop + topTubeLength)
    this.pts.htTop = this.calcHeadTubeTop();

    // Step 5: Head tube bottom (from htTop along head angle)
    this.pts.htBottom = this.calcHeadTubeBottom();

    // Step 6: Front axle (from htBottom to wheel axle height)
    this.pts.frontAxle = this.calcFrontAxle();

    // Step 7: Stem end (strictly from htTop + stem)
    this.pts.stemEnd = this.calcStemEnd();

    // Step 8: Seatpost top (from seatTop)
    this.pts.spTop = this.calcSeatpostTop();

    this._derived = this.computeDerived();
    return { pts: this.pts, derived: this._derived };
  }

  private calcSeatTop(): THREE.Vector3 {
    const L = this.p.seatTubeLength / 1000;
    return new THREE.Vector3(
      -L * Math.cos(this.sta),
      L * Math.sin(this.sta),
      0,
    );
  }

  private calcRearAxle(): THREE.Vector3 {
    return new THREE.Vector3(
      -(this.p.chainstayLength / 1000),
      this.bbDropM,
      0,
    );
  }

  private calcHeadTubeTop(): THREE.Vector3 {
    return new THREE.Vector3(
      this.pts.seatTop.x + this.p.topTubeLength / 1000,
      this.pts.seatTop.y,
      0,
    );
  }

  private calcHeadTubeBottom(): THREE.Vector3 {
    const L = this.p.headTubeLength / 1000;
    return new THREE.Vector3(
      this.pts.htTop.x + L * Math.cos(this.hta),
      this.pts.htTop.y - L * Math.sin(this.hta),
      0,
    );
  }

  private calcFrontAxle(): THREE.Vector3 {
    const axleY = this.bbDropM;
    const vertExt = this.pts.htBottom.y - axleY;
    const horizExt = vertExt / Math.tan(this.hta);
    return new THREE.Vector3(
      this.pts.htBottom.x + horizExt + this.p.forkOffset / 1000,
      axleY,
      0,
    );
  }

  private calcStemEnd(): THREE.Vector3 {
    return new THREE.Vector3(
      this.pts.htTop.x + this.p.stemLength / 1000,
      this.pts.htTop.y + 0.02,
      0,
    );
  }

  private calcSeatpostTop(): THREE.Vector3 {
    const L = this.p.seatpostExt / 1000;
    return new THREE.Vector3(
      this.pts.seatTop.x - L * Math.cos(this.sta),
      this.pts.seatTop.y + L * Math.sin(this.sta),
      0,
    );
  }

  private computeDerived(): DerivedData {
    const stack = this.pts.htTop.y - this.pts.bb.y;
    const reach = this.pts.htTop.x - this.pts.bb.x;
    const wheelbase = this.pts.frontAxle.x - this.pts.rearAxle.x;
    const stayLen = this.pts.seatTop.distanceTo(this.pts.rearAxle);
    const forkLen = this.pts.htBottom.distanceTo(this.pts.frontAxle);

    const groundY = this.bbDropM - this.wheelR;
    const distToGround = this.pts.htBottom.y - groundY;
    const steerGroundX = this.pts.htBottom.x + distToGround / Math.tan(this.hta);
    const trail = steerGroundX - this.pts.frontAxle.x;

    return { stack, reach, wheelbase, stayLen, forkLen, trail, wheelR: this.wheelR };
  }

  /** Format key points as a debug string (matches the HTML version's debug panel). */
  debugString(): string {
    const f = (v: number, d = 3) => v.toFixed(d);
    const p = this.pts;
    const d = this._derived;
    return [
      `BB:(${f(p.bb.x)},${f(p.bb.y)}) ST:(${f(p.seatTop.x)},${f(p.seatTop.y)})`,
      `HTt:(${f(p.htTop.x)},${f(p.htTop.y)}) HTb:(${f(p.htBottom.x)},${f(p.htBottom.y)})`,
      `FA:(${f(p.frontAxle.x)},${f(p.frontAxle.y)}) RA:(${f(p.rearAxle.x)},${f(p.rearAxle.y)})`,
      `Stem:(${f(p.stemEnd.x)},${f(p.stemEnd.y)})`,
      `S:${f(d.stack * 1000, 0)} R:${f(d.reach * 1000, 0)} WB:${f(d.wheelbase * 1000, 0)} Trail:${f(d.trail * 1000, 0)}mm`,
    ].join('\n');
  }
}
