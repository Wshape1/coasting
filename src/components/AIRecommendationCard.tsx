import { useQuery } from '@tanstack/react-query';
import { useBikeStore } from '@/store/useBikeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIRecommendation {
  size: string;
  stack: number;
  reach: number;
  analysis: string;
}

export function AIRecommendationCard() {
  const { height, inseam, armLength, bikeType } = useBikeStore();

  const { data, isLoading, error } = useQuery<AIRecommendation>({
    queryKey: ['aiRecommendation', { height, inseam, armLength, bikeType }],
    queryFn: async () => {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height, inseam, armLength, bikeType }),
      });
      if (!res.ok) throw new Error('Failed to fetch recommendation');
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-fluid-sm">AI Size Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Analyzing...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            Unable to get recommendation. Check API configuration.
          </p>
        )}
        {data && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Frame Size</span>
              <span className="text-fluid-lg font-bold text-primary">
                {data.size}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between rounded bg-muted px-2 py-1">
                <span className="text-muted-foreground">Stack</span>
                <span className="font-mono">{data.stack}cm</span>
              </div>
              <div className="flex justify-between rounded bg-muted px-2 py-1">
                <span className="text-muted-foreground">Reach</span>
                <span className="font-mono">{data.reach}cm</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{data.analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
