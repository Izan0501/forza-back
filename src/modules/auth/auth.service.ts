import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { users } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { hashPassword, verifyPassword } from './password.util.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterAuthDto) {
    // Guardamos el email siempre en minúsculas para que no haya duplicados.
    const email = dto.email.trim().toLowerCase();

    // 1. Verificar que el email no esté usado.
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo electrónico.',
      );
    }

    // 2. Encriptar la contraseña (nunca se guarda en texto plano).
    const passwordHash = await hashPassword(dto.password);

    // 3. Crear el usuario en la base de datos.
    const user = await this.prisma.users.create({
      data: {
        nombre: dto.nombre.trim(),
        email,
        password: passwordHash,
        objetivo: dto.objetivo.trim(),
        nivel_experiencia: dto.nivel_experiencia?.trim(),
        avatar_url: dto.avatar_url?.trim(),
      },
    });

    // 4. Responder con el usuario y su token.
    return this.buildResponse(user);
  }

  async login(dto: LoginAuthDto) {
    const email = dto.email.trim().toLowerCase();

    // 1. Buscar el usuario por email.
    const user = await this.prisma.users.findUnique({ where: { email } });

    // 2. Comparar la contraseña con el hash guardado.
    // Si falla algo de lo anterior, el mensaje es el mismo
    // para no revelar si el email existe o no.
    const passwordIsValid = user
      ? await verifyPassword(dto.password, user.password)
      : false;

    if (!user || !passwordIsValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // 3. Responder con el usuario y su token.
    return this.buildResponse(user);
  }

  // Arma la respuesta de register y login: usuario (sin contraseña) + token.
  private async buildResponse(user: users) {
    const { password: _password, ...userWithoutPassword } = user;

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { user: userWithoutPassword, access_token };
  }
}
