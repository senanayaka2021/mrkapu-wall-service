// @ts-nocheck
import { HydratedDocument, Schema } from 'mongoose';
import { USER_COMPLIMENT_TYPE_VALUES } from './character-status';

export const USER_GENDER_VALUES = [
  'male',
  'female',
  'prefer_not_to_say',
] as const;

export class ReceivedCompliment {
  type?: string;
  count?: number;
}

export const ReceivedComplimentSchema = new Schema<ReceivedCompliment>(
  {
    type: {
      type: String,
      enum: [...USER_COMPLIMENT_TYPE_VALUES],
      required: true,
    },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

export class User {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  gender?: string;
  location?: string;
  city?: string;
  province?: string;
  points?: number;
  role?: string;
  profileCompletion?: number;
  bookmarkedServiceIds?: string[];
  followingIds?: string[];
  followingCount?: number;
  followerIds?: string[];
  followersCount?: number;
  connectionsCount?: number;
  earnedBadgeIds?: string[];
  badgeRewardPointsTotal?: number;
  receivedCompliments?: ReceivedCompliment[];
  selectedCharacterTitle?: string;
  selectedCharacterTheme?: string;
  verifiedEmail?: boolean;
  verifiedPhoneNumber?: boolean;
  isProfileVerified?: boolean;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = new Schema<User>(
  {
    email: { type: String, index: true, sparse: true },
    firstName: { type: String },
    lastName: { type: String },
    avatarUrl: { type: String },
    gender: { type: String, enum: [...USER_GENDER_VALUES] },
    location: { type: String },
    city: { type: String },
    province: { type: String },
    points: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    profileCompletion: { type: Number, default: 0 },
    bookmarkedServiceIds: { type: [String], default: [] },
    followingIds: { type: [String], default: [] },
    followingCount: { type: Number, default: 0 },
    followerIds: { type: [String], default: [] },
    followersCount: { type: Number, default: 0 },
    connectionsCount: { type: Number, default: 0 },
    earnedBadgeIds: { type: [String], default: [] },
    badgeRewardPointsTotal: { type: Number, default: 0 },
    receivedCompliments: { type: [ReceivedComplimentSchema], default: [] },
    selectedCharacterTitle: { type: String },
    selectedCharacterTheme: { type: String, default: 'classic' },
    verifiedEmail: { type: Boolean, default: false },
    verifiedPhoneNumber: { type: Boolean, default: false },
    isProfileVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
