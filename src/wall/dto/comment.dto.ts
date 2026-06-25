import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddCommentDto {
  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  imageIndex?: number;
}
