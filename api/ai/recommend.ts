export const config = {
  runtime: 'edge',
};

interface RecommendRequest {
  height: number;
  inseam: number;
  armLength: number;
  bikeType: 'road' | 'mountain';
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
    const { height, inseam, armLength, bikeType } = body;

    // Stub logic: simple size estimation based on height
    const size =
      height < 160
        ? 'XS'
        : height < 170
          ? 'S'
          : height < 180
            ? 'M'
            : height < 190
              ? 'L'
              : 'XL';

    const stack = Math.round(
      bikeType === 'road' ? height * 0.31 : height * 0.33,
    );
    const reach = Math.round(
      bikeType === 'road' ? height * 0.22 : height * 0.21,
    );

    const analysis = `Based on your height of ${height}cm, inseam of ${inseam}cm, and arm length of ${armLength}cm, we recommend a ${size} frame (stack: ${stack}cm / reach: ${reach}cm) for ${bikeType} biking. This is a stub response — integrate DeepSeek API for AI-powered analysis.`;

    const response: RecommendResponse = {
      size,
      stack,
      reach,
      analysis,
    };

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
