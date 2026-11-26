import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMealPlanDto } from './create-meal-plan.dto.js';

// Todos los campos son opcionales y no se puede cambiar el usuario dueño del plan
export class UpdateMealPlanDto extends PartialType(
  OmitType(CreateMealPlanDto, ['user_id'] as const),
) {}
