import { BadRequestException } from '@nestjs/common';
import type { meals } from '../../generated/prisma/client.js';

// Convierte un texto "YYYY-MM-DD" en Date.
// Si no se envía fecha, usa el día de hoy.
export function parseDate(fecha?: string): Date {
  // 'en-CA' devuelve la fecha local con formato YYYY-MM-DD
  const hoy = new Date().toLocaleDateString('en-CA');
  const texto = (fecha ?? hoy).slice(0, 10);
  const date = new Date(`${texto}T00:00:00.000Z`);

  // Rechazamos fechas que no existen (ej: "basura" o "2026-02-30")
  if (isNaN(date.getTime()) || formatDate(date) !== texto) {
    throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD.');
  }

  return date;
}

// Convierte un Date en texto "YYYY-MM-DD".
export function formatDate(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

// Prisma devuelve los Decimal como texto ("42.50"); los pasamos a número.
export function formatMeal(meal: meals) {
  return {
    ...meal,
    proteinas: Number(meal.proteinas),
    carbohidratos: Number(meal.carbohidratos),
    grasas: Number(meal.grasas),
  };
}
