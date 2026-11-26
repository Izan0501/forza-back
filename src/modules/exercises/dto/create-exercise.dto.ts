
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateExerciseDto {
  @IsInt({ message: 'El grupo muscular debe ser un número entero.' })
  @Min(1)
  muscle_group_id: number;

  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  descripcion: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  dificultad?: string;

  @IsInt({ message: 'Las series deben ser un número entero.' })
  @Min(1)
  series_recomendadas: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  repeticiones_recomendadas: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagen_url?: string | null;
}
