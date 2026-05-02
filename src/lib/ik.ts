export function solveIK2D(ty: number, tz: number, L1: number, L2: number) {
  const d = Math.sqrt(ty * ty + tz * tz)
  const total = L1 + L2
  if (d >= total * 0.998) {
    const a = Math.atan2(tz, ty)
    return { upper: a, lower: 0 }
  }
  const cd = Math.max(Math.abs(L1 - L2), Math.min(d, total * 0.998))
  const cosKnee = (L1 * L1 + L2 * L2 - cd * cd) / (2 * L1 * L2)
  const kneeInt = Math.acos(Math.max(-1, Math.min(1, cosKnee)))
  const cosAlpha = (L1 * L1 + cd * cd - L2 * L2) / (2 * L1 * cd)
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)))
  const targetAngle = Math.atan2(tz, ty)
  return {
    upper: targetAngle + alpha,
    lower: Math.PI - kneeInt,
  }
}

export const PEDAL_RADIUS = 0.17
export const PEDAL_Y_OFFSET = -0.42
export const PEDAL_Z_OFFSET = 0.06
