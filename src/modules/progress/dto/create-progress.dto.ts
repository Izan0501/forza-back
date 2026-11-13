import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProgressDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsString()
  @MinLength(2)
  workout: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calories?: number;

  @IsString()
  @IsOptional()
  date?: string;
}
