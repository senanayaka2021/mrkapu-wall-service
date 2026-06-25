import { IsInt, IsOptional, Min } from 'class-validator';

export class CommentActionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  imageIndex?: number;
}
