import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  area: string | null;
}

/**
 * Decorador para obtener el usuario autenticado dentro de un controlador.
 * Ej: miMetodo(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
