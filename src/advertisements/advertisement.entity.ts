// @ts-nocheck
import { HydratedDocument, Schema } from 'mongoose';

export class AdvertisementTargeting {
  country?: string;
  provinces?: string[];
  cities?: string[];
  locationKeywords?: string[];
}

export type AdvertisementTargetingDocument =
  HydratedDocument<AdvertisementTargeting>;

export const AdvertisementTargetingSchema = new Schema<AdvertisementTargeting>(
  {
    country: { type: String, default: 'Sri Lanka' },
    provinces: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    locationKeywords: { type: [String], default: [] },
  },
  { _id: false },
);

export class AdvertisementCampaign {
  ownerUserId?: string;
  postId?: string;
  headline?: string;
  status?: string;
  paymentStatus?: string;
  targetAudienceCount?: number;
  deliveredCount?: number;
  servedUserIds?: string[];
  targeting?: AdvertisementTargeting;
  currency?: string;
  pricePerUserLkr?: number;
  budgetLkr?: number;
  startAt?: Date;
  endAt?: Date;
  activatedAt?: Date;
  lastServedAt?: Date;
}

export type AdvertisementCampaignDocument =
  HydratedDocument<AdvertisementCampaign>;

export const AdvertisementCampaignSchema = new Schema<AdvertisementCampaign>(
  {
    ownerUserId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    headline: { type: String },
    status: {
      type: String,
      enum: ['draft', 'pending_payment', 'active', 'paused', 'completed'],
      default: 'pending_payment',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
      index: true,
    },
    targetAudienceCount: { type: Number, required: true, min: 1 },
    deliveredCount: { type: Number, default: 0, min: 0 },
    servedUserIds: { type: [String], default: [] },
    targeting: { type: AdvertisementTargetingSchema, default: {} },
    currency: { type: String, default: 'LKR' },
    pricePerUserLkr: { type: Number, required: true, min: 0 },
    budgetLkr: { type: Number, required: true, min: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    activatedAt: { type: Date },
    lastServedAt: { type: Date },
  },
  { timestamps: true },
);
