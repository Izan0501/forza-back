import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';

// El Controller recibe las peticiones HTTP y se las pasa al Service.
// No tiene lógica de negocio ni consultas a la base de datos.
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // POST /progress — Crea un nuevo registro de entrenamiento.
  @Post()
  create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.create(createProgressDto);
  }

  // GET /progress — Devuelve todos los registros de progreso.
  @Get()
  findAll() {
    return this.progressService.findAll();
  }

  // GET /progress/:id — Devuelve un registro por su UUID.
  // ParseUUIDPipe valida que el parámetro tenga formato de UUID antes de llamar al Service.
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.progressService.findOne(id);
  }

  // PATCH /progress/:id — Actualiza uno o varios campos de un registro existente.
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.update(id, updateProgressDto);
  }

  // DELETE /progress/:id — Elimina un registro por su UUID.
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.progressService.remove(id);
  }
}
