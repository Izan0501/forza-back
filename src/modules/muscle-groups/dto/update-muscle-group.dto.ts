import { PartialType } from '@nestjs/mapped-types';
import { CreateMuscleGroupDto } from './create-muscle-group.dto.js';

export class UpdateMuscleGroupDto extends PartialType(CreateMuscleGroupDto) {}
