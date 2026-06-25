import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePresignDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsOptional()
  @IsString()
  @IsIn(['image', 'video'])
  mediaType?: 'image' | 'video';
}
