import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { apiGet } from '../../lib/api';

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  area: string | null;
}

export function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AuthUser>('/me')
      .then(setUser)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Optiflow</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            ¡Bienvenido!
          </h2>

          {error && (
            <p className="text-red-600">
              No se pudo cargar tu perfil: {error}
            </p>
          )}

          {!error && !user && <p className="text-slate-500">Cargando…</p>}

          {user && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Nombre" value={user.nombre} />
              <Field label="Email" value={user.email} />
              <Field label="Rol" value={user.rol} />
              <Field label="Área" value={user.area ?? '—'} />
            </dl>
          )}

          <p className="text-slate-400 text-sm mt-6">
            Esta es la base del sistema. Los módulos (productos, proveedores,
            producción…) se irán agregando en las próximas fases.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800 capitalize">{value}</dd>
    </div>
  );
}
