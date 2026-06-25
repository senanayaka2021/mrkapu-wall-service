import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const REACTION_TYPES = [
  'wave',
  'heart',
  'spark',
  'blush',
  'crush',
  'like',
  'love',
  'smile',
  'haha',
  'wow',
] as const;

export class ReactToCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(REACTION_TYPES)
  type!: (typeof REACTION_TYPES)[number];
}
