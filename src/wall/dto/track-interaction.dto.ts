import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TrackWallInteractionDto {
  @IsString()
  postId!: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  profileOpenCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  commentOpenCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  mediaOpenCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  tagTapCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300000)
  mediaDwellMs?: number;

  @IsOptional()
  @IsBoolean()
  hidePost?: boolean;

  @IsOptional()
  @IsBoolean()
  muteAuthor?: boolean;

  @IsOptional()
  @IsBoolean()
  tooRepetitive?: boolean;

  @IsOptional()
  @IsBoolean()
  notMyType?: boolean;
}
