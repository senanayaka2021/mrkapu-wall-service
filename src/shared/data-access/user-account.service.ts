// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from '../../user/user.entity';
import { createDomainEvent, DOMAIN_EVENT_TYPES } from '../contracts/domain-events';
import { EventPublisherService } from '../events/event-publisher.service';

@Injectable()
export class UserAccountService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<any>,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(data) {
    const user = new this.userModel(data);
    const saved = await user.save();
    await this.eventPublisher.publish(
      createDomainEvent(DOMAIN_EVENT_TYPES.userProfileUpdated, {
        userId: saved._id.toString(),
      }),
    );
    return saved;
  }

  async findById(id) {
    return this.userModel.findById(id).exec();
  }

  async findByIds(ids, select) {
    const validIds = Array.from(
      new Set(
        ids.filter((id) => typeof id === 'string' && isValidObjectId(id)),
      ),
    );
    if (!validIds.length) {
      return [];
    }

    const query = this.userModel.find({ _id: { $in: validIds } });
    if (select?.trim()) {
      query.select(select);
    }
    return query.lean().exec();
  }

  async findManyByIds(ids, select) {
    return this.findByIds(ids, select);
  }

  async updateById(id, data) {
    const updated = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (updated) {
      await this.eventPublisher.publish(
        createDomainEvent(DOMAIN_EVENT_TYPES.userProfileUpdated, {
          userId: updated._id.toString(),
        }),
      );
    }

    return updated;
  }

  async incrementPoints(id, delta) {
    return this.userModel
      .findByIdAndUpdate(id, { $inc: { points: delta } }, { new: true })
      .exec();
  }

  async setRole(id, role) {
    return this.updateById(id, { role });
  }

  async addBookmarkedService(actorId, serviceId) {
    const actor = await this.userModel.findById(actorId).exec();
    if (!actor) {
      return null;
    }

    actor.bookmarkedServiceIds = Array.isArray(actor.bookmarkedServiceIds)
      ? actor.bookmarkedServiceIds
      : [];
    if (!actor.bookmarkedServiceIds.includes(serviceId)) {
      actor.bookmarkedServiceIds.push(serviceId);
    }
    actor.bookmarkedServiceIds = Array.from(
      new Set(actor.bookmarkedServiceIds),
    );
    await actor.save();
    return actor.bookmarkedServiceIds;
  }

  async removeBookmarkedService(actorId, serviceId) {
    const actor = await this.userModel.findById(actorId).exec();
    if (!actor) {
      return null;
    }

    actor.bookmarkedServiceIds = (actor.bookmarkedServiceIds || []).filter(
      (id) => id !== serviceId,
    );
    await actor.save();
    return actor.bookmarkedServiceIds;
  }

  async followUser(actorId, targetUserId) {
    if (actorId === targetUserId) {
      return { isFollowing: false, followersCount: 0, followingCount: 0 };
    }

    const actor = await this.userModel.findById(actorId).exec();
    const target = await this.userModel.findById(targetUserId).exec();
    if (!actor || !target) {
      return null;
    }

    actor.followingIds = Array.isArray(actor.followingIds)
      ? actor.followingIds
      : [];
    target.followerIds = Array.isArray(target.followerIds)
      ? target.followerIds
      : [];

    if (!actor.followingIds.includes(targetUserId)) {
      actor.followingIds.push(targetUserId);
    }
    if (!target.followerIds.includes(actorId)) {
      target.followerIds.push(actorId);
    }

    actor.followingIds = Array.from(new Set(actor.followingIds));
    target.followerIds = Array.from(new Set(target.followerIds));
    actor.followingCount = actor.followingIds.length;
    target.followersCount = target.followerIds.length;

    await Promise.all([actor.save(), target.save()]);
    await Promise.all([
      this.eventPublisher.publish(
        createDomainEvent(DOMAIN_EVENT_TYPES.userProfileUpdated, {
          userId: actorId,
        }),
      ),
      this.eventPublisher.publish(
        createDomainEvent(DOMAIN_EVENT_TYPES.userProfileUpdated, {
          userId: targetUserId,
        }),
      ),
    ]);

    return {
      isFollowing: true,
      followersCount: target.followersCount,
      followingCount: actor.followingCount,
    };
  }
}
