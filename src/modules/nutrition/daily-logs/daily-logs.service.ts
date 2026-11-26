import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  daily_nutrition_logs,
  meals,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-error.util.js';
import { MealsService } from '../meals/meals.service.js';
import { formatDate, formatMeal, parseDate } from '../nutrition.util.js';
import { CreateDailyLogDto } from './dto/create-daily-log.dto.js';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto.js';

// Un registro diario junto con los datos de su comida
type DailyLogWithMeal = daily_nutrition_logs & { meals: meals };

const DUPLICATE_MESSAGE =
  'Ya existe un registro para este usuario con la misma comida, fecha y tipo de comida';

@Injectable()
export class DailyLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mealsService: MealsService,
  ) {}

  // Devuelve el registro con la fecha como "YYYY-MM-DD" y los números de la comida
  private formatLog(log: DailyLogWithMeal) {
    return {
      ...log,
      fecha: formatDate(log.fecha),
      meals: formatMeal(log.meals),
    };
  }

  // Registrar una comida del día
  async create(dto: CreateDailyLogDto) {
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

    // 2. Crear el registro (la base no permite repetir usuario + fecha + tipo + comida)
    try {
      const log = await this.prisma.daily_nutrition_logs.create({
        data: {
          user_id: dto.user_id,
          meal_id: dto.meal_id,
          fecha: parseDate(dto.fecha),
          tipo_comida: dto.tipo_comida,
          consumida: dto.consumida,
        },
        include: { meals: true },
      });

      return this.formatLog(log);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(DUPLICATE_MESSAGE);
      }

      throw error;
    }
  }

  // Listar registros; userId y fecha son filtros opcionales
  async findAll(userId?: string, fecha?: string) {
    const logs = await this.prisma.daily_nutrition_logs.findMany({
      where: {
        user_id: userId,
        fecha: fecha ? parseDate(fecha) : undefined,
      },
      include: { meals: true },
      orderBy: { created_at: 'desc' },
    });

    return logs.map((log) => this.formatLog(log));
  }

  // Buscar un registro por su ID
  async findOne(id: string) {
    const log = await this.prisma.daily_nutrition_logs.findUnique({
      where: { id },
      include: { meals: true },
    });

    if (!log) {
      throw new NotFoundException(
        `Registro diario de nutrición con ID ${id} no encontrado`,
      );
    }

    return this.formatLog(log);
  }

  // Actualizar un registro (por ejemplo, marcar consumida: true)
  async update(id: string, dto: UpdateDailyLogDto) {
    await this.findOne(id);

    // Si se cambia la comida, tiene que existir
    if (dto.meal_id) {
      await this.mealsService.findOne(dto.meal_id);
    }

    try {
      const log = await this.prisma.daily_nutrition_logs.update({
        where: { id },
        data: {
          meal_id: dto.meal_id,
          tipo_comida: dto.tipo_comida,
          consumida: dto.consumida,
          fecha: dto.fecha ? parseDate(dto.fecha) : undefined,
        },
        include: { meals: true },
      });

      return this.formatLog(log);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(DUPLICATE_MESSAGE);
      }

      throw error;
    }
  }

  // Eliminar un registro
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.daily_nutrition_logs.delete({ where: { id } });

    return {
      message: 'Registro diario de nutrición eliminado exitosamente',
      id,
    };
  }
}
