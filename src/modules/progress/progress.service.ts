import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';

// El Service contiene toda la lógica del CRUD.
// Se conecta a PostgreSQL a través de PrismaService.
@Injectable()
export class ProgressService {
  // Inyectamos PrismaService en el constructor para poder usarlo en todos los métodos.
  constructor(private readonly prisma: PrismaService) {}

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────────

  // Convierte una fecha en formato "YYYY-MM-DD" a un objeto Date sin desplazamiento de zona horaria.
  // Si se usa "new Date('2026-11-23')" directamente, JavaScript puede interpretar la fecha en UTC
  // y el día se puede desplazar una hora según la zona horaria del servidor.
  private parseFecha(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  async create(dto: CreateProgressDto) {
    // 1. Verificamos que el usuario exista en la base de datos.
    const usuarioExiste = await this.prisma.users.findUnique({
      where: { id: dto.user_id },
    });

    if (!usuarioExiste) {
      throw new NotFoundException(
        `No se encontró un usuario con el id: ${dto.user_id}`,
      );
    }

    // 2. Si se envía routine_id, verificamos que esa rutina exista y que pertenezca al usuario.
    if (dto.routine_id) {
      const rutinaExiste = await this.prisma.routines.findUnique({
        where: { id: dto.routine_id },
      });

      if (!rutinaExiste) {
        throw new NotFoundException(
          `No se encontró una rutina con el id: ${dto.routine_id}`,
        );
      }

      if (rutinaExiste.user_id !== dto.user_id) {
        throw new NotFoundException(
          `La rutina con id ${dto.routine_id} no pertenece al usuario indicado.`,
        );
      }
    }

    // 3. Creamos el registro de progreso en la base de datos.
    return this.prisma.progress_logs.create({
      data: {
        user_id: dto.user_id,
        routine_id: dto.routine_id ?? null,
        // Si se envía fecha la convertimos; si no, Prisma usa el default de la BD (CURRENT_DATE).
        ...(dto.fecha && { fecha: this.parseFecha(dto.fecha) }),
        ...(dto.completada !== undefined && { completada: dto.completada }),
        notas: dto.notas ?? null,
      },
    });
  }

  // ─── FIND ALL ────────────────────────────────────────────────────────────────

  async findAll() {
    // Devuelve todos los registros de progreso ordenados del más reciente al más antiguo.
    return this.prisma.progress_logs.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── FIND ONE ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    // Buscamos el registro por su UUID.
    const registro = await this.prisma.progress_logs.findUnique({
      where: { id },
    });

    // Si no existe lanzamos NotFoundException (NestJS devuelve un 404 automáticamente).
    if (!registro) {
      throw new NotFoundException(
        `No se encontró un registro de progreso con el id: ${id}`,
      );
    }

    return registro;
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateProgressDto) {
    // 1. Verificamos que el registro a actualizar exista.
    const registroExistente = await this.prisma.progress_logs.findUnique({
      where: { id },
    });

    if (!registroExistente) {
      throw new NotFoundException(
        `No se encontró un registro de progreso con el id: ${id}`,
      );
    }

    // 2. Determinamos el user_id final (el nuevo o el que ya tenía el registro).
    const userIdFinal = dto.user_id ?? registroExistente.user_id;

    // 3. Si se cambia el user_id, verificamos que el nuevo usuario exista.
    if (dto.user_id && dto.user_id !== registroExistente.user_id) {
      const usuarioExiste = await this.prisma.users.findUnique({
        where: { id: dto.user_id },
      });

      if (!usuarioExiste) {
        throw new NotFoundException(
          `No se encontró un usuario con el id: ${dto.user_id}`,
        );
      }
    }

    // 4. Si se cambia la rutina, verificamos que exista y pertenezca al usuario.
    if (dto.routine_id !== undefined && dto.routine_id !== null) {
      const rutinaExiste = await this.prisma.routines.findUnique({
        where: { id: dto.routine_id },
      });

      if (!rutinaExiste) {
        throw new NotFoundException(
          `No se encontró una rutina con el id: ${dto.routine_id}`,
        );
      }

      if (rutinaExiste.user_id !== userIdFinal) {
        throw new NotFoundException(
          `La rutina con id ${dto.routine_id} no pertenece al usuario indicado.`,
        );
      }
    }

    // 5. Actualizamos el registro conservando los campos que no se modifican.
    return this.prisma.progress_logs.update({
      where: { id },
      data: {
        ...(dto.user_id && { user_id: dto.user_id }),
        // "undefined" significa "no tocado"; "null" borra la relación.
        ...(dto.routine_id !== undefined && { routine_id: dto.routine_id }),
        ...(dto.fecha && { fecha: this.parseFecha(dto.fecha) }),
        ...(dto.completada !== undefined && { completada: dto.completada }),
        ...(dto.notas !== undefined && { notas: dto.notas }),
      },
    });
  }

  // ─── REMOVE ──────────────────────────────────────────────────────────────────

  async remove(id: string) {
    // 1. Verificamos que el registro exista antes de intentar eliminarlo.
    const registroExistente = await this.prisma.progress_logs.findUnique({
      where: { id },
    });

    if (!registroExistente) {
      throw new NotFoundException(
        `No se encontró un registro de progreso con el id: ${id}`,
      );
    }

    // 2. Eliminamos el registro.
    return this.prisma.progress_logs.delete({
      where: { id },
    });
  }
}
