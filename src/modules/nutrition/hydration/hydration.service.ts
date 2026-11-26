import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateHydrationDto } from './dto/create-hydration.dto.js';

@Injectable()
export class HydrationService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para formatear la fecha como "YYYY-MM-DD" y número limpio
  private formatLog(log: any) {
    return {
      ...log,
      fecha:
        log.fecha instanceof Date
          ? log.fecha.toISOString().split('T')[0]
          : log.fecha,
      cantidad_ml: Number(log.cantidad_ml),
    };
  }

  // Convierte un string "YYYY-MM-DD" a un Date en formato UTC usando la 'Z'
  private parseDate(fechaStr?: string): Date {
    const fecha = fechaStr ?? new Date().toISOString().split('T')[0];
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  // Registrar o actualizar hidratación del día con upsert (clave compuesta user_id_fecha)
  async upsert(dto: CreateHydrationDto) {
    // Verificamos que el usuario exista en la tabla users
    const user = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.user_id} no encontrado`);
    }

    const targetDate = this.parseDate(dto.fecha);

    // Prisma nombra la clave compuesta como user_id_fecha
    const log = await this.prisma.hydration_logs.upsert({
      where: {
        user_id_fecha: {
          user_id: dto.user_id,
          fecha: targetDate,
        },
      },
      create: {
        user_id: dto.user_id,
        fecha: targetDate,
        cantidad_ml: dto.cantidad_ml,
      },
      update: {
        cantidad_ml: dto.cantidad_ml,
        updated_at: new Date(),
      },
    });

    return this.formatLog(log);
  }

  // Consultar hidratación: userId obligatorio y fecha opcional
  async findByQuery(userId: string, fecha?: string) {
    if (fecha) {
      const targetDate = this.parseDate(fecha);
      const log = await this.prisma.hydration_logs.findUnique({
        where: {
          user_id_fecha: {
            user_id: userId,
            fecha: targetDate,
          },
        },
      });

      if (!log) {
        throw new NotFoundException(
          `No se encontró registro de hidratación para el usuario ${userId} en la fecha ${fecha}`,
        );
      }
      return this.formatLog(log);
    }

    // Si no se envía fecha, devolvemos todo el historial del usuario ordenado por fecha
    const logs = await this.prisma.hydration_logs.findMany({
      where: { user_id: userId },
      orderBy: { fecha: 'desc' },
    });
    return logs.map((log) => this.formatLog(log));
  }

  // Eliminar un registro de hidratación por su ID
  async remove(id: string) {
    const log = await this.prisma.hydration_logs.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException(
        `Registro de hidratación con ID ${id} no encontrado`,
      );
    }

    await this.prisma.hydration_logs.delete({ where: { id } });
    return { message: 'Registro de hidratación eliminado exitosamente', id };
  }
}

