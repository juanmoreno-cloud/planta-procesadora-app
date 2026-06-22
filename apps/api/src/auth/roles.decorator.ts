import { SetMetadata } from '@nestjs/common';
import { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Marca qué roles pueden acceder a una ruta.
 * Ej: @Roles('admin', 'logistica')
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
