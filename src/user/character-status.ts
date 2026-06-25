import {
  calculateEngagementScore,
  computeUserRating,
  evaluateUserBadges,
} from '../wall/user-badges';

export const USER_CHARACTER_THEME_VALUES = [
  'classic',
  'orchid',
  'sunset',
  'royal',
] as const;

export const USER_COMPLIMENT_TYPE_VALUES = [
  'stylish',
  'genuine',
  'smart',
  'respectful',
  'popular',
] as const;

const THEME_LABELS = {
  classic: 'Classic',
  orchid: 'Orchid',
  sunset: 'Sunset',
  royal: 'Royal',
} as const;

const COMPLIMENT_DEFINITIONS = [
  {
    type: 'stylish',
    label: 'Stylish',
    description: 'Looks polished and visually impressive.',
  },
  {
    type: 'genuine',
    label: 'Genuine',
    description: 'Feels sincere and authentic.',
  },
  {
    type: 'smart',
    label: 'Smart',
    description: 'Comes across as thoughtful and sharp.',
  },
  {
    type: 'respectful',
    label: 'Respectful',
    description: 'Shows kindness and maturity.',
  },
  {
    type: 'popular',
    label: 'Popular',
    description: 'Clearly stands out in the community.',
  },
] as const;

export function isCharacterThemeValue(value: string): boolean {
  return USER_CHARACTER_THEME_VALUES.includes(value as never);
}

export function isComplimentTypeValue(value: string): boolean {
  return USER_COMPLIMENT_TYPE_VALUES.includes(value as never);
}

export function complimentLabelForType(type: string): string {
  return (
    COMPLIMENT_DEFINITIONS.find((definition) => definition.type === type)
      ?.label ?? type
  );
}

export function buildCharacterStatusSummary(input) {
  const metrics = normalizeMetrics(input.metrics);
  const badgeSnapshot = {
    postsCount: metrics.postsCount,
    viewsCount: metrics.viewsCount,
    reactionsCount: metrics.reactionsCount,
    commentsCount: metrics.commentsCount,
    sharesCount: metrics.sharesCount,
    followersCount: metrics.followersCount,
    profileCompletion: metrics.profileCompletion,
  };
  const badges = evaluateUserBadges(badgeSnapshot);
  const rating = computeUserRating(badgeSnapshot, badges.length);
  const engagementScore = calculateEngagementScore(badgeSnapshot);
  const compliments = summarizeCompliments(input.user.receivedCompliments);
  const complimentsReceivedCount = compliments.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const trustScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (input.user.verifiedEmail == true ? 22 : 0) +
          (input.user.verifiedPhoneNumber == true ? 22 : 0) +
          (input.user.isProfileVerified == true ? 26 : 0) +
          Math.min(30, metrics.profileCompletion * 0.3),
      ),
    ),
  );
  const socialScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Math.min(45, metrics.followersCount * 1.3) +
          Math.min(30, metrics.connectionsCount * 1.4) +
          Math.min(25, complimentsReceivedCount * 4),
      ),
    ),
  );
  const experiencePoints = Math.max(
    60,
    Math.round(
      normalizeCount(input.user.points) +
        engagementScore * 0.32 +
        metrics.connectionsCount * 6 +
        complimentsReceivedCount * 18 +
        (input.user.verifiedEmail == true ? 40 : 0) +
        (input.user.verifiedPhoneNumber == true ? 40 : 0) +
        (input.user.isProfileVerified == true ? 180 : 0),
    ),
  );
  const level = Math.max(1, Math.min(25, Math.floor(experiencePoints / 220) + 1));
  const currentLevelXp = (level - 1) * 220;
  const nextLevelXp = level * 220;
  const progressPercent =
    level >= 25
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(((experiencePoints - currentLevelXp) / 220) * 100),
          ),
        );
  const availableTitles = resolveAvailableTitles({
    metrics,
    rating,
    complimentsReceivedCount,
    verifiedEmail: input.user.verifiedEmail == true,
    verifiedPhoneNumber: input.user.verifiedPhoneNumber == true,
    isProfileVerified: input.user.isProfileVerified == true,
  });
  const availableThemes = resolveAvailableThemes({
    metrics,
    rating,
    level,
    trustScore,
    complimentsReceivedCount,
    verifiedEmail: input.user.verifiedEmail == true,
    verifiedPhoneNumber: input.user.verifiedPhoneNumber == true,
    isProfileVerified: input.user.isProfileVerified == true,
  });
  const selectedTitle = normalizeSelectedTitle(
    input.user.selectedCharacterTitle,
    availableTitles,
  );
  const currentTitle =
    selectedTitle ?? availableTitles[availableTitles.length - 1] ?? 'New Spark';
  const selectedTheme = normalizeSelectedTheme(
    input.user.selectedCharacterTheme,
    availableThemes,
  );
  const prestigeScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(rating.score * 0.45 + trustScore * 0.35 + socialScore * 0.2),
    ),
  );

  return {
    level,
    experiencePoints,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    prestigeScore,
    trustScore,
    socialScore,
    engagementScore,
    currentTitle,
    selectedTitle,
    selectedTheme,
    selectedThemeLabel: THEME_LABELS[selectedTheme],
    availableTitles,
    availableThemes,
    complimentsReceivedCount,
    compliments,
    badges,
    rating,
    metrics,
  };
}

export function buildCharacterPreview(status) {
  return {
    level: status.level,
    prestigeScore: status.prestigeScore,
    currentTitle: status.currentTitle,
    selectedTheme: status.selectedTheme,
    selectedThemeLabel: status.selectedThemeLabel,
    complimentsReceivedCount: status.complimentsReceivedCount,
    rating: status.rating,
  };
}

function normalizeMetrics(metrics) {
  return {
    postsCount: normalizeCount(metrics.postsCount),
    viewsCount: normalizeCount(metrics.viewsCount),
    reactionsCount: normalizeCount(metrics.reactionsCount),
    commentsCount: normalizeCount(metrics.commentsCount),
    sharesCount: normalizeCount(metrics.sharesCount),
    followersCount: normalizeCount(metrics.followersCount),
    connectionsCount: normalizeCount(metrics.connectionsCount),
    profileCompletion: Math.max(
      0,
      Math.min(100, normalizeCount(metrics.profileCompletion)),
    ),
  };
}

function summarizeCompliments(tallies) {
  const counts = new Map();
  for (const definition of COMPLIMENT_DEFINITIONS) {
    counts.set(definition.type, 0);
  }

  for (const tally of tallies ?? []) {
    const type = tally?.type?.toString().trim().toLowerCase();
    if (!isComplimentTypeValue(type)) {
      continue;
    }
    counts.set(type, (counts.get(type) ?? 0) + normalizeCount(tally?.count));
  }

  return COMPLIMENT_DEFINITIONS.map((definition) => ({
    ...definition,
    count: counts.get(definition.type) ?? 0,
  }));
}

function resolveAvailableTitles(input) {
  const titles = ['New Spark'];

  if (input.metrics.profileCompletion >= 80) {
    titles.push('Profile Pro');
  }
  if (input.verifiedEmail || input.verifiedPhoneNumber) {
    titles.push('Trusted Heart');
  }
  if (input.metrics.postsCount >= 10 || input.rating.score >= 35) {
    titles.push('Top Voice');
  }
  if (
    input.metrics.followersCount >= 25 ||
    input.complimentsReceivedCount >= 3
  ) {
    titles.push('Rising Icon');
  }
  if (input.metrics.connectionsCount >= 20) {
    titles.push('Connection Magnet');
  }
  if (input.isProfileVerified) {
    titles.push('Verified Star');
  }
  if (
    input.metrics.followersCount >= 100 ||
    input.complimentsReceivedCount >= 10
  ) {
    titles.push('Community Favorite');
  }
  if (input.rating.score >= 75) {
    titles.push('Elite Match');
  }
  if (input.rating.score >= 90) {
    titles.push('Legendary Soul');
  }

  return Array.from(new Set(titles));
}

function resolveAvailableThemes(input) {
  const themes = ['classic'];

  if (input.metrics.profileCompletion >= 70 || input.level >= 3) {
    themes.push('orchid');
  }
  if (
    input.verifiedEmail ||
    input.verifiedPhoneNumber ||
    input.complimentsReceivedCount > 0
  ) {
    themes.push('sunset');
  }
  if (
    input.isProfileVerified ||
    input.rating.score >= 75 ||
    input.trustScore >= 80
  ) {
    themes.push('royal');
  }

  return Array.from(new Set(themes));
}

function normalizeSelectedTitle(value, availableTitles) {
  const normalized = value?.toString().trim();
  if (!normalized) {
    return null;
  }
  return availableTitles.includes(normalized) ? normalized : null;
}

function normalizeSelectedTheme(value, availableThemes) {
  const normalized = value?.toString().trim().toLowerCase();
  if (
    normalized &&
    isCharacterThemeValue(normalized) &&
    availableThemes.includes(normalized)
  ) {
    return normalized;
  }
  return availableThemes[availableThemes.length - 1] ?? 'classic';
}

function normalizeCount(value) {
  const numeric =
    typeof value === 'number'
      ? value
      : Number.parseInt(value?.toString() ?? '', 10);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.round(numeric));
}
