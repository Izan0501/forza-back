import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../prisma/prisma-error.util.js';
import { hashPassword } from '../auth/password.util.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // El email se guarda en minúsculas (igual que en auth) para que el login lo encuentre.
    const email = createUserDto.email.trim().toLowerCase();

    await this.validateEmail(email);

    try {
      return await this.prisma.users.create({
        data: {
          nombre: createUserDto.nombre,
          email,
          password: await hashPassword(createUserDto.password),
          objetivo: createUserDto.objetivo,
          nivel_experiencia: createUserDto.nivel_experiencia,
          avatar_url: createUserDto.avatar_url,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          nivel_experiencia: true,
          objetivo: true,
          avatar_url: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'Ya existe una cuenta con ese correo electrónico.',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        nivel_experiencia: true,
        objetivo: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        nivel_experiencia: true,
        objetivo: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con id ${id}.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    // Separamos email y contraseña porque necesitan un tratamiento especial.
    const { email, password, ...otherFields } = updateUserDto;

    const newEmail = email?.trim().toLowerCase();
    if (newEmail) {
      await this.validateEmail(newEmail, id);
    }

    // La contraseña nunca se guarda en texto plano.
    const newPassword = password ? await hashPassword(password) : undefined;

    try {
      return await this.prisma.users.update({
        where: { id },
        data: {
          ...otherFields,
          email: newEmail,
          password: newPassword,
          updated_at: new Date(),
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          nivel_experiencia: true,
          objetivo: true,
          avatar_url: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'Ya existe una cuenta con ese correo electrónico.',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.users.delete({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        nivel_experiencia: true,
        objetivo: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  private async validateEmail(email: string, userId?: string) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException(
        'Ya existe una cuenta con ese correo electrónico.',
      );
    }
  }
}
