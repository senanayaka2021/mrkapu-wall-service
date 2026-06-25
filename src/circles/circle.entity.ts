// @ts-nocheck
import { HydratedDocument, Schema } from 'mongoose';

export class Circle {
  name?: string;
  description?: string;
  category?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  visibility?: string;
  tags?: string[];
  createdBy?: string;
  memberIds?: string[];
  memberCount?: number;
  postsCount?: number;
  lastPostAt?: Date | null;
}

export type CircleDocument = HydratedDocument<Circle>;

export const CircleSchema = new Schema<Circle>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String },
    avatarUrl: { type: String },
    coverImageUrl: { type: String },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    tags: { type: [String], default: [] },
    createdBy: { type: String, required: true, index: true },
    memberIds: { type: [String], default: [] },
    memberCount: { type: Number, default: 1 },
    postsCount: { type: Number, default: 0 },
    lastPostAt: { type: Date },
  },
  { timestamps: true },
);

export class CirclePost {
  circleId?: string;
  userId?: string;
  authorName?: string;
  authorAvatar?: string;
  caption?: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  layoutStyle?: string;
  wallPostId?: string;
}

export type CirclePostDocument = HydratedDocument<CirclePost>;

export const CirclePostSchema = new Schema<CirclePost>(
  {
    circleId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    authorName: { type: String },
    authorAvatar: { type: String },
    caption: { type: String },
    imageUrl: { type: String },
    imageUrls: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    layoutStyle: {
      type: String,
      enum: ['classic', 'columns', 'frame'],
      default: 'classic',
    },
    wallPostId: { type: String },
  },
  { timestamps: true },
);
