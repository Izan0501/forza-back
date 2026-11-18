import { Module } from '@nestjs/common';
import { FavoritoService } from './favorito.service.js';
import { FavoritoController } from './favorito.controller.js';

@Module({
  controllers: [FavoritoController],
  providers: [FavoritoService],
})
export class FavoritoModule {}
