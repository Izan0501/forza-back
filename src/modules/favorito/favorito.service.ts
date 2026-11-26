import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../prisma/prisma-error.util.js';
import { CreateFavoritoDto } from './dto/create-favorito.dto.js';
import { UpdateFavoritoDto } from './dto/update-favorito.dto.js';

@Injectable()
export class FavoritoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFavoritoDto: CreateFavoritoDto) {
    const { user_id, exercise_id, routine_id } = createFavoritoDto;

    // Debe enviarse exactamente uno de los dos: exercise_id o routine_id.
    this.validateSingleTarget(exercise_id, routine_id);

    await this.validateUserExists(user_id);

    if (exercise_id) {
      await this.validateExerciseExists(exercise_id);
      await this.validateUniqueExerciseFavorite(user_id, exercise_id);
    }

    if (routine_id) {
      await this.validateRoutineExists(routine_id);
      await this.validateUniqueRoutineFavorite(user_id, routine_id);
    }

    try {
      return await this.prisma.favorites.create({
        data: {
          user_id,
          exercise_id: exercise_id ?? null,
          routine_id: routine_id ?? null,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'Este recurso ya se encuentra guardado en favoritos para este usuario.',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.favorites.findMany();
  }

  async findOne(id: string) {
    const favorite = await this.prisma.favorites.findUnique({
      where: { id },
    });

    if (!favorite) {
      throw new NotFoundException(`No existe un favorito con id ${id}.`);
    }

    return favorite;
  }

  async update(id: string, updateFavoritoDto: UpdateFavoritoDto) {
    const existingFavorite = await this.findOne(id);

    const { user_id, exercise_id, routine_id } = updateFavoritoDto;

    if (exercise_id && routine_id) {
      throw new BadRequestException(
        'Debes enviar exactamente uno de los dos campos: exercise_id o routine_id.',
      );
    }

    const nextUserId = user_id ?? existingFavorite.user_id;
    let nextExerciseId = existingFavorite.exercise_id;
    let nextRoutineId = existingFavorite.routine_id;

    // Si se cambia a un ejercicio, se limpia routine_id (y viceversa).
    if (exercise_id) {
      nextExerciseId = exercise_id;
      nextRoutineId = null;
    } else if (routine_id) {
      nextRoutineId = routine_id;
      nextExerciseId = null;
    }

    this.validateSingleTarget(nextExerciseId, nextRoutineId);

    if (user_id) {
      await this.validateUserExists(nextUserId);
    }

    if (nextExerciseId) {
      if (exercise_id) {
        await this.validateExerciseExists(nextExerciseId);
      }
      await this.validateUniqueExerciseFavorite(nextUserId, nextExerciseId, id);
    }

    if (nextRoutineId) {
      if (routine_id) {
        await this.validateRoutineExists(nextRoutineId);
      }
      await this.validateUniqueRoutineFavorite(nextUserId, nextRoutineId, id);
    }

    try {
      return await this.prisma.favorites.update({
        where: { id },
        data: {
          user_id: nextUserId,
          exercise_id: nextExerciseId,
          routine_id: nextRoutineId,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'Este recurso ya se encuentra guardado en favoritos para este usuario.',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.favorites.delete({
      where: { id },
    });
  }

  private validateSingleTarget(
    exerciseId?: string | null,
    routineId?: string | null,
  ) {
    const hasExercise = Boolean(exerciseId);
    const hasRoutine = Boolean(routineId);

    if (hasExercise === hasRoutine) {
      throw new BadRequestException(
        'Debes enviar exactamente uno de los dos campos: exercise_id o routine_id.',
      );
    }
  }

  private async validateUserExists(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con id ${userId}.`);
    }
  }

  private async validateExerciseExists(exerciseId: string) {
    const exercise = await this.prisma.exercises.findUnique({
      where: { id: exerciseId },
      select: { id: true },
    });

    if (!exercise) {
      throw new NotFoundException(
        `No existe un ejercicio con id ${exerciseId}.`,
      );
    }
  }

  private async validateRoutineExists(routineId: string) {
    const routine = await this.prisma.routines.findUnique({
      where: { id: routineId },
      select: { id: true },
    });

    if (!routine) {
      throw new NotFoundException(`No existe una rutina con id ${routineId}.`);
    }
  }

  private async validateUniqueExerciseFavorite(
    userId: string,
    exerciseId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.favorites.findUnique({
      where: {
        user_id_exercise_id: {
          user_id: userId,
          exercise_id: exerciseId,
        },
      },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Este ejercicio ya se encuentra guardado en favoritos para este usuario.',
      );
    }
  }

  private async validateUniqueRoutineFavorite(
    userId: string,
    routineId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.favorites.findUnique({
      where: {
        user_id_routine_id: {
          user_id: userId,
          routine_id: routineId,
        },
      },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Esta rutina ya se encuentra guardada en favoritos para este usuario.',
      );
    }
  }
}
