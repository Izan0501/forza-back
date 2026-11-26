import { PartialType } from '@nestjs/mapped-types';
import { CreateNutritionGoalDto } from './create-nutrition-goal.dto.js';

// DTO para actualizar metas de forma parcial
export class UpdateNutritionGoalDto extends PartialType(CreateNutritionGoalDto) {}

