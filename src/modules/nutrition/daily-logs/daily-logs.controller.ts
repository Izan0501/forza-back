import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDailyLogDto } from './dto/create-daily-log.dto.js';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto.js';
import { DailyLogsService } from './daily-logs.service.js';

// Controlador con ruta base /nutrition/logs
@Controller('nutrition/logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  // POST /nutrition/logs -> Registrar comida diaria
  @Post()
  create(@Body() createDailyLogDto: CreateDailyLogDto) {
    return this.dailyLogsService.create(createDailyLogDto);
  }

  // GET /nutrition/logs?userId=UUID&fecha=YYYY-MM-DD -> Listar con filtros opcionales
  @Get()
  findAll(
    @Query('userId', new ParseUUIDPipe({ optional: true })) userId?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.dailyLogsService.findAll(userId, fecha);
  }

  // GET /nutrition/logs/:id -> Ver detalle de un registro
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyLogsService.findOne(id);
  }

  // PATCH /nutrition/logs/:id -> Modificar registro (ej: consumida: true)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDailyLogDto: UpdateDailyLogDto,
  ) {
    return this.dailyLogsService.update(id, updateDailyLogDto);
  }

  // DELETE /nutrition/logs/:id -> Eliminar un registro
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyLogsService.remove(id);
  }
}

