// @ts-nocheck
import { HydratedDocument, Schema } from 'mongoose';

export class WallViewEvent {
  viewerId?: string;
  postId?: string;
  authorId?: string;
  tags?: string[];
  totalDwellMs?: number;
  viewsCount?: number;
  profileOpenCount?: number;
  commentOpenCount?: number;
  mediaOpenCount?: number;
  tagTapCount?: number;
  mediaDwellMs?: number;
  hiddenPost?: boolean;
  mutedAuthor?: boolean;
  tooRepetitiveCount?: number;
  notMyTypeCount?: number;
  lastViewedAt?: Date;
}

export type WallViewEventDocument = HydratedDocument<WallViewEvent>;

export const WallViewEventSchema = new Schema<WallViewEvent>(
  {
    viewerId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    authorId: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    totalDwellMs: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    profileOpenCount: { type: Number, default: 0 },
    commentOpenCount: { type: Number, default: 0 },
    mediaOpenCount: { type: Number, default: 0 },
    tagTapCount: { type: Number, default: 0 },
    mediaDwellMs: { type: Number, default: 0 },
    hiddenPost: { type: Boolean, default: false },
    mutedAuthor: { type: Boolean, default: false },
    tooRepetitiveCount: { type: Number, default: 0 },
    notMyTypeCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

WallViewEventSchema.index({ viewerId: 1, postId: 1 }, { unique: true });
