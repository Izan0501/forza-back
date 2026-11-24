import { Module } from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service.js';
import { MuscleGroupsController } from './muscle-groups.controller.js';

@Module({
  controllers: [MuscleGroupsController],
  providers: [MuscleGroupsService],
})
export class MuscleGroupsModule {}
