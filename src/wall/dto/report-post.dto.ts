import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportPostDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
