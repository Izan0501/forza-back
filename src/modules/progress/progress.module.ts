import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service.js';
import { ProgressController } from './progress.controller.js';

// El Module registra el Controller y el Service del módulo de Progreso.
// PrismaService no se declara aquí porque PrismaModule es @Global() en AppModule.
@Module({
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
