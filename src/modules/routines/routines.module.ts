import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service.js';
import { RoutinesController } from './routines.controller.js';

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
