import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMuscleGroupDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  nombre: string;
}
