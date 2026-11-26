import { PartialType } from '@nestjs/mapped-types';
import { CreateMealPlanDto } from './create-meal-plan.dto.js';

// DTO para actualización parcial de un ítem del plan semanal
export class UpdateMealPlanDto extends PartialType(CreateMealPlanDto) {}

