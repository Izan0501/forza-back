import { Injectable, NotFoundException } from '@nestjs/common';
import type { hydration_logs } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { formatDate, parseDate } from '../nutrition.util.js';
import { CreateHydrationDto } from './dto/create-hydration.dto.js';

@Injectable()
export class HydrationService {
  constructor(private readonly prisma: PrismaService) {}

  // Devuelve el registro con la fecha como "YYYY-MM-DD"
  private formatLog(log: hydration_logs) {
    return { ...log, fecha: formatDate(log.fecha) };
  }

  // Registrar el agua del día, o actualizarla si ya existe (upsert)
  async upsert(dto: CreateHydrationDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${dto.user_id} no encontrado`,
      );
    }

    const fecha = parseDate(dto.fecha);

    // user_id_fecha es la clave única compuesta que arma Prisma
    const log = await this.prisma.hydration_logs.upsert({
      where: { user_id_fecha: { user_id: dto.user_id, fecha } },
      create: {
        user_id: dto.user_id,
        fecha,
        cantidad_ml: dto.cantidad_ml,
      },
      update: {
        cantidad_ml: dto.cantidad_ml,
        updated_at: new Date(),
      },
    });

    return this.formatLog(log);
  }

  // Consultar la hidratación de un usuario: de un día (si viene fecha) o todo el historial
  async findByQuery(userId: string, fecha?: string) {
    if (fecha) {
      const log = await this.prisma.hydration_logs.findUnique({
        where: { user_id_fecha: { user_id: userId, fecha: parseDate(fecha) } },
      });

      if (!log) {
        throw new NotFoundException(
          `No se encontró registro de hidratación para el usuario ${userId} en la fecha ${fecha}`,
        );
      }

      return this.formatLog(log);
    }

    const logs = await this.prisma.hydration_logs.findMany({
      where: { user_id: userId },
      orderBy: { fecha: 'desc' },
    });

    return logs.map((log) => this.formatLog(log));
  }

  // Eliminar un registro por su ID
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
