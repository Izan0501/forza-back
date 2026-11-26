import { Injectable, NotFoundException } from '@nestjs/common';
import type { nutrition_goals } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto.js';

@Injectable()
export class NutritionGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  // Prisma devuelve los Decimal como texto; los pasamos a número.
  private formatGoal(goal: nutrition_goals) {
    return {
      ...goal,
      proteinas_meta: Number(goal.proteinas_meta),
      carbohidratos_meta: Number(goal.carbohidratos_meta),
      grasas_meta: Number(goal.grasas_meta),
    };
  }

  // Buscar las metas de un usuario
  async findByUserId(userId: string) {
    const goal = await this.prisma.nutrition_goals.findUnique({
      where: { user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException(
        `Objetivos nutricionales no encontrados para el usuario con ID ${userId}`,
      );
    }

    return this.formatGoal(goal);
  }

  // Crear las metas del usuario, o actualizarlas si ya existen (upsert)
  async upsert(userId: string, dto: CreateNutritionGoalDto) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Si un campo opcional no viene, Prisma lo ignora y la base usa su valor por defecto
    const datos = {
      calorias_meta: dto.calorias_meta,
      proteinas_meta: dto.proteinas_meta,
      carbohidratos_meta: dto.carbohidratos_meta,
      grasas_meta: dto.grasas_meta,
      hidratacion_meta_ml: dto.hidratacion_meta_ml,
    };

    const goal = await this.prisma.nutrition_goals.upsert({
      where: { user_id: userId },
      create: { user_id: userId, ...datos },
      update: { ...datos, updated_at: new Date() },
    });

    return this.formatGoal(goal);
  }

  // Eliminar las metas del usuario
  async remove(userId: string) {
    await this.findByUserId(userId);

    await this.prisma.nutrition_goals.delete({ where: { user_id: userId } });

    return {
      message: 'Objetivos nutricionales eliminados exitosamente',
      userId,
    };
  }
}
