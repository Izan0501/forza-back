import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaForeignKeyError } from '../../prisma/prisma-error.util.js';
import { formatMeal } from '../nutrition.util.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear una nueva comida en el catálogo
  async create(createMealDto: CreateMealDto) {
    const meal = await this.prisma.meals.create({ data: createMealDto });
    return formatMeal(meal);
  }

  // Obtener todas las comidas
  async findAll() {
    const meals = await this.prisma.meals.findMany({
      orderBy: { created_at: 'desc' },
    });
    return meals.map((meal) => formatMeal(meal));
  }

  // Buscar una comida por su ID
  async findOne(id: string) {
    const meal = await this.prisma.meals.findUnique({ where: { id } });

    if (!meal) {
      throw new NotFoundException(`Comida con ID ${id} no encontrada`);
    }

    return formatMeal(meal);
  }

  // Actualizar una comida existente
  async update(id: string, updateMealDto: UpdateMealDto) {
    await this.findOne(id);

    const meal = await this.prisma.meals.update({
      where: { id },
      data: updateMealDto,
    });
    return formatMeal(meal);
  }

  // Eliminar una comida del catálogo
  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.meals.delete({ where: { id } });
      return { message: 'Comida eliminada exitosamente', id };
    } catch (error) {
      // Si la comida está en un plan o en un registro diario, no se puede borrar
      if (isPrismaForeignKeyError(error)) {
        throw new ConflictException(
          'No se puede eliminar la comida porque está en un plan semanal o en un registro diario',
        );
      }

      throw error;
    }
  }
}
