import 'dotenv/config'; // carga las variables del archivo .env
import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('Falta la variable JWT_SECRET en el archivo .env');
}

@Module({
  imports: [
    // Configura el JWT: con qué clave se firma y cuánto dura el token.
    JwtModule.register({
      secret,
      signOptions: {
        // Ejemplos de JWT_EXPIRES_IN: "1d", "2h", "30m"
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '1d') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
