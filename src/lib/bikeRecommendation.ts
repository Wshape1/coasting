/**
 * 选车建议模块 - 基于身体数据、车架几何和姿态分析
 *
 * 参考数据来源：
 * - Giant/Merida/Decathlon 官方尺码表 (2024-2025)
 * - 99spokes.com 几何数据库
 * - BikeExchange.com 选车指南
 * - REI Bike Sizing Guide
 * - Phil Burt "Bike Fit"
 */

import type { BikeParams } from '@/types/bike';
import type { PoseType, PoseAnalysisResult } from './poseAnalysis';

export interface BodyMeasurements {
  height: number;      // cm
  weight: number;      // kg
  inseam: number;      // cm
  armSpan: number;     // cm
  shoulderWidth: number; // cm
}

export interface BikeRecommendation {
  // 推荐尺码
  recommendedSize: string;
  sizeLabel: string;
  // 推荐几何参数
  idealStack: number;       // mm
  idealReach: number;       // mm
  idealStackReachRatio: number;
  // 适配评分
  fitScore: number;         // 0-100
  // 详细建议
  frameAdvice: string;
  componentAdvice: string;
  postureAdvice: string;
  // 推荐车型
  suggestedBikes: string[];
  // 关键指标
  keyMetrics: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'info';
  }[];
}

// ============================================================
// 各品牌尺码对照表 (基于2024-2025官方数据)
// ============================================================

interface SizeRange {
  heightMin: number;
  heightMax: number;
  inseamMin: number;
  inseamMax: number;
  stack: number;   // 典型值 mm
  reach: number;   // 典型值 mm
}

const ROAD_BIKE_SIZES: Record<string, SizeRange> = {
  'XS': { heightMin: 150, heightMax: 163, inseamMin: 68, inseamMax: 74, stack: 510, reach: 365 },
  'S':  { heightMin: 160, heightMax: 170, inseamMin: 73, inseamMax: 78, stack: 530, reach: 378 },
  'M':  { heightMin: 168, heightMax: 178, inseamMin: 76, inseamMax: 82, stack: 550, reach: 388 },
  'L':  { heightMin: 175, heightMax: 185, inseamMin: 80, inseamMax: 86, stack: 570, reach: 398 },
  'XL': { heightMin: 182, heightMax: 193, inseamMin: 84, inseamMax: 90, stack: 595, reach: 410 },
};

const MTB_SIZES: Record<string, SizeRange> = {
  'XS': { heightMin: 150, heightMax: 160, inseamMin: 68, inseamMax: 73, stack: 590, reach: 395 },
  'S':  { heightMin: 158, heightMax: 168, inseamMin: 72, inseamMax: 77, stack: 610, reach: 415 },
  'M':  { heightMin: 165, heightMax: 175, inseamMin: 75, inseamMax: 81, stack: 625, reach: 435 },
  'L':  { heightMin: 173, heightMax: 183, inseamMin: 79, inseamMax: 85, stack: 640, reach: 455 },
  'XL': { heightMin: 180, heightMax: 193, inseamMin: 83, inseamMax: 90, stack: 655, reach: 475 },
};

// ============================================================
// 根据身体数据推荐尺码
// ============================================================

function findBestSize(
  height: number,
  inseam: number,
  bikeType: 'road' | 'mtb'
): { size: string; range: SizeRange } {
  const sizes = bikeType === 'road' ? ROAD_BIKE_SIZES : MTB_SIZES;
  let bestSize = 'M';
  let bestRange: SizeRange = sizes['M']!;
  let bestScore = -1;

  for (const [size, range] of Object.entries(sizes)) {
    if (!range) continue;

    // 计算匹配度
    const heightCenter = (range.heightMin + range.heightMax) / 2;
    const heightScore = 100 - Math.abs(height - heightCenter) * 2;

    const inseamCenter = (range.inseamMin + range.inseamMax) / 2;
    const inseamScore = 100 - Math.abs(inseam - inseamCenter) * 2;

    const totalScore = heightScore * 0.5 + inseamScore * 0.5;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestSize = size;
      bestRange = range;
    }
  }

  return { size: bestSize, range: bestRange };
}

// ============================================================
// 计算理想Stack/Reach
// ============================================================

function calculateIdealGeometry(
  body: BodyMeasurements,
  bikeType: 'road' | 'mtb',
  pose: PoseType
): { stack: number; reach: number; ratio: number } {
  // 基础值基于身高
  const heightFactor = body.height / 175; // 以175cm为基准

  let baseStack: number;
  let baseReach: number;

  if (bikeType === 'road') {
    baseStack = 550 * heightFactor;
    baseReach = 385 * heightFactor;
  } else {
    baseStack = 625 * heightFactor;
    baseReach = 435 * heightFactor;
  }

  // 根据姿态调整
  const poseAdjustments: Record<PoseType, { stack: number; reach: number }> = {
    seated: { stack: 0, reach: 0 },
    sprint: { stack: -15, reach: 10 },
    climbing: { stack: 15, reach: -5 },
    aero: { stack: -30, reach: 15 },
  };

  const adj = poseAdjustments[pose];

  // 身体比例调整 (臂展/身高)
  const armSpanRatio = body.armSpan / body.height;
  const reachAdjust = (armSpanRatio - 1) * 50; // 臂展长的人需要更长的reach

  const finalStack = baseStack + adj.stack;
  const finalReach = baseReach + adj.reach + reachAdjust;

  return {
    stack: Math.round(finalStack),
    reach: Math.round(finalReach),
    ratio: finalStack / finalReach,
  };
}

// ============================================================
// 生成选车建议
// ============================================================

export function generateBikeRecommendation(
  body: BodyMeasurements,
  currentParams: BikeParams,
  pose: PoseType,
  poseAnalysis: PoseAnalysisResult
): BikeRecommendation {
  const bikeType = currentParams.headTubeAngle < 69 ? 'mtb' : 'road';

  // 1. 推荐尺码
  const sizeResult = findBestSize(body.height, body.inseam, bikeType);

  // 2. 理想几何
  const idealGeo = calculateIdealGeometry(body, bikeType, pose);

  // 3. 当前几何适配评分
  const currentStack = poseAnalysis.stackFit;
  const currentReach = poseAnalysis.reachFit;
  const fitScore = Math.round((currentStack + currentReach) / 2);

  // 4. 生成建议
  const frameAdvice = generateFrameAdvice(body, currentParams, sizeResult, idealGeo, bikeType);
  const componentAdvice = generateComponentAdvice(body, currentParams, pose);
  const postureAdvice = generatePostureAdvice(pose, poseAnalysis);

  // 5. 推荐车型
  const suggestedBikes = generateSuggestedBikes(body, bikeType, pose, sizeResult.size);

  // 6. 关键指标
  const keyMetrics = generateKeyMetrics(body, currentParams, idealGeo, poseAnalysis);

  return {
    recommendedSize: `${sizeResult.size}码`,
    sizeLabel: `${bikeType === 'road' ? '公路车' : '山地车'} ${sizeResult.size}`,
    idealStack: idealGeo.stack,
    idealReach: idealGeo.reach,
    idealStackReachRatio: Math.round(idealGeo.ratio * 100) / 100,
    fitScore,
    frameAdvice,
    componentAdvice,
    postureAdvice,
    suggestedBikes,
    keyMetrics,
  };
}

// ============================================================
// 辅助函数：生成各类建议
// ============================================================

function generateFrameAdvice(
  body: BodyMeasurements,
  _params: BikeParams,
  sizeResult: { size: string; range: SizeRange },
  idealGeo: { stack: number; reach: number },
  _bikeType: 'road' | 'mtb'
): string {
  const advice: string[] = [];

  // 尺码建议
  advice.push(`根据您的身高${body.height}cm和跨高${body.inseam}cm，推荐${sizeResult.size}码车架。`);

  // Stack/Reach建议
  const stackDiff = idealGeo.stack - sizeResult.range.stack;
  const reachDiff = idealGeo.reach - sizeResult.range.reach;

  if (Math.abs(stackDiff) > 20) {
    advice.push(`建议选择Stack${stackDiff > 0 ? '更高' : '更低'}的车架（约${idealGeo.stack}mm）。`);
  }

  if (Math.abs(reachDiff) > 15) {
    advice.push(`建议选择Reach${reachDiff > 0 ? '更长' : '更短'}的车架（约${idealGeo.reach}mm）。`);
  }

  // 体型特殊建议
  const armSpanRatio = body.armSpan / body.height;
  if (armSpanRatio > 1.03) {
    advice.push('您的臂展较长，适合选择稍大一码的车架。');
  } else if (armSpanRatio < 0.97) {
    advice.push('您的臂展较短，建议选择标准或稍小一码的车架。');
  }

  return advice.join(' ');
}

function generateComponentAdvice(
  body: BodyMeasurements,
  _params: BikeParams,
  pose: PoseType
): string {
  const advice: string[] = [];

  // 车把建议
  if (body.shoulderWidth < 38) {
    advice.push('肩宽较窄，建议选择400-420mm弯把。');
  } else if (body.shoulderWidth > 44) {
    advice.push('肩宽较宽，建议选择440mm或更宽的车把。');
  }

  // 把立建议
  if (pose === 'aero') {
    advice.push('低风阻姿态建议使用较长把立（100-120mm）。');
  } else if (pose === 'climbing') {
    advice.push('爬坡姿态建议使用较短把立（80-100mm）。');
  }

  // 曲柄建议
  if (body.inseam < 76) {
    advice.push('跨高较短，建议使用165-170mm曲柄。');
  } else if (body.inseam > 84) {
    advice.push('跨高较长，建议使用172.5-175mm曲柄。');
  }

  // 坐垫建议
  if (body.weight > 80) {
    advice.push('体重较大，建议选择较宽的坐垫以分散压力。');
  }

  return advice.join(' ') || '当前配件配置适合您的身体数据。';
}

function generatePostureAdvice(
  pose: PoseType,
  analysis: PoseAnalysisResult
): string {
  const advice: string[] = [];

  switch (pose) {
    case 'seated':
      advice.push('坐姿骑行适合长途巡航，保持放松状态。');
      if (analysis.torsoAngle > 50) {
        advice.push('当前姿势较直立，可适当降低车头以提高气动性。');
      }
      break;

    case 'sprint':
      advice.push('冲刺时站立发力，重心前移。');
      advice.push('保持核心稳定，避免过度摇车。');
      if (analysis.flexibilityDemand > 70) {
        advice.push('冲刺姿态对柔韧性要求较高，建议加强核心训练。');
      }
      break;

    case 'climbing':
      advice.push('爬坡时可坐姿保持效率，适时站立发力。');
      if (analysis.powerEfficiency < 80) {
        advice.push('建议调整坐垫位置以优化爬坡发力。');
      }
      break;

    case 'aero':
      advice.push('低风阻姿态适合平路高速骑行。');
      if (analysis.flexibilityDemand > 80) {
        advice.push('需要较高的柔韧性，建议循序渐进适应。');
      }
      advice.push('注意定期变换姿势，避免颈部和腰部疲劳。');
      break;
  }

  return advice.join(' ');
}

function generateSuggestedBikes(
  _body: BodyMeasurements,
  bikeType: 'road' | 'mtb',
  pose: PoseType,
  _size: string
): string[] {
  const bikes: string[] = [];

  if (bikeType === 'road') {
    switch (pose) {
      case 'seated':
        bikes.push('Giant Defy', 'Merida Scultura Endurance', 'Trek Domane');
        break;
      case 'sprint':
        bikes.push('Giant TCR', 'Merida Reacto', 'Specialized Tarmac');
        break;
      case 'climbing':
        bikes.push('Giant TCR', 'Merida Scultura', 'Canyon Ultimate');
        break;
      case 'aero':
        bikes.push('Merida Reacto', 'Giant Propel', 'Canyon Aeroad');
        break;
    }
  } else {
    switch (pose) {
      case 'seated':
        bikes.push('Giant Talon', 'Merida Big.Trail', 'Trek Marlin');
        break;
      case 'sprint':
        bikes.push('Giant Anthem', 'Merida Ninety-Six', 'Specialized Epic');
        break;
      case 'climbing':
        bikes.push('Giant XTC', 'Merida One-Twenty', 'Santa Cruz Blur');
        break;
      case 'aero':
        bikes.push('Giant Anthem Advanced', 'Merida One-Sixty', 'Specialized Stumpjumper');
        break;
    }
  }

  return bikes;
}

function generateKeyMetrics(
  _body: BodyMeasurements,
  _params: BikeParams,
  _idealGeo: { stack: number; reach: number },
  analysis: PoseAnalysisResult
): { label: string; value: string; status: 'good' | 'warning' | 'info' }[] {
  const metrics: { label: string; value: string; status: 'good' | 'warning' | 'info' }[] = [];

  // 坐垫高度
  metrics.push({
    label: '坐垫高度',
    value: `${analysis.saddleHeightFit}%`,
    status: analysis.saddleHeightFit >= 90 ? 'good' : analysis.saddleHeightFit >= 70 ? 'warning' : 'info',
  });

  // 膝关节角度
  metrics.push({
    label: '膝关节角度',
    value: `${analysis.kneeFlexion}°`,
    status: (analysis.kneeFlexion >= 30 && analysis.kneeFlexion <= 40) ? 'good' : 'warning',
  });

  // 躯干角度
  metrics.push({
    label: '躯干角度',
    value: `${analysis.torsoAngle}°`,
    status: 'info',
  });

  // Stack适配
  metrics.push({
    label: 'Stack适配',
    value: `${analysis.stackFit}%`,
    status: analysis.stackFit >= 80 ? 'good' : analysis.stackFit >= 60 ? 'warning' : 'info',
  });

  // Reach适配
  metrics.push({
    label: 'Reach适配',
    value: `${analysis.reachFit}%`,
    status: analysis.reachFit >= 80 ? 'good' : analysis.reachFit >= 60 ? 'warning' : 'info',
  });

  return metrics;
}
