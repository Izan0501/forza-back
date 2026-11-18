import { PartialType } from '@nestjs/mapped-types';
import { CreateNutritionDto } from './create-nutrition.dto.js';

export class UpdateNutritionDto extends PartialType(CreateNutritionDto) {}
