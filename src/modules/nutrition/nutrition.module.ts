import { Module } from '@nestjs/common';
import { MealsController } from './meals/meals.controller.js';
import { MealsService } from './meals/meals.service.js';
import { NutritionGoalsController } from './nutrition-goals/nutrition-goals.controller.js';
import { NutritionGoalsService } from './nutrition-goals/nutrition-goals.service.js';
import { HydrationController } from './hydration/hydration.controller.js';
import { HydrationService } from './hydration/hydration.service.js';
import { MealPlansController } from './meal-plans/meal-plans.controller.js';
import { MealPlansService } from './meal-plans/meal-plans.service.js';
import { DailyLogsController } from './daily-logs/daily-logs.controller.js';
import { DailyLogsService } from './daily-logs/daily-logs.service.js';

// Módulo principal de Nutrición: registra los 5 controladores y 5 servicios
@Module({
  controllers: [
    MealsController,
    NutritionGoalsController,
    HydrationController,
    MealPlansController,
    DailyLogsController,
  ],
  providers: [
    MealsService,
    NutritionGoalsService,
    HydrationService,
    MealPlansService,
    DailyLogsService,
  ],
  exports: [
    MealsService,
    NutritionGoalsService,
    HydrationService,
    MealPlansService,
    DailyLogsService,
  ],
})
export class NutritionModule {}
