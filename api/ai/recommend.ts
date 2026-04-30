export const config = {
  runtime: 'edge',
};

const sizes = [
  { max: 160, label: 'XS' },
  { max: 170, label: 'S' },
  { max: 180, label: 'M' },
  { max: 190, label: 'L' },
];

const sizeLabels: Record<string, string> = {
  road: '公路车',
  mountain: '山地车',
  urban: '城市车',
};

interface RecommendRequest {
  height: number;
  inseam: number;
  weight: number;
  bikeType: 'road' | 'mountain' | 'urban';
  pose: 'seated' | 'sprint' | 'climbing' | 'aero';
}

interface RecommendResponse {
  size: string;
  stack: number;
  reach: number;
  analysis: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RecommendRequest;
    const { height, inseam, weight, bikeType, pose } = body;

    const sizeEntry = sizes.find((s) => height < s.max) ?? { label: 'XL' };
    const size = sizeEntry.label;
    const bikeLabel = sizeLabels[bikeType] ?? '自行车';

    const stack = Math.round(
      bikeType === 'road' ? height * 0.31 : bikeType === 'mountain' ? height * 0.33 : height * 0.32,
    );
    const reach = Math.round(
      bikeType === 'road' ? height * 0.22 : height * 0.21,
    );

    const poseHint =
      pose === 'seated'
        ? '适合休闲骑行'
        : pose === 'sprint'
          ? '适合高功率输出'
          : pose === 'climbing'
            ? '适合爬坡路段'
            : '适合低风阻巡航';

    const analysis = `根据你的身高 ${height}cm、跨高 ${inseam}cm、体重 ${weight}kg，推荐 ${bikeLabel} ${size} 码（Stack ${stack}cm / Reach ${reach}cm）。${poseHint}。`;

    const response: RecommendResponse = { size: `${bikeLabel} ${size} 码`, stack, reach, analysis };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
