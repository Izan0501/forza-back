import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { meal_plans, meals } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-error.util.js';
import { MealsService } from '../meals/meals.service.js';
import { formatMeal } from '../nutrition.util.js';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto.js';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto.js';

// Un ítem del plan junto con los datos de su comida
type MealPlanWithMeal = meal_plans & { meals: meals };

// La hora se guarda como Time en la base: la pasamos de "13:30" a Date y viceversa
function parseTime(hora: string): Date {
  return new Date(`1970-01-01T${hora}:00.000Z`);
}

function formatTime(hora: Date): string {
  return hora.toISOString().slice(11, 16);
}

@Injectable()
export class MealPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mealsService: MealsService,
  ) {}

  // Devuelve el plan con la hora como "HH:mm" y los números de la comida
  private formatPlan(plan: MealPlanWithMeal) {
    return {
      ...plan,
      hora_sugerida: formatTime(plan.hora_sugerida),
      meals: formatMeal(plan.meals),
    };
  }

  // Mensaje para cuando ya hay una comida en ese día y momento
  private duplicateMessage(dia: string, tipo: string) {
    return `Ya existe una comida asignada para ${dia} en ${tipo}`;
  }

  // Asignar una comida al plan semanal
  async create(dto: CreateMealPlanDto) {
    // 1. El usuario y la comida tienen que existir
    const user = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${dto.user_id} no encontrado`,
      );
    }

    await this.mealsService.findOne(dto.meal_id);

    // 2. Crear el ítem (la base no permite repetir usuario + día + tipo de comida)
    try {
      const plan = await this.prisma.meal_plans.create({
        data: {
          user_id: dto.user_id,
          meal_id: dto.meal_id,
          dia_semana: dto.dia_semana,
          tipo_comida: dto.tipo_comida,
          hora_sugerida: parseTime(dto.hora_sugerida),
        },
        include: { meals: true },
      });

      return this.formatPlan(plan);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          this.duplicateMessage(dto.dia_semana, dto.tipo_comida),
        );
      }

      throw error;
    }
  }

  // Listar ítems del plan; userId y dia son filtros opcionales
  async findAll(userId?: string, dia?: string) {
    const plans = await this.prisma.meal_plans.findMany({
      where: { user_id: userId, dia_semana: dia },
      include: { meals: true },
      orderBy: [{ dia_semana: 'asc' }, { hora_sugerida: 'asc' }],
    });

    return plans.map((plan) => this.formatPlan(plan));
  }

  // Buscar un ítem del plan por su ID
  async findOne(id: string) {
    const plan = await this.prisma.meal_plans.findUnique({
      where: { id },
      include: { meals: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de comida con ID ${id} no encontrado`);
    }

    return this.formatPlan(plan);
  }

  // Actualizar un ítem del plan
  async update(id: string, dto: UpdateMealPlanDto) {
    const current = await this.findOne(id);

    // Si se cambia la comida, tiene que existir
    if (dto.meal_id) {
      await this.mealsService.findOne(dto.meal_id);
    }

    try {
      const plan = await this.prisma.meal_plans.update({
        where: { id },
        data: {
          meal_id: dto.meal_id,
          dia_semana: dto.dia_semana,
          tipo_comida: dto.tipo_comida,
          hora_sugerida: dto.hora_sugerida
            ? parseTime(dto.hora_sugerida)
            : undefined,
        },
        include: { meals: true },
      });

      return this.formatPlan(plan);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          this.duplicateMessage(
            dto.dia_semana ?? current.dia_semana,
            dto.tipo_comida ?? current.tipo_comida,
          ),
        );
      }

      throw error;
    }
  }

  // Eliminar un ítem del plan
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.meal_plans.delete({ where: { id } });

    return { message: 'Plan de comida eliminado exitosamente', id };
  }
}
