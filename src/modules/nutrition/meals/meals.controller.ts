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
import { CreateMealDto } from './dto/create-meal.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';
import { MealsService } from './meals.service.js';

// Controlador con ruta base /nutrition/meals
@Controller('nutrition/meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // POST /nutrition/meals -> Crear plato
  @Post()
  create(@Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(createMealDto);
  }

  // GET /nutrition/meals -> Listar todos los platos
  @Get()
  findAll() {
    return this.mealsService.findAll();
  }

  // GET /nutrition/meals/:id -> Buscar plato por UUID
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealsService.findOne(id);
  }

  // PATCH /nutrition/meals/:id -> Actualizar datos de un plato
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(id, updateMealDto);
  }

  // DELETE /nutrition/meals/:id -> Eliminar un plato
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealsService.remove(id);
  }
}

