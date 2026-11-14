import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoritoDto } from './create-favorito.dto.js';

export class UpdateFavoritoDto extends PartialType(CreateFavoritoDto) {}
