export type UserBadgeTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export type UserBadgeMetric =
  | 'posts'
  | 'views'
  | 'reactions'
  | 'comments'
  | 'shares'
  | 'followers'
  | 'profileCompletion'
  | 'engagementScore';

export interface UserBadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: UserBadgeTier;
  metric: UserBadgeMetric;
  target: number;
  rewardPoints: number;
}

export interface UserBadgeSnapshot {
  postsCount: number;
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  followersCount: number;
  profileCompletion: number;
}

export interface EarnedUserBadge extends UserBadgeDefinition {
  current: number;
  progressPercent: number;
}

const TIER_WEIGHT: Record<UserBadgeTier, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

export const USER_BADGE_DEFINITIONS: UserBadgeDefinition[] = [
  {
    id: 'first_post',
    title: 'First Post',
    description: 'Publish your first post.',
    icon: '📝',
    tier: 'bronze',
    metric: 'posts',
    target: 1,
    rewardPoints: 10,
  },
  {
    id: 'active_storyteller',
    title: 'Active Storyteller',
    description: 'Publish 10 posts.',
    icon: '📚',
    tier: 'silver',
    metric: 'posts',
    target: 10,
    rewardPoints: 30,
  },
  {
    id: 'post_master',
    title: 'Post Master',
    description: 'Publish 50 posts.',
    icon: '🏆',
    tier: 'gold',
    metric: 'posts',
    target: 50,
    rewardPoints: 120,
  },
  {
    id: 'spotlight_1k',
    title: 'Spotlight',
    description: 'Reach 1,000 post views.',
    icon: '👁️',
    tier: 'silver',
    metric: 'views',
    target: 1000,
    rewardPoints: 40,
  },
  {
    id: 'trending_5k',
    title: 'Trending',
    description: 'Reach 5,000 post views.',
    icon: '🔥',
    tier: 'gold',
    metric: 'views',
    target: 5000,
    rewardPoints: 120,
  },
  {
    id: 'viral_20k',
    title: 'Viral Voice',
    description: 'Reach 20,000 post views.',
    icon: '🚀',
    tier: 'diamond',
    metric: 'views',
    target: 20000,
    rewardPoints: 320,
  },
  {
    id: 'crowd_favorite',
    title: 'Crowd Favorite',
    description: 'Get 100 reactions.',
    icon: '💝',
    tier: 'silver',
    metric: 'reactions',
    target: 100,
    rewardPoints: 40,
  },
  {
    id: 'reaction_rockstar',
    title: 'Reaction Rockstar',
    description: 'Get 500 reactions.',
    icon: '⭐',
    tier: 'gold',
    metric: 'reactions',
    target: 500,
    rewardPoints: 140,
  },
  {
    id: 'comment_starter',
    title: 'Comment Starter',
    description: 'Receive 50 comments.',
    icon: '🗨️',
    tier: 'silver',
    metric: 'comments',
    target: 50,
    rewardPoints: 35,
  },
  {
    id: 'discussion_champion',
    title: 'Discussion Champion',
    description: 'Receive 200 comments.',
    icon: '📣',
    tier: 'platinum',
    metric: 'comments',
    target: 200,
    rewardPoints: 120,
  },
  {
    id: 'share_magnet',
    title: 'Share Magnet',
    description: 'Get 25 shares.',
    icon: '🔁',
    tier: 'gold',
    metric: 'shares',
    target: 25,
    rewardPoints: 60,
  },
  {
    id: 'wedding_star',
    title: 'Wedding Star',
    description: 'Reach 100 followers.',
    icon: '🌟',
    tier: 'gold',
    metric: 'followers',
    target: 100,
    rewardPoints: 80,
  },
  {
    id: 'community_icon',
    title: 'Community Icon',
    description: 'Reach 500 followers.',
    icon: '👑',
    tier: 'platinum',
    metric: 'followers',
    target: 500,
    rewardPoints: 180,
  },
  {
    id: 'celebrity_creator',
    title: 'Celebrity Creator',
    description: 'Reach 2,000 followers.',
    icon: '🏅',
    tier: 'diamond',
    metric: 'followers',
    target: 2000,
    rewardPoints: 450,
  },
  {
    id: 'profile_pro',
    title: 'Profile Pro',
    description: 'Complete 90% of your profile.',
    icon: '✅',
    tier: 'bronze',
    metric: 'profileCompletion',
    target: 90,
    rewardPoints: 25,
  },
  {
    id: 'all_rounder',
    title: 'All Rounder',
    description: 'Reach 4,000 engagement score.',
    icon: '🏵️',
    tier: 'diamond',
    metric: 'engagementScore',
    target: 4000,
    rewardPoints: 250,
  },
];

export function calculateEngagementScore(snapshot: UserBadgeSnapshot): number {
  const rawScore =
    snapshot.postsCount * 10 +
    snapshot.viewsCount * 0.25 +
    snapshot.reactionsCount * 3 +
    snapshot.commentsCount * 4 +
    snapshot.sharesCount * 6 +
    snapshot.followersCount * 8 +
    snapshot.profileCompletion * 2;

  return Math.max(0, Math.round(rawScore));
}

export function evaluateUserBadges(
  snapshot: UserBadgeSnapshot,
): EarnedUserBadge[] {
  const engagementScore = calculateEngagementScore(snapshot);

  return USER_BADGE_DEFINITIONS.map((badge) => {
    const current = metricValue(snapshot, badge.metric, engagementScore);
    const progressPercent = Math.min(
      100,
      Math.round((current / Math.max(badge.target, 1)) * 100),
    );
    return {
      ...badge,
      current,
      progressPercent,
    };
  })
    .filter((badge) => badge.current >= badge.target)
    .sort((a, b) => {
      if (TIER_WEIGHT[b.tier] !== TIER_WEIGHT[a.tier]) {
        return TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier];
      }
      if (b.rewardPoints !== a.rewardPoints) {
        return b.rewardPoints - a.rewardPoints;
      }
      return a.title.localeCompare(b.title);
    });
}

export function computeUserRating(
  snapshot: UserBadgeSnapshot,
  earnedBadgesCount: number,
) {
  const engagementScore = calculateEngagementScore(snapshot);
  const engagementPart = Math.min(70, (engagementScore / 4000) * 70);
  const badgePart = Math.min(
    30,
    (earnedBadgesCount / USER_BADGE_DEFINITIONS.length) * 30,
  );
  const score = Math.max(
    0,
    Math.min(100, Math.round(engagementPart + badgePart)),
  );

  if (score >= 90) return { score, level: 'Legend' };
  if (score >= 75) return { score, level: 'Elite' };
  if (score >= 55) return { score, level: 'Pro' };
  if (score >= 35) return { score, level: 'Rising' };
  return { score, level: 'New' };
}

function metricValue(
  snapshot: UserBadgeSnapshot,
  metric: UserBadgeMetric,
  engagementScore: number,
): number {
  switch (metric) {
    case 'posts':
      return snapshot.postsCount;
    case 'views':
      return snapshot.viewsCount;
    case 'reactions':
      return snapshot.reactionsCount;
    case 'comments':
      return snapshot.commentsCount;
    case 'shares':
      return snapshot.sharesCount;
    case 'followers':
      return snapshot.followersCount;
    case 'profileCompletion':
      return snapshot.profileCompletion;
    case 'engagementScore':
      return engagementScore;
    default:
      return 0;
  }
}
