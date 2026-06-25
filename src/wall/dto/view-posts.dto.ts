import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class ViewPostsDto {
  @IsArray()
  @IsString({ each: true })
  postIds!: string[];

  @IsOptional()
  @IsObject()
  dwellMsByPostId?: Record<string, number>;
}
