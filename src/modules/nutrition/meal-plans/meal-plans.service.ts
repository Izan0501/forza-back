import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto.js';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto.js';

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  // Convierte Date de base de datos a formato "HH:mm"
  private formatTime(date: Date): string {
    if (!date) return '';
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Convierte string "HH:mm" a Date UTC (fijando fecha base 1970-01-01)
  private parseTime(timeStr: string): Date {
    return new Date(`1970-01-01T${timeStr}:00.000Z`);
  }

  // Helper para devolver el plan formateado con su comida asociada
  private formatMealPlan(plan: any) {
    const formatted: any = {
      ...plan,
      hora_sugerida:
        plan.hora_sugerida instanceof Date
          ? this.formatTime(plan.hora_sugerida)
          : plan.hora_sugerida,
    };

    // Si viene la relación con meals por el include, formateamos sus Decimal
    if (plan.meals) {
      formatted.meal = {
        ...plan.meals,
        calorias: Number(plan.meals.calorias),
        proteinas: Number(plan.meals.proteinas),
        carbohidratos: Number(plan.meals.carbohidratos),
        grasas: Number(plan.meals.grasas),
      };
      formatted.meals = formatted.meal;
    }

    return formatted;
  }

  // Crear un ítem en el plan semanal
  async create(dto: CreateMealPlanDto) {
    // 1. Validar que el usuario exista
    const user = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.user_id} no encontrado`);
    }

    // 2. Validar que la comida exista en el catálogo
    const meal = await this.prisma.meals.findUnique({
      where: { id: dto.meal_id },
    });
    if (!meal) {
      throw new NotFoundException(`Comida con ID ${dto.meal_id} no encontrada`);
    }

    // 3. Crear el plan guardando la hora en formato Time(6)
    try {
      const plan = await this.prisma.meal_plans.create({
        data: {
          user_id: dto.user_id,
          meal_id: dto.meal_id,
          dia_semana: dto.dia_semana,
          tipo_comida: dto.tipo_comida,
          hora_sugerida: this.parseTime(dto.hora_sugerida),
        },
        include: {
          meals: true, // Trae los datos de la comida relacionada
        },
      });

      return this.formatMealPlan(plan);
    } catch (error: any) {
      // Clave única compuesta: @@unique([user_id, dia_semana, tipo_comida])
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          `Ya existe una comida asignada para ${dto.dia_semana} en ${dto.tipo_comida}`,
        );
      }
      throw error;
    }
  }

  // Listar planes con filtros opcionales (userId y día)
  async findAll(userId?: string, dia?: string) {
    const where: any = {};
    if (userId) where.user_id = userId;
    if (dia) where.dia_semana = dia;

    const plans = await this.prisma.meal_plans.findMany({
      where,
      include: {
        meals: true, // Relación con la tabla meals
      },
      orderBy: [{ dia_semana: 'asc' }, { hora_sugerida: 'asc' }],
    });

    return plans.map((plan) => this.formatMealPlan(plan));
  }

  // Obtener un plan por su ID
  async findOne(id: string) {
    const plan = await this.prisma.meal_plans.findUnique({
      where: { id },
      include: {
        meals: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de comida con ID ${id} no encontrado`);
    }

    return this.formatMealPlan(plan);
  }

  // Actualizar un plan existente
  async update(id: string, dto: UpdateMealPlanDto) {
    await this.findOne(id); // Valida que exista el plan

    // Si envían una nueva comida, validamos que exista
    if (dto.meal_id) {
      const meal = await this.prisma.meals.findUnique({
        where: { id: dto.meal_id },
      });
      if (!meal) {
        throw new NotFoundException(`Comida con ID ${dto.meal_id} no encontrada`);
      }
    }

    const data: any = { ...dto };
    if (dto.hora_sugerida) {
      data.hora_sugerida = this.parseTime(dto.hora_sugerida);
    }

    const updated = await this.prisma.meal_plans.update({
      where: { id },
      data,
      include: {
        meals: true,
      },
    });

    return this.formatMealPlan(updated);
  }

  // Eliminar un plan por su ID
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.meal_plans.delete({
      where: { id },
    });

    return { message: 'Plan de comida eliminado exitosamente', id };
  }
}

