import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

// DTO para establecer o registrar los objetivos nutricionales de un usuario
export class CreateNutritionGoalDto {
  // Calorías diarias recomendadas (opcional, por defecto 2200)
  @IsOptional()
  @IsInt()
  @Min(0)
  calorias_meta?: number;

  // Gramos de proteína objetivo por día
  @IsNumber()
  @Min(0)
  proteinas_meta: number;

  // Gramos de carbohidratos objetivo por día
  @IsNumber()
  @Min(0)
  carbohidratos_meta: number;

  // Gramos de grasa objetivo por día (opcional, por defecto 70.00)
  @IsOptional()
  @IsNumber()
  @Min(0)
  grasas_meta?: number;

  // Mililitros de agua sugeridos por día (opcional, por defecto 2500)
  @IsOptional()
  @IsInt()
  @Min(0)
  hidratacion_meta_ml?: number;
}

