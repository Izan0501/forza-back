import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Datos que guardamos dentro del token al hacer register o login.
export interface JwtPayload {
  sub: string; // id del usuario
  email: string;
}

// Solo lo que necesitamos de la request en este archivo.
interface RequestWithUser {
  headers: { authorization?: string };
  user?: JwtPayload;
}

// Un Guard se ejecuta antes del controller y decide si la request puede pasar.
// El cliente tiene que enviar el header:  Authorization: Bearer <token>
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // 1. Leer el token del header "Authorization: Bearer <token>".
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso.');
    }

    // 2. Verificar que la firma sea correcta y que el token no haya vencido.
    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }

    // 3. Todo bien: la request sigue hacia el controller.
    return true;
  }
}
