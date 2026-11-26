import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// DTO para validar los datos al crear una nueva comida
export class CreateMealDto {
  // Nombre del plato (máximo 100 caracteres como indica schema.prisma)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  // Descripción opcional del plato
  @IsOptional()
  @IsString()
  descripcion?: string;

  // Calorías totales de la porción (número entero mayor o igual a 0)
  @IsInt()
  @Min(0)
  calorias: number;

  // Gramos de proteína (admite decimales, ej: 25.50)
  @IsNumber()
  @Min(0)
  proteinas: number;

  // Gramos de carbohidratos (admite decimales, ej: 40.20)
  @IsNumber()
  @Min(0)
  carbohidratos: number;

  // Gramos de grasas (admite decimales, ej: 12.00)
  @IsNumber()
  @Min(0)
  grasas: number;

  // Enlace a imagen opcional
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagen_url?: string;
}

