import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guardia de roles. Debe usarse DESPUÉS de JwtAuthGuard (que ya cargó req.user).
 * Si la ruta no exige roles, deja pasar. Si los exige, comprueba que el rol
 * del usuario esté permitido.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !required.includes(user.rol)) {
      throw new ForbiddenException('No tienes permiso para esta acción.');
    }
    return true;
  }
}
