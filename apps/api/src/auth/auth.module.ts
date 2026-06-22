import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Agrupa la autenticación: cliente de Supabase y los guardias de token y roles.
 * Se exportan para poder usarlos en cualquier controlador con @UseGuards(...).
 */
@Module({
  providers: [SupabaseService, JwtAuthGuard, RolesGuard],
  exports: [SupabaseService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
