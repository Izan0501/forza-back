
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createExerciseDto: CreateExerciseDto) {
    await this.validateMuscleGroup(createExerciseDto.muscle_group_id);

    return this.prisma.exercises.create({
      data: createExerciseDto,
    });
  }

  findAll() {
    return this.prisma.exercises.findMany();
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercises.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException(
        `No existe un ejercicio con id ${id}.`,
      );
    }

    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    await this.findOne(id);

    if (updateExerciseDto.muscle_group_id !== undefined) {
      await this.validateMuscleGroup(updateExerciseDto.muscle_group_id);
    }

    return this.prisma.exercises.update({
      where: { id },
      data: updateExerciseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const relation = await this.prisma.routine_exercises.findFirst({
      where: { exercise_id: id },
    });

    if (relation) {
      throw new ConflictException(
        'No se puede eliminar un ejercicio asociado a una rutina.',
      );
    }

    return this.prisma.exercises.delete({
      where: { id },
    });
  }

  private async validateMuscleGroup(id: number) {
    const muscleGroup = await this.prisma.muscle_groups.findUnique({
      where: { id },
    });

    if (!muscleGroup) {
      throw new NotFoundException(
        `No existe un grupo muscular con id ${id}.`,
      );
    }
  }
}
