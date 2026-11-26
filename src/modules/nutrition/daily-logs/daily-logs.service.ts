import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDailyLogDto } from './dto/create-daily-log.dto.js';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto.js';

@Injectable()
export class DailyLogsService {
  constructor(private readonly prisma: PrismaService) {}

  // Convierte string "YYYY-MM-DD" a Date UTC con 'Z'
  private parseDate(fechaStr?: string): Date {
    const fecha = fechaStr ?? new Date().toISOString().split('T')[0];
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  // Formatea la fecha y convierte los Decimal de meals a Number
  private formatLog(log: any) {
    const formatted: any = {
      ...log,
      fecha:
        log.fecha instanceof Date
          ? log.fecha.toISOString().split('T')[0]
          : log.fecha,
    };

    if (log.meals) {
      formatted.meal = {
        ...log.meals,
        calorias: Number(log.meals.calorias),
        proteinas: Number(log.meals.proteinas),
        carbohidratos: Number(log.meals.carbohidratos),
        grasas: Number(log.meals.grasas),
      };
      formatted.meals = formatted.meal;
    }

    return formatted;
  }

  // Crear un registro de comida diaria
  async create(dto: CreateDailyLogDto) {
    // 1. Validar que el usuario exista
    const user = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.user_id} no encontrado`);
    }

    // 2. Validar que la comida exista
    const meal = await this.prisma.meals.findUnique({
      where: { id: dto.meal_id },
    });
    if (!meal) {
      throw new NotFoundException(`Comida con ID ${dto.meal_id} no encontrada`);
    }

    const targetDate = this.parseDate(dto.fecha);

    try {
      const log = await this.prisma.daily_nutrition_logs.create({
        data: {
          user_id: dto.user_id,
          meal_id: dto.meal_id,
          fecha: targetDate,
          tipo_comida: dto.tipo_comida,
          consumida: dto.consumida ?? false,
        },
        include: {
          meals: true,
        },
      });

      return this.formatLog(log);
    } catch (error: any) {
      // Clave única compuesta: @@unique([user_id, fecha, tipo_comida, meal_id])
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un registro para este usuario con la misma comida, fecha y tipo de comida',
        );
      }
      throw error;
    }
  }

  // Listar registros con filtros opcionales (userId y fecha)
  async findAll(userId?: string, fecha?: string) {
    const where: any = {};
    if (userId) where.user_id = userId;
    if (fecha) where.fecha = this.parseDate(fecha);

    const logs = await this.prisma.daily_nutrition_logs.findMany({
      where,
      include: {
        meals: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return logs.map((log) => this.formatLog(log));
  }

  // Obtener un registro por ID
  async findOne(id: string) {
    const log = await this.prisma.daily_nutrition_logs.findUnique({
      where: { id },
      include: {
        meals: true,
      },
    });

    if (!log) {
      throw new NotFoundException(
        `Registro diario de nutrición con ID ${id} no encontrado`,
      );
    }

    return this.formatLog(log);
  }

  // Actualizar un registro (por ejemplo cambiar consumida a true)
  async update(id: string, dto: UpdateDailyLogDto) {
    await this.findOne(id);

    // Si viene meal_id nuevo, validamos que exista
    if (dto.meal_id) {
      const meal = await this.prisma.meals.findUnique({
        where: { id: dto.meal_id },
      });
      if (!meal) {
        throw new NotFoundException(`Comida con ID ${dto.meal_id} no encontrada`);
      }
    }

    const data: any = { ...dto };
    if (dto.fecha) {
      data.fecha = this.parseDate(dto.fecha);
    }

    const updated = await this.prisma.daily_nutrition_logs.update({
      where: { id },
      data,
      include: {
        meals: true,
      },
    });

    return this.formatLog(updated);
  }

  // Eliminar un registro
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.daily_nutrition_logs.delete({
      where: { id },
    });

    return { message: 'Registro diario de nutrición eliminado exitosamente', id };
  }
}

