import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMuscleGroupDto } from './dto/create-muscle-group.dto.js';
import { UpdateMuscleGroupDto } from './dto/update-muscle-group.dto.js';

@Injectable()
export class MuscleGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMuscleGroupDto: CreateMuscleGroupDto) {
    const existing = await this.prisma.muscle_groups.findUnique({
      where: { nombre: createMuscleGroupDto.nombre },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un grupo muscular con el nombre "${createMuscleGroupDto.nombre}".`,
      );
    }

    return this.prisma.muscle_groups.create({
      data: createMuscleGroupDto,
    });
  }

  findAll() {
    return this.prisma.muscle_groups.findMany();
  }

  async findOne(id: number) {
    const muscleGroup = await this.prisma.muscle_groups.findUnique({
      where: { id },
    });

    if (!muscleGroup) {
      throw new NotFoundException(
        `No existe un grupo muscular con id ${id}.`,
      );
    }

    return muscleGroup;
  }

  async update(id: number, updateMuscleGroupDto: UpdateMuscleGroupDto) {
    await this.findOne(id);

    if (updateMuscleGroupDto.nombre) {
      const existing = await this.prisma.muscle_groups.findUnique({
        where: { nombre: updateMuscleGroupDto.nombre },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un grupo muscular con el nombre "${updateMuscleGroupDto.nombre}".`,
        );
      }
    }

    return this.prisma.muscle_groups.update({
      where: { id },
      data: updateMuscleGroupDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasExercises = await this.prisma.exercises.findFirst({
      where: { muscle_group_id: id },
    });

    if (hasExercises) {
      throw new ConflictException(
        'No se puede eliminar el grupo muscular porque tiene ejercicios asociados.',
      );
    }

    return this.prisma.muscle_groups.delete({
      where: { id },
    });
  }
}
