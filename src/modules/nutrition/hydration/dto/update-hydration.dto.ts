import { PartialType } from '@nestjs/mapped-types';
import { CreateHydrationDto } from './create-hydration.dto.js';

// DTO para actualización parcial de hidratación
export class UpdateHydrationDto extends PartialType(CreateHydrationDto) {}

