import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

// DTO para asignar un plato al plan semanal de un usuario
export class CreateMealPlanDto {
  // ID del usuario (UUID)
  @IsUUID()
  user_id: string;

  // ID de la comida a asignar (debe existir en la tabla meals)
  @IsUUID()
  meal_id: string;

  // Día de la semana (ej: Lunes, Martes, etc.)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dia_semana: string;

  // Tipo de comida (ej: Desayuno, Almuerzo, Merienda, Cena)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tipo_comida: string;

  // Hora sugerida validada con formato 24hs "HH:mm" (ej: "08:30", "13:00")
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'hora_sugerida debe tener formato de 24 horas HH:mm (ej: 08:30 o 14:00)',
  })
  hora_sugerida: string;
}

