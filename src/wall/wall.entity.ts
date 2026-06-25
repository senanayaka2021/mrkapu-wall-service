// @ts-nocheck
import { HydratedDocument, Schema } from 'mongoose';

export class WallReaction {
  userId?: string;
  type?: string;
  createdAt?: Date;
}

export const WallReactionSchema = new Schema<WallReaction>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export class WallComment {
  commentId?: string;
  userId?: string;
  authorName?: string;
  authorAvatar?: string;
  text?: string;
  reactions?: WallReaction[];
  reports?: WallPostReport[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const WallCommentSchema = new Schema<WallComment>(
  {
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    authorName: { type: String },
    authorAvatar: { type: String },
    text: { type: String, required: true },
    reactions: { type: [WallReactionSchema], default: [] },
    reports: { type: [WallPostReportSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export class WallImageEngagement {
  imageIndex?: number;
  imageUrl?: string;
  reactions?: WallReaction[];
  comments?: WallComment[];
  updatedAt?: Date;
}

export const WallImageEngagementSchema = new Schema<WallImageEngagement>(
  {
    imageIndex: { type: Number, required: true },
    imageUrl: { type: String },
    reactions: { type: [WallReactionSchema], default: [] },
    comments: { type: [WallCommentSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export class WallPostReport {
  userId?: string;
  reason?: string;
  description?: string;
  createdAt?: Date;
}

export const WallPostReportSchema = new Schema<WallPostReport>(
  {
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export class WallPostShare {
  userId?: string;
  sharedByName?: string;
  platform?: string;
  createdAt?: Date;
}

export const WallPostShareSchema = new Schema<WallPostShare>(
  {
    userId: { type: String, required: true },
    sharedByName: { type: String },
    platform: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export class WallPost {
  userId?: string;
  authorName?: string;
  authorAvatar?: string;
  caption?: string;
  imageUrl?: string;
  imageUrls?: string[];
  imageThumbnailUrls?: string[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  tags?: string[];
  layoutStyle?: string;
  sourceType?: string;
  circleId?: string | null;
  circleName?: string | null;
  circleAvatarUrl?: string | null;
  circleVisibility?: string | null;
  circlePostId?: string | null;
  reactions?: WallReaction[];
  comments?: WallComment[];
  imageEngagement?: WallImageEngagement[];
  reports?: WallPostReport[];
  shares?: WallPostShare[];
  viewedBy?: string[];
  viewsCount?: number;
  isSharedPost?: boolean;
  sharedFromPostId?: string;
  sharedOriginalAuthorName?: string;
  sharedAt?: Date;
  engagementScore?: number;
  rankingDebug?: Record<string, unknown>;
}

export type WallPostDocument = HydratedDocument<WallPost>;

export const WallPostSchema = new Schema<WallPost>(
  {
    userId: { type: String, required: true, index: true },
    authorName: { type: String },
    authorAvatar: { type: String },
    caption: { type: String },
    imageUrl: { type: String },
    imageUrls: { type: [String], default: [] },
    imageThumbnailUrls: { type: [String], default: [] },
    videoUrl: { type: String },
    videoThumbnailUrl: { type: String },
    tags: { type: [String], default: [] },
    layoutStyle: { type: String, default: 'classic' },
    sourceType: { type: String, default: 'wall' },
    circleId: { type: String },
    circleName: { type: String },
    circleAvatarUrl: { type: String },
    circleVisibility: { type: String },
    circlePostId: { type: String },
    reactions: { type: [WallReactionSchema], default: [] },
    comments: { type: [WallCommentSchema], default: [] },
    imageEngagement: { type: [WallImageEngagementSchema], default: [] },
    reports: { type: [WallPostReportSchema], default: [] },
    shares: { type: [WallPostShareSchema], default: [] },
    viewedBy: { type: [String], default: [] },
    viewsCount: { type: Number, default: 0 },
    isSharedPost: { type: Boolean, default: false },
    sharedFromPostId: { type: String },
    sharedOriginalAuthorName: { type: String },
    sharedAt: { type: Date },
    engagementScore: { type: Number, default: 0 },
    rankingDebug: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);
