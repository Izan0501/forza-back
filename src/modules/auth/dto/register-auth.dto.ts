import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  nombre: string;

  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido.' },
  )
  @MaxLength(150, {
    message: 'El correo electrónico no puede superar los 150 caracteres.',
  })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @MaxLength(128, {
    message: 'La contraseña no puede superar los 128 caracteres.',
  })
  password: string;

  // users.objetivo: VarChar(100), obligatorio y sin default en la base.
  @IsString({ message: 'El objetivo debe ser un texto.' })
  @IsNotEmpty({ message: 'El objetivo es obligatorio.' })
  @MaxLength(100, {
    message: 'El objetivo no puede superar los 100 caracteres.',
  })
  objetivo: string;

  // users.nivel_experiencia: VarChar(30), default 'Principiante'.
  // La base no define CHECK sobre esta columna, por eso solo se valida tipo y longitud.
  @IsOptional()
  @IsString({ message: 'El nivel de experiencia debe ser un texto.' })
  @IsNotEmpty({ message: 'El nivel de experiencia no puede estar vacío.' })
  @MaxLength(30, {
    message: 'El nivel de experiencia no puede superar los 30 caracteres.',
  })
  nivel_experiencia?: string;

  // users.avatar_url: VarChar(255), nullable.
  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser un texto.' })
  @MaxLength(255, {
    message: 'La URL del avatar no puede superar los 255 caracteres.',
  })
  avatar_url?: string;
}
