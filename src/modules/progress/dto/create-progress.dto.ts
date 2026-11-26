import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProgressDto {
  // UUID del usuario que realizó el entrenamiento. Es obligatorio.
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido.' })
  user_id: string;

  // UUID de la rutina asociada. Es opcional (puede no estar vinculado a ninguna rutina).
  @IsOptional()
  @IsUUID('4', { message: 'El routine_id debe ser un UUID válido.' })
  routine_id?: string | null;

  // Fecha del entrenamiento en formato YYYY-MM-DD. Es opcional (si no se envía, la BD usa la fecha actual).
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener el formato YYYY-MM-DD.' })
  fecha?: string;

  // Indica si el entrenamiento fue completado. Es opcional (la BD usa true por defecto).
  @IsOptional()
  @IsBoolean({ message: 'El campo completada debe ser true o false.' })
  completada?: boolean;

  // Notas o comentarios adicionales sobre el entrenamiento. Es opcional.
  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto.' })
  notas?: string | null;
}
