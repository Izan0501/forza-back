import { Prisma } from '../../generated/prisma/client.js';

// P2002 es el código de Prisma para "ya existe un registro con ese valor único" (ej: email repetido).
export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

// P2003 es el código de Prisma para "este registro está siendo usado por otra tabla" (clave foránea).
export function isPrismaForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}
