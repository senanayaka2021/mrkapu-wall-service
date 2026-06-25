import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const LAYOUT_STYLES = ['classic', 'columns', 'frame'] as const;

export class EditWallPostDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoThumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsIn(LAYOUT_STYLES)
  layoutStyle?: (typeof LAYOUT_STYLES)[number];
}
