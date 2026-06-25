import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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

export class ReactToPostDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(REACTION_TYPES)
  type!: (typeof REACTION_TYPES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  imageIndex?: number;
}
