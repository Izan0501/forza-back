import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDailyLogDto } from './create-daily-log.dto.js';

// Todos los campos son opcionales y no se puede cambiar el usuario dueño del registro
export class UpdateDailyLogDto extends PartialType(
  OmitType(CreateDailyLogDto, ['user_id'] as const),
) {}
