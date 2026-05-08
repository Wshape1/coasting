/**
 * 姿态分析模块 - 基于权威自行车fitting公式
 *
 * 核心参考文献：
 * - Gatti et al. (2022) - 基于关节角度的坐垫高度精确方程
 * - Millour et al. (2019) - 不同体型的坐垫高度方法比较
 * - Swart & Holliday (2019) - 自行车生物力学优化综述
 * - Hsiao & Chou (2015) - 骑行姿势优化
 * - Muthiah et al. (2022) - 亚洲骑行者人体测量对比
 * - Priego-Quesada et al. (2024) - 德尔菲专家共识
 * - Peveler et al. (2005) - 坐垫高度设置方法比较
 * - Mauch et al. (2009) - 精英车手坐垫高度评估
 */

import type { BikeParams } from '@/types/bike';

export interface BodyMeasurements {
  height: number;      // cm
  weight: number;      // kg
  inseam: number;      // cm
  armSpan: number;     // cm
  shoulderWidth: number; // cm
  legScale?: number;   // 腿长比例 (可选)
  torsoScl?: number;   // 躯干比例 (可选)
}

export type PoseType = 'seated' | 'sprint' | 'climbing' | 'aero';

export interface PoseAnalysisResult {
  overallScore: number;           // 总体匹配度 0-100
  saddleHeightFit: number;        // 坐垫高度匹配度 0-100
  reachFit: number;               // 前伸量匹配度 0-100
  stackFit: number;               // 堆高匹配度 0-100
  torsoAngle: number;             // 预估躯干角度 (度)
  kneeFlexion: number;            // 预估膝关节屈曲角度 (度)
  hipAngle: number;               // 预估髋关节角度 (度)
  powerEfficiency: number;        // 功率效率评分 0-100
  comfortScore: number;           // 舒适度评分 0-100
  aeroScore: number;              // 气动性评分 0-100
  flexibilityDemand: number;      // 柔韧性需求 0-100
  saddleHeightMethod: string;     // 使用的坐垫高度计算方法
  issues: string[];               // 潜在问题
  recommendations: string[];      // 建议
  poseDescription: string;        // 姿态描述
}

// ============================================================
// 权威fitting常量与参考值
// ============================================================
const FITTING_CONSTANTS = {
  // ── 坐垫高度公式系数 ──
  // LeMond法 (Mauch et al., 2009 验证)
  LEMOND_FACTOR: 0.883,
  // Hamley法 (适合短腿人群，Millour et al., 2019)
  HAMLEY_FACTOR: 1.09,
  // Genzling法 (适合长腿人群，Millour et al., 2019)
  GENZLING_FACTOR: 0.885,
  // 东亚人修正系数 (Muthiah et al., 2022)
  ASIAN_CORRECTION: 0.99,

  // ── Gatti et al. (2022) 精确方程系数 ──
  // 基于最小膝屈角的方程
  GATTI_MIN_KNEE: { intercept: 7.41, inseam: 0.82, kneeAngle: -0.1, interaction: 0.003 },
  // 基于最大膝屈角的方程
  GATTI_MAX_KNEE: { intercept: 41.63, inseam: 0.78, kneeAngle: -0.25, interaction: 0.002 },

  // ── 膝关节角度范围 ──
  // Swart & Holliday (2019) 动态评估
  KNEE_FLEXION: {
    lowIntensity: { min: 33, max: 43, ideal: 38 },   // 低强度
    highIntensity: { min: 30, max: 40, ideal: 33 },   // 高强度
    injury: { min: 25, max: 35 },                      // 损伤预防 (Holmes法)
  },

  // ── 躯干角度参考 (Hsiao & Chou, 2015) ──
  TORSO_ANGLE: {
    average: { mean: 38, std: 5 },                     // 平均躯干角
    seated: { min: 40, max: 55, ideal: 45 },
    endurance: { min: 45, max: 60, ideal: 50 },
    climbing: { min: 50, max: 65, ideal: 55 },
    sprint: { min: 25, max: 40, ideal: 30 },
    aero: { min: 15, max: 25, ideal: 20 },
  },

  // ── Stack/Reach比例 ──
  STACK_REACH: {
    race: { min: 1.40, max: 1.50, ideal: 1.45 },
    endurance: { min: 1.50, max: 1.65, ideal: 1.55 },
    mtb: { min: 1.60, max: 1.80, ideal: 1.70 },
    aero: { min: 1.30, max: 1.40, ideal: 1.35 },
    climbing: { min: 1.45, max: 1.55, ideal: 1.50 },
    sprint: { min: 1.40, max: 1.50, ideal: 1.45 },
  },

  // ── 东亚人体型修正 (Muthiah et al., 2022) ──
  ASIAN_BODY: {
    torsoFactor: 1.03,      // 躯干相对较长
    limbFactor: 0.97,       // 四肢相对较短
    flexibilityBonus: 5,    // 柔韧性通常较好
  },
};

// ============================================================
// 坐垫高度计算方法
// ============================================================

/**
 * 选择最适合的坐垫高度计算方法
 * 基于Millour et al. (2019) 的研究
 */
function selectSaddleHeightMethod(inseamCm: number, heightCm: number): {
  method: string;
  description: string;
} {
  // 计算腿长/身高比例
  const legRatio = inseamCm / heightCm;

  // Millour et al. (2019) 发现：
  // - 短腿人群：Hamley法更合适
  // - 长腿人群：Genzling法更合适
  if (legRatio < 0.47) {
    return { method: 'hamley', description: 'Hamley法（适合短腿体型）' };
  } else if (legRatio > 0.50) {
    return { method: 'genzling', description: 'Genzling法（适合长腿体型）' };
  } else {
    return { method: 'lemond', description: 'LeMond法（标准体型）' };
  }
}

/**
 * 计算坐垫高度 - 多方法比较
 * 返回推荐值和所有方法的计算结果
 */
export function calculateSaddleHeight(
  inseamCm: number,
  heightCm: number,
  seatTubeAngle: number,
  isAsian: boolean = true
): {
  recommended: number;
  method: string;
  description: string;
  allMethods: Record<string, number>;
} {
  const methodInfo = selectSaddleHeightMethod(inseamCm, heightCm);
  const correction = isAsian ? FITTING_CONSTANTS.ASIAN_CORRECTION : 1.0;

  // 各方法计算 (从BB中心到坐垫顶部，单位mm)
  const lemond = inseamCm * FITTING_CONSTANTS.LEMOND_FACTOR * correction * 10;
  const hamley = (inseamCm * FITTING_CONSTANTS.HAMLEY_FACTOR - 170) * correction * 10; // 减去曲柄长度
  const genzling = inseamCm * FITTING_CONSTANTS.GENZLING_FACTOR * correction * 10;

  // Gatti et al. (2022) 精确方程
  // 使用理想膝关节角度 (低强度骑行)
  const idealKneeAngle = FITTING_CONSTANTS.KNEE_FLEXION.lowIntensity.ideal;
  const staRad = seatTubeAngle;
  const gattiMin = (FITTING_CONSTANTS.GATTI_MIN_KNEE.intercept +
    FITTING_CONSTANTS.GATTI_MIN_KNEE.inseam * inseamCm +
    FITTING_CONSTANTS.GATTI_MIN_KNEE.kneeAngle * idealKneeAngle +
    FITTING_CONSTANTS.GATTI_MIN_KNEE.interaction * inseamCm * staRad) * correction;

  const allMethods = {
    lemond,
    hamley,
    genzling,
    gatti: gattiMin,
  };

  // 根据体型选择推荐方法
  let recommended: number;
  switch (methodInfo.method) {
    case 'hamley':
      recommended = hamley;
      break;
    case 'genzling':
      recommended = genzling;
      break;
    default:
      recommended = lemond;
  }

  // 如果Gatti方程结果在合理范围内，优先使用
  const gattiDiff = Math.abs(gattiMin - recommended) / recommended;
  if (gattiDiff < 0.05) {
    recommended = (recommended + gattiMin) / 2; // 取平均
  }

  return {
    recommended,
    method: methodInfo.method,
    description: methodInfo.description,
    allMethods,
  };
}

/**
 * 使用Gatti方程反推膝关节角度
 * 基于坐垫高度和车架几何
 */
function estimateKneeAngleFromSaddle(
  inseamCm: number,
  saddleHeightMm: number,
  seatTubeAngle: number,
  isMaxKnee: boolean = false
): number {
  const coeff = isMaxKnee
    ? FITTING_CONSTANTS.GATTI_MAX_KNEE
    : FITTING_CONSTANTS.GATTI_MIN_KNEE;

  // 反推膝关节角度
  // 坐垫高度 = intercept + b1*inseam + b2*kneeAngle + b3*inseam*sta
  // kneeAngle = (坐垫高度 - intercept - b1*inseam - b3*inseam*sta) / b2
  const kneeAngle = (saddleHeightMm - coeff.intercept - coeff.inseam * inseamCm -
    coeff.interaction * inseamCm * seatTubeAngle) / coeff.kneeAngle;

  return Math.max(20, Math.min(50, kneeAngle));
}

/**
 * 计算Stack/Reach比例
 */
export function calculateStackReachRatio(stack: number, reach: number): number {
  if (reach === 0) return 0;
  return stack / reach;
}

/**
 * 获取姿态对应的Stack/Reach参考范围
 */
function getStackReachReference(pose: PoseType, bikeType: string) {
  if (pose === 'aero') return FITTING_CONSTANTS.STACK_REACH.aero;
  if (pose === 'sprint') return FITTING_CONSTANTS.STACK_REACH.sprint;
  if (pose === 'climbing') return FITTING_CONSTANTS.STACK_REACH.climbing;
  if (bikeType === 'mtb') return FITTING_CONSTANTS.STACK_REACH.mtb;
  if (bikeType === 'endurance') return FITTING_CONSTANTS.STACK_REACH.endurance;
  return FITTING_CONSTANTS.STACK_REACH.race;
}

/**
 * 估算躯干角度
 * 基于Stack/Reach比例、骑行姿态和身体比例
 */
export function estimateTorsoAngle(
  stackMm: number,
  reachMm: number,
  pose: PoseType,
  bodyProportion: number,
  isAsian: boolean = true
): number {
  const ratio = calculateStackReachRatio(stackMm, reachMm);
  const ref = getStackReachReference(pose, 'road');

  // 基于Stack/Reach比例的基础角度
  const ratioNormalized = Math.max(0, Math.min(1,
    (ratio - ref.min) / (ref.max - ref.min)
  ));

  // 姿态调整
  const poseRef = FITTING_CONSTANTS.TORSO_ANGLE[pose === 'seated' ? 'seated' : pose];

  // 综合计算
  let baseAngle: number;
  if (ratioNormalized < 0.3) baseAngle = poseRef.min;
  else if (ratioNormalized < 0.7) baseAngle = (poseRef.min + poseRef.max) / 2;
  else baseAngle = poseRef.max;

  // 身体比例调整
  const proportionAdjust = (bodyProportion - 0.48) * 15;

  // 东亚人调整
  const asianAdjust = isAsian ? 2 : 0;

  return Math.max(15, Math.min(70,
    Math.round(baseAngle + proportionAdjust + asianAdjust)
  ));
}

/**
 * 计算柔韧性需求评分
 */
function calculateFlexibilityDemand(
  pose: PoseType,
  torsoAngle: number,
  isAsian: boolean
): number {
  let demand = 50;

  if (pose === 'aero') demand = 85;
  else if (pose === 'sprint') demand = 70;
  else if (pose === 'climbing') demand = 55;
  else if (pose === 'seated') demand = 40;

  // 躯干角度影响
  if (torsoAngle < 25) demand += 15;
  else if (torsoAngle < 35) demand += 10;
  else if (torsoAngle > 50) demand -= 10;

  // 东亚人柔韧性通常较好
  if (isAsian) demand -= FITTING_CONSTANTS.ASIAN_BODY.flexibilityBonus;

  return Math.max(20, Math.min(100, demand));
}

/**
 * 计算姿态分析结果
 */
export function calculatePoseAnalysis(
  bikeParams: BikeParams,
  body: BodyMeasurements,
  pose: PoseType,
  derived: { stack: number; reach: number; wheelbase: number; trail: number }
): PoseAnalysisResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const isAsian = true;
  const legLength = body.inseam;
  const torsoLength = body.height - legLength;
  const bodyProportion = torsoLength / body.height;

  // ── 1. 坐垫高度分析 ──
  const saddleResult = calculateSaddleHeight(
    body.inseam,
    body.height,
    bikeParams.seatTubeAngle,
    isAsian
  );

  const staRad = Math.PI * bikeParams.seatTubeAngle / 180;
  const actualSaddleHeight = bikeParams.seatpostExt +
    bikeParams.seatTubeLength * Math.sin(staRad);

  const saddleHeightDiff = Math.abs(actualSaddleHeight - saddleResult.recommended);
  const saddleHeightFit = Math.max(0, 100 - saddleHeightDiff * 0.3);

  if (saddleHeightDiff > 15) {
    issues.push(`坐垫高度偏差${saddleHeightDiff.toFixed(0)}mm`);
    recommendations.push(`建议调整坐垫高度至约${saddleResult.recommended.toFixed(0)}mm (${saddleResult.description})`);
  }

  // ── 2. 膝关节角度估算 ──
  const isHighIntensity = pose === 'sprint' || pose === 'climbing';
  const kneeRef = isHighIntensity
    ? FITTING_CONSTANTS.KNEE_FLEXION.highIntensity
    : FITTING_CONSTANTS.KNEE_FLEXION.lowIntensity;

  // 使用Gatti方程估算
  const kneeFlexion = estimateKneeAngleFromSaddle(
    body.inseam,
    actualSaddleHeight,
    bikeParams.seatTubeAngle,
    false
  );

  if (kneeFlexion < kneeRef.min || kneeFlexion > kneeRef.max) {
    issues.push(`膝关节角度(${kneeFlexion.toFixed(0)}°)超出理想范围(${kneeRef.min}-${kneeRef.max}°)`);
    recommendations.push('建议调整坐垫高度以优化膝关节角度');
  }

  // ── 3. Stack/Reach分析 ──
  const stackReachRatio = calculateStackReachRatio(
    derived.stack * 1000,
    derived.reach * 1000
  );
  const ref = getStackReachReference(
    pose,
    bikeParams.headTubeAngle < 69 ? 'mtb' : 'road'
  );

  const ratioInRange = stackReachRatio >= ref.min && stackReachRatio <= ref.max;
  const ratioDistFromIdeal = Math.abs(stackReachRatio - ref.ideal);

  const stackFit = Math.max(0, 100 - ratioDistFromIdeal * 150);
  const reachFit = Math.max(0, 100 - ratioDistFromIdeal * 120);

  if (!ratioInRange) {
    const direction = stackReachRatio < ref.min ? '偏低' : '偏高';
    issues.push(`Stack/Reach比例(${stackReachRatio.toFixed(2)})${direction}`);
  }

  // ── 4. 躯干角度估算 ──
  const torsoAngle = estimateTorsoAngle(
    derived.stack * 1000,
    derived.reach * 1000,
    pose,
    bodyProportion,
    isAsian
  );

  // ── 5. 髋关节角度 ──
  const hipAngle = 180 - torsoAngle - (180 - kneeFlexion) * 0.25;

  // ── 6. 柔韧性需求 ──
  const flexibilityDemand = calculateFlexibilityDemand(pose, torsoAngle, isAsian);

  // ── 7. 功率效率 ──
  let powerEfficiency = 80;
  if (pose === 'sprint') powerEfficiency = 88;
  else if (pose === 'climbing') powerEfficiency = 85;
  else if (pose === 'seated') powerEfficiency = 82;
  else if (pose === 'aero') powerEfficiency = 72;

  if (kneeFlexion >= kneeRef.min && kneeFlexion <= kneeRef.max) powerEfficiency += 8;
  if (saddleHeightFit > 90) powerEfficiency += 5;

  // ── 8. 舒适度 ──
  let comfortScore = 75;
  if (pose === 'seated') comfortScore = 88;
  else if (pose === 'climbing') comfortScore = 75;
  else if (pose === 'sprint') comfortScore = 60;
  else if (pose === 'aero') comfortScore = 50;

  if (torsoAngle > 50) comfortScore += 8;
  else if (torsoAngle < 30) comfortScore -= 10;
  comfortScore -= Math.max(0, (flexibilityDemand - 60) * 0.3);

  // ── 9. 气动性 ──
  let aeroScore = 45;
  if (pose === 'aero') aeroScore = 92;
  else if (pose === 'sprint') aeroScore = 70;
  else if (pose === 'seated') aeroScore = 55;
  else if (pose === 'climbing') aeroScore = 35;

  if (torsoAngle < 25) aeroScore += 8;
  else if (torsoAngle > 50) aeroScore -= 10;

  // ── 10. 总体评分 ──
  const overallScore = Math.round(
    saddleHeightFit * 0.20 +
    reachFit * 0.15 +
    stackFit * 0.10 +
    powerEfficiency * 0.25 +
    comfortScore * 0.15 +
    aeroScore * 0.10 +
    (100 - flexibilityDemand) * 0.05
  );

  // ── 11. 姿态描述 ──
  const poseDescriptions: Record<PoseType, string> = {
    seated: '标准坐姿骑行，适合长途巡航。身体前倾角度适中，兼顾舒适性和效率。',
    sprint: '冲刺姿态，站立骑行发力。躯干大幅前倾，追求最大功率输出。',
    climbing: '爬坡姿态，站立骑行。躯干较直立，利于爬坡发力。',
    aero: '低风阻姿态，极度前倾。最大化减少迎风面积。',
  };

  // ── 12. 建议 ──
  if (isAsian && bodyProportion > 0.50) {
    recommendations.push('您的躯干比例较长，建议选择Stack较大的车架');
  }

  if (pose === 'aero' && flexibilityDemand > 75) {
    recommendations.push('低风阻姿态对柔韧性要求较高，建议进行柔韧性训练');
  }

  if (pose === 'sprint') {
    recommendations.push('冲刺时注意保持核心稳定');
    if (body.shoulderWidth < 38) {
      recommendations.push('肩宽较窄，建议选择400-420mm宽度的弯把');
    }
  }

  if (pose === 'climbing' && body.weight > 75) {
    recommendations.push('注意控制踏频在80-90rpm，避免低踏频高扭矩');
  }

  if (saddleHeightFit > 90) {
    recommendations.push('坐垫高度设置良好');
  }

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    saddleHeightFit: Math.round(Math.max(0, Math.min(100, saddleHeightFit))),
    reachFit: Math.round(Math.max(0, Math.min(100, reachFit))),
    stackFit: Math.round(Math.max(0, Math.min(100, stackFit))),
    torsoAngle: Math.round(torsoAngle),
    kneeFlexion: Math.round(kneeFlexion),
    hipAngle: Math.round(hipAngle),
    powerEfficiency: Math.round(Math.max(0, Math.min(100, powerEfficiency))),
    comfortScore: Math.round(Math.max(0, Math.min(100, comfortScore))),
    aeroScore: Math.round(Math.max(0, Math.min(100, aeroScore))),
    flexibilityDemand: Math.round(flexibilityDemand),
    saddleHeightMethod: saddleResult.description,
    issues,
    recommendations,
    poseDescription: poseDescriptions[pose],
  };
}
