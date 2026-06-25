import { IsIn, IsOptional, IsString } from 'class-validator';
import { CommentActionDto } from './comment-action.dto';

export class ReportCommentDto extends CommentActionDto {
  @IsString()
  @IsIn(['spam', 'harassment', 'inappropriate', 'other'])
  reason!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
