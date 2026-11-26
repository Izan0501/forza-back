import { PartialType } from '@nestjs/mapped-types';
import { CreateMealDto } from './create-meal.dto.js';

// DTO para actualizar: hace que todos los campos de CreateMealDto sean opcionales
export class UpdateMealDto extends PartialType(CreateMealDto) {}

