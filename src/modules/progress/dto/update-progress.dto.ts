import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto.js';

// UpdateProgressDto hereda todos los campos de CreateProgressDto pero los hace opcionales.
// Esto permite modificar uno o varios campos sin tener que enviar todos nuevamente.
export class UpdateProgressDto extends PartialType(CreateProgressDto) {}
