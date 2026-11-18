import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineDto } from './create-routine.dto.js';

export class UpdateRoutineDto extends PartialType(CreateRoutineDto) {}
