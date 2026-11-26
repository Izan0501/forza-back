import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';

@Injectable()
export class MealsService {
  // Inyectamos PrismaService para comunicarnos con PostgreSQL
  constructor(private readonly prisma: PrismaService) {}

  // Helper para convertir los tipos Decimal de Prisma en números normales
  private formatMeal(meal: any) {
    return {
      ...meal,
      calorias: Number(meal.calorias),
      proteinas: Number(meal.proteinas),
      carbohidratos: Number(meal.carbohidratos),
      grasas: Number(meal.grasas),
    };
  }

  // Crear una nueva comida en el catálogo
  async create(createMealDto: CreateMealDto) {
    const meal = await this.prisma.meals.create({
      data: createMealDto,
    });
    return this.formatMeal(meal);
  }

  // Obtener todas las comidas registradas
  async findAll() {
    const meals = await this.prisma.meals.findMany({
      orderBy: { created_at: 'desc' },
    });
    return meals.map((meal) => this.formatMeal(meal));
  }

  // Buscar una comida por su ID (UUID)
  async findOne(id: string) {
    const meal = await this.prisma.meals.findUnique({
      where: { id },
    });
    if (!meal) {
      throw new NotFoundException(`Comida con ID ${id} no encontrada`);
    }
    return this.formatMeal(meal);
  }

  // Actualizar datos de una comida existente
  async update(id: string, updateMealDto: UpdateMealDto) {
    // Verificamos que la comida exista antes de actualizar
    await this.findOne(id);

    const updatedMeal = await this.prisma.meals.update({
      where: { id },
      data: updateMealDto,
    });
    return this.formatMeal(updatedMeal);
  }

  // Eliminar una comida del catálogo
  async remove(id: string) {
    // Verificamos que la comida exista
    await this.findOne(id);

    try {
      await this.prisma.meals.delete({
        where: { id },
      });
      return { message: 'Comida eliminada exitosamente', id };
    } catch (error: any) {
      // Si la comida está vinculada a un plan o registro, Prisma arroja error P2003
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'No se puede eliminar la comida porque está asignada a un plan semanal o registro diario',
        );
      }
      throw error;
    }
  }
}

