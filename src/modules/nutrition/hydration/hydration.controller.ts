import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { CreateHydrationDto } from './dto/create-hydration.dto.js';
import { HydrationService } from './hydration.service.js';

// Controlador con ruta base /nutrition/hydration
@Controller('nutrition/hydration')
export class HydrationController {
  constructor(private readonly hydrationService: HydrationService) {}

  // PUT /nutrition/hydration -> Registrar o actualizar consumo de agua con upsert
  @Put()
  upsert(@Body() dto: CreateHydrationDto) {
    return this.hydrationService.upsert(dto);
  }

  // GET /nutrition/hydration?userId=UUID&fecha=YYYY-MM-DD -> Consultar hidratación
  @Get()
  findByQuery(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.hydrationService.findByQuery(userId, fecha);
  }

  // DELETE /nutrition/hydration/:id -> Eliminar registro por ID
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hydrationService.remove(id);
  }
}

