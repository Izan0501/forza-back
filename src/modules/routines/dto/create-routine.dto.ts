
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateRoutineDto {
  @IsUUID()
  user_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsInt()
  @Min(1)
  @Max(7)
  dias_por_semana: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nivel?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  activa?: boolean;
}
