export const GROWTH_LIMITS = { pages: 10, blogPosts: 20, articleGenerations: 20, writingCredits: 40 } as const;

export type GrowthQuotaKind = 'articleGenerations' | 'writingCredits';

export function getGrowthAIOperation(action: string): { kind: GrowthQuotaKind; amount: number } {
  return action === 'article'
    ? { kind: 'articleGenerations', amount: 1 }
    : { kind: 'writingCredits', amount: action === 'search' ? 2 : 1 };
}

export function getCrossedQuotaThresholds(previous: number, current: number, limit: number): Array<80 | 100> {
  return ([80, 100] as const).filter((threshold) => previous < Math.ceil(limit * threshold / 100) && current >= Math.ceil(limit * threshold / 100));
}
