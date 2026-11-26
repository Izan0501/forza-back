import { IsOptional, IsUUID } from 'class-validator';

export class CreateFavoritoDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsUUID()
  exercise_id?: string;

  @IsOptional()
  @IsUUID()
  routine_id?: string;
}
