import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guardia de autenticación.
 * 1) Lee el token "Bearer" del encabezado Authorization.
 * 2) Lo valida contra Supabase.
 * 3) Busca al usuario en nuestra tabla `usuarios` y carga su rol.
 * 4) Si todo está bien, adjunta el usuario a la petición (req.user).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('Falta el token de autenticación.');
    }

    const supaUser = await this.supabase.getUserFromToken(token);
    if (!supaUser) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: supaUser.id },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException(
        'El usuario no está registrado o está inactivo en Optiflow.',
      );
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      area: usuario.area,
    };
    return true;
  }
}
