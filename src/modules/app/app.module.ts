import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { FavoritoModule } from '../favorito/favorito.module.js';
import { UsersModule } from '../users/users.module.js';
import { ProgressModule } from '../progress/progress.module.js';
import { ExercisesModule } from '../exercises/exercises.module.js';
import { RoutinesModule } from '../routines/routines.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NutritionModule } from '../nutrition/nutrition.module.js';
import { MuscleGroupsModule } from '../muscle-groups/muscle-groups.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    AuthModule,
    FavoritoModule,
    UsersModule,
    ProgressModule,
    ExercisesModule,
    RoutinesModule,
    PrismaModule,
    NutritionModule,
    MuscleGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
