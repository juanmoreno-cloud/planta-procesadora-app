import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { CurrentUser, AuthUser } from './auth/current-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  /** Ruta pública: confirma que la API y la base de datos responden. */
  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /** Ruta protegida: requiere token válido. Devuelve el usuario autenticado. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  /** Ruta protegida por rol: solo 'admin'. Sirve para probar el RBAC. */
  @Get('admin/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminPing() {
    return { message: 'Acceso de admin concedido.' };
  }
}
