import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Cliente de Supabase para el backend (con la clave de servicio).
 * Se usa para validar tokens de los usuarios y para operaciones de administración.
 */
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const serviceKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
      throw new Error(
        'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env del backend.',
      );
    }
    this.client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  /** Devuelve el usuario de Supabase si el token es válido, o null si no lo es. */
  async getUserFromToken(token: string): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  }
}
