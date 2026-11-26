import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyLogDto } from './create-daily-log.dto.js';

// DTO para actualización parcial (por ejemplo cambiar consumida a true)
export class UpdateDailyLogDto extends PartialType(CreateDailyLogDto) {}

