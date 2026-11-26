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
import { CreateMealPlanDto } from './dto/create-meal-plan.dto.js';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto.js';
import { MealPlansService } from './meal-plans.service.js';

// Controlador con ruta base /nutrition/plans
@Controller('nutrition/plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  // POST /nutrition/plans -> Asignar un plato al plan semanal
  @Post()
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  // GET /nutrition/plans?userId=UUID&dia=Lunes -> Listar planes con filtros opcionales
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('dia') dia?: string,
  ) {
    return this.mealPlansService.findAll(userId, dia);
  }

  // GET /nutrition/plans/:id -> Ver detalle de un ítem del plan
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealPlansService.findOne(id);
  }

  // PATCH /nutrition/plans/:id -> Modificar un ítem del plan
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto);
  }

  // DELETE /nutrition/plans/:id -> Eliminar un ítem del plan
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealPlansService.remove(id);
  }
}

