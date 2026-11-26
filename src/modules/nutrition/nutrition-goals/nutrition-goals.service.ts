import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto.js';

@Injectable()
export class NutritionGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  // Convierte los Decimal de Prisma a Number estándar
  private formatGoal(goal: any) {
    return {
      ...goal,
      calorias_meta: Number(goal.calorias_meta),
      proteinas_meta: Number(goal.proteinas_meta),
      carbohidratos_meta: Number(goal.carbohidratos_meta),
      grasas_meta: Number(goal.grasas_meta),
      hidratacion_meta_ml: Number(goal.hidratacion_meta_ml),
    };
  }

  // Buscar los objetivos de un usuario específico
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

  // Crear o actualizar (upsert) los objetivos del usuario
  async upsert(userId: string, dto: CreateNutritionGoalDto) {
    // Verificamos que el usuario exista en la base de datos
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Upsert: si no existe lo crea; si ya existe lo actualiza
    const goal = await this.prisma.nutrition_goals.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        calorias_meta: dto.calorias_meta ?? 2200,
        proteinas_meta: dto.proteinas_meta,
        carbohidratos_meta: dto.carbohidratos_meta,
        grasas_meta: dto.grasas_meta ?? 70.0,
        hidratacion_meta_ml: dto.hidratacion_meta_ml ?? 2500,
      },
      update: {
        ...(dto.calorias_meta !== undefined && { calorias_meta: dto.calorias_meta }),
        ...(dto.proteinas_meta !== undefined && { proteinas_meta: dto.proteinas_meta }),
        ...(dto.carbohidratos_meta !== undefined && { carbohidratos_meta: dto.carbohidratos_meta }),
        ...(dto.grasas_meta !== undefined && { grasas_meta: dto.grasas_meta }),
        ...(dto.hidratacion_meta_ml !== undefined && { hidratacion_meta_ml: dto.hidratacion_meta_ml }),
        updated_at: new Date(),
      },
    });

    return this.formatGoal(goal);
  }

  // Eliminar los objetivos del usuario
  async remove(userId: string) {
    // Verificamos que existan objetivos configurados
    await this.findByUserId(userId);

    await this.prisma.nutrition_goals.delete({
      where: { user_id: userId },
    });

    return {
      message: 'Objetivos nutricionales eliminados exitosamente',
      userId,
    };
  }
}

