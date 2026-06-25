// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { AdvertisementCampaign } from '../../advertisements/advertisement.entity';
import { User } from '../../user/user.entity';
import { WallPost } from '../../wall/wall.entity';

@Injectable()
export class AdvertisementPlacementService {
  constructor(
    @InjectModel(AdvertisementCampaign.name)
    private readonly advertisementModel: Model<any>,
    @InjectModel(User.name) private readonly userModel: Model<any>,
    @InjectModel(WallPost.name) private readonly wallPostModel: Model<any>,
  ) {}

  private normalizeString(value) {
    return (value ?? '').trim();
  }

  private normalizeStringList(values) {
    return Array.from(
      new Set(
        (values || [])
          .map((value) => this.normalizeString(value).toLowerCase())
          .filter((value) => value.length > 0),
      ),
    );
  }

  private viewerLocationTokens(user) {
    const tokens = new Set();
    const rawValues = [user.location, user.city, user.province, 'sri lanka'];
    for (const raw of rawValues) {
      const normalized = this.normalizeString(raw).toLowerCase();
      if (!normalized) {
        continue;
      }
      tokens.add(normalized);
      normalized
        .split(/[,-]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .forEach((part) => tokens.add(part));
    }
    return tokens;
  }

  private matchesLocationList(viewerTokens, targets) {
    const normalizedTargets = this.normalizeStringList(targets);
    if (!normalizedTargets.length) {
      return true;
    }

    return normalizedTargets.some((target) => {
      for (const token of viewerTokens) {
        if (token.includes(target) || target.includes(token)) {
          return true;
        }
      }
      return false;
    });
  }

  private matchesViewerLocation(campaign, viewer) {
    const targeting = campaign.targeting || {};
    const viewerTokens = this.viewerLocationTokens(viewer);
    const country = this.normalizeString(targeting.country).toLowerCase();

    if (country.length > 0 && country !== 'sri lanka') {
      if (!this.matchesLocationList(viewerTokens, [country])) {
        return false;
      }
    }
    if (!this.matchesLocationList(viewerTokens, targeting.provinces)) {
      return false;
    }
    if (!this.matchesLocationList(viewerTokens, targeting.cities)) {
      return false;
    }
    if (!this.matchesLocationList(viewerTokens, targeting.locationKeywords)) {
      return false;
    }

    return true;
  }

  async resolveSponsoredPostForViewer(viewerId, excludedPostIds = []) {
    if (!isValidObjectId(viewerId)) {
      return null;
    }

    const viewer = await this.userModel.findById(viewerId).lean().exec();
    if (!viewer) {
      return null;
    }

    const now = new Date();
    const campaigns = await this.advertisementModel
      .find({
        ownerUserId: { $ne: viewerId },
        postId: { $nin: excludedPostIds },
        status: 'active',
        paymentStatus: 'paid',
        $or: [{ startAt: null }, { startAt: { $lte: now } }],
      })
      .sort({ activatedAt: -1, createdAt: -1 })
      .limit(30)
      .lean()
      .exec();

    for (const campaign of campaigns) {
      const deliveredCount = Number(campaign.deliveredCount || 0);
      const targetAudienceCount = Number(campaign.targetAudienceCount || 0);
      const servedUserIds = Array.isArray(campaign.servedUserIds)
        ? campaign.servedUserIds
        : [];

      if (campaign.endAt && new Date(campaign.endAt) < now) {
        continue;
      }
      if (deliveredCount >= targetAudienceCount) {
        continue;
      }
      if (servedUserIds.includes(viewerId)) {
        continue;
      }
      if (!this.matchesViewerLocation(campaign, viewer)) {
        continue;
      }

      const updated = await this.advertisementModel
        .findOneAndUpdate(
          { _id: campaign._id, servedUserIds: { $ne: viewerId } },
          {
            $addToSet: { servedUserIds: viewerId },
            $inc: { deliveredCount: 1 },
            $set: { lastServedAt: now },
          },
          { new: true },
        )
        .lean()
        .exec();

      if (!updated) {
        continue;
      }

      if (
        Number(updated.deliveredCount || 0) >=
        Number(updated.targetAudienceCount || 0)
      ) {
        await this.advertisementModel.updateOne(
          { _id: updated._id },
          { $set: { status: 'completed' } },
        );
      }

      const post = await this.wallPostModel
        .findById(updated.postId)
        .lean()
        .exec();
      if (!post) {
        continue;
      }

      return { campaign: updated, post };
    }

    return null;
  }
}
