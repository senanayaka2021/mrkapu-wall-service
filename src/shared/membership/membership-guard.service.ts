import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ collection: 'auth_users' })
export class UserRef {
  @Prop() account_type?: string;
  @Prop() membership_tier?: string;
  @Prop() membership_expires_at?: Date;
}

export type UserRefDocument = HydratedDocument<UserRef>;
export const UserRefSchema = SchemaFactory.createForClass(UserRef);

// Tiers are per-track — premium belongs to user track, platinum to service_account track.
// A silver service account must never satisfy a premium requirement, and vice versa.
const TRACK_OF: Record<string, string> = {
  free: 'user',
  premium: 'user',
  silver: 'service_account',
  platinum: 'service_account',
};

const TIER_RANK: Record<string, number> = {
  free: 0,
  premium: 1,
  silver: 0,
  platinum: 1,
};

export interface UserMembership {
  accountType: string;
  effectiveTier: string;
}

@Injectable()
export class MembershipGuardService {
  constructor(
    @InjectModel(UserRef.name) private readonly userRefModel: Model<UserRefDocument>,
  ) {}

  async getMembership(userId: string): Promise<UserMembership | null> {
    const user = await this.userRefModel
      .findById(userId)
      .select('account_type membership_tier membership_expires_at')
      .lean()
      .exec();

    if (!user) return null;

    const accountType = user.account_type || 'user';
    const expiresAt = user.membership_expires_at;
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
    const defaultTier = accountType === 'service_account' ? 'silver' : 'free';
    const effectiveTier = isExpired ? defaultTier : (user.membership_tier || defaultTier);

    return { accountType, effectiveTier };
  }

  async requireTier(userId: string, requiredTier: string, feature: string): Promise<void> {
    const membership = await this.getMembership(userId);
    if (!membership) return;

    const { accountType, effectiveTier } = membership;

    // Track mismatch: a service_account can never satisfy a user-track requirement and vice versa.
    const requiredTrack = TRACK_OF[requiredTier];
    if (requiredTrack && requiredTrack !== accountType) {
      throw new ForbiddenException({
        error: 'UPGRADE_REQUIRED',
        requiredTier,
        feature,
      });
    }

    const effectiveRank = TIER_RANK[effectiveTier] ?? 0;
    const requiredRank = TIER_RANK[requiredTier] ?? 0;

    if (effectiveRank < requiredRank) {
      throw new ForbiddenException({
        error: 'UPGRADE_REQUIRED',
        requiredTier,
        feature,
      });
    }
  }

  // Returns max allowed video duration in seconds for the personal wall.
  async getMaxVideoDurationSec(userId: string): Promise<number> {
    const membership = await this.getMembership(userId);
    if (!membership) return 30;
    if (membership.accountType === 'user' && membership.effectiveTier === 'premium') {
      return 180;
    }
    return 30;
  }
}
