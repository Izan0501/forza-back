import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// DTO para registrar una ingesta diaria
export class CreateDailyLogDto {
  // ID del usuario (UUID)
  @IsUUID()
  user_id: string;

  // ID de la comida del catálogo meals
  @IsUUID()
  meal_id: string;

  // Momento de la comida (ej: Desayuno, Almuerzo, Merienda, Cena)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tipo_comida: string;

  // Fecha del registro en formato "YYYY-MM-DD" (opcional: default hoy)
  @IsOptional()
  @IsDateString()
  fecha?: string;

  // Si ya fue consumida o no (opcional: default false)
  @IsOptional()
  @IsBoolean()
  consumida?: boolean;
}

