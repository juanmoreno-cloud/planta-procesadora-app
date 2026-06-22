// Verificación de extremo a extremo del control de roles (RBAC).
// Crea un usuario de prueba, inicia sesión, prueba rutas protegidas y limpia al final.
// Requisito: el servidor debe estar corriendo en http://localhost:3000.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const API = 'http://localhost:3000/api';
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

const email = 'test-rbac@example.com';
const password = 'Test1234!';

async function main() {
  // 1) Crear usuario en Supabase Auth (ya confirmado).
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (cErr) throw cErr;
  const uid = created.user.id;

  // 2) Insertar en nuestra tabla `usuarios` con rol 'produccion'.
  await prisma.usuario.create({
    data: { id: uid, nombre: 'Usuario Prueba', email, rol: 'produccion' },
  });

  // 3) Iniciar sesión como ese usuario (con la clave pública/anon).
  const pub = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: signin, error: sErr } = await pub.auth.signInWithPassword({
    email,
    password,
  });
  if (sErr) throw sErr;
  const token = signin.session.access_token;

  // 4) Probar las rutas.
  const me = await fetch(API + '/me', {
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('GET /me (con token)           ->', me.status, await me.json());

  const a1 = await fetch(API + '/admin/ping', {
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('GET /admin/ping (rol produccion) ->', a1.status, '(se espera 403)');

  // 5) Cambiar el rol a admin y reintentar.
  await prisma.usuario.update({ where: { id: uid }, data: { rol: 'admin' } });
  const a2 = await fetch(API + '/admin/ping', {
    headers: { Authorization: 'Bearer ' + token },
  });
  console.log('GET /admin/ping (rol admin)      ->', a2.status, await a2.json(), '(se espera 200)');

  // 6) Limpiar: borrar usuario de prueba.
  await prisma.usuario.delete({ where: { id: uid } });
  await admin.auth.admin.deleteUser(uid);
  await prisma.$disconnect();
  console.log('\n✔ Verificación completa. Usuario de prueba eliminado.');
}

main().catch(async (e) => {
  console.error('✖ ERROR:', e.message);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
