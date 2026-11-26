import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

// DTO para registrar o actualizar el consumo diario de agua
export class CreateHydrationDto {
  // ID del usuario que registra el consumo (UUID obligatorio)
  @IsUUID()
  user_id: string;

  // Cantidad de agua en mililitros (ej: 500, 2000)
  @IsInt()
  @Min(0)
  cantidad_ml: number;

  // Fecha en formato "YYYY-MM-DD" (opcional: si no se envía, toma la fecha de hoy)
  @IsOptional()
  @IsDateString()
  fecha?: string;
}

