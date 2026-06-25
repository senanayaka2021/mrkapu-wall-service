import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SharePostDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  sharedByName?: string;

  @IsOptional()
  @IsString()
  sharedByAvatar?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
