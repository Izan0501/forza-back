import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto.js';
import { NutritionGoalsService } from './nutrition-goals.service.js';

// Controlador con ruta base /nutrition/goals (requiere token)
@UseGuards(JwtAuthGuard)
@Controller('nutrition/goals')
export class NutritionGoalsController {
  constructor(private readonly nutritionGoalsService: NutritionGoalsService) {}

  // GET /nutrition/goals/:userId -> Obtener metas del usuario
  @Get(':userId')
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.nutritionGoalsService.findByUserId(userId);
  }

  // PUT /nutrition/goals/:userId -> Crear o actualizar metas (upsert)
  @Put(':userId')
  upsert(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateNutritionGoalDto,
  ) {
    return this.nutritionGoalsService.upsert(userId, dto);
  }

  // DELETE /nutrition/goals/:userId -> Eliminar metas del usuario
  @Delete(':userId')
  remove(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.nutritionGoalsService.remove(userId);
  }
}

