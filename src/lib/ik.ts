/**
 * 双骨骼 2D IK 求解器。
 * 在 YZ 平面上求解：上段(大腿/上臂)从原点出发沿 +Y，目标在 (ty, tz)。
 * ty = 目标 Y 分量（正=上方，负=下方）
 * tz = 目标 Z 分量（正=前方）
 *
 * 返回两个角度，用于 THREE.Euler 的 X 分量（YXZ 顺序）：
 * - upper: 上段骨骼的 X 旋转角
 * - lower: 下段骨骼的 X 旋转角
 *
 * 当标准解（upper > π）导致肢体向后弯曲时，自动切换到替代配置。
 */
export function solveIK2D(ty: number, tz: number, L1: number, L2: number) {
  const d = Math.sqrt(ty * ty + tz * tz)
  const total = L1 + L2

  // 目标过远：完全伸直指向目标
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

  const upper = targetAngle + alpha

  // 标准解读 upper > π 意味着上段骨骼会指向后方（超过竖直向下）。
  // 此时切换到替代配置：膝盖向反方向弯曲，保持肢体指向前方。
  if (upper > Math.PI && targetAngle - alpha > 0) {
    return {
      upper: targetAngle - alpha,
      lower: kneeInt - Math.PI, // 负值 = 反向弯曲
    }
  }

  return {
    upper,
    lower: Math.PI - kneeInt,
  }
}
