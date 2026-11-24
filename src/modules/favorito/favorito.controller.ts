import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { FavoritoService } from './favorito.service.js';
import { CreateFavoritoDto } from './dto/create-favorito.dto.js';
import { UpdateFavoritoDto } from './dto/update-favorito.dto.js';

@Controller('favorito')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) {}

  @Post()
  create(@Body() createFavoritoDto: CreateFavoritoDto) {
    return this.favoritoService.create(createFavoritoDto);
  }

  @Get()
  findAll() {
    return this.favoritoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.favoritoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFavoritoDto: UpdateFavoritoDto,
  ) {
    return this.favoritoService.update(id, updateFavoritoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.favoritoService.remove(id);
  }
}
