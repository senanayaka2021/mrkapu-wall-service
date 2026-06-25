import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteWallPostDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
