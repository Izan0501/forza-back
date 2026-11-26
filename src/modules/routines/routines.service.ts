
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRoutineDto } from './dto/create-routine.dto.js';
import { UpdateRoutineDto } from './dto/update-routine.dto.js';

@Injectable()
export class RoutinesService {
  constructor(private readonly prisma: PrismaService) { }

  // Crear una rutina
  async create(createRoutineDto: CreateRoutineDto) {
    await this.validateUser(createRoutineDto.user_id);

    return this.prisma.routines.create({
      data: createRoutineDto,
    });
  }

  // Listar todas las rutinas
  findAll() {
    return this.prisma.routines.findMany();
  }

  // Buscar una rutina por ID
  async findOne(id: string) {
    const routine = await this.prisma.routines.findUnique({
      where: { id },
    });

    if (!routine) {
      throw new NotFoundException(
        `No existe una rutina con id ${id}.`,
      );
    }

    return routine;
  }

  // Actualizar una rutina
  async update(id: string, updateRoutineDto: UpdateRoutineDto) {
    await this.findOne(id);

    if (updateRoutineDto.user_id !== undefined) {
      await this.validateUser(updateRoutineDto.user_id);
    }

    return this.prisma.routines.update({
      where: { id },
      data: {
        ...updateRoutineDto,
        updated_at: new Date(),
      },
    });
  }

  // Eliminar una rutina
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.routines.delete({
      where: { id },
    });
  }

  // Comprobar que el usuario exista
  private async validateUser(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `No existe un usuario con id ${id}.`,
      );
    }
  }
}
