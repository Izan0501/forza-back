import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FavoritoService } from './favorito.service.js';
import { FavoritoController } from './favorito.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [FavoritoController],
  providers: [FavoritoService],
})
export class FavoritoModule {}
