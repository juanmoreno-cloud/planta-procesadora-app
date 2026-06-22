// Crea un usuario en Supabase Auth y su registro en la tabla `usuarios` con un rol.
// Uso:
//   node scripts/create-user.js "email" "contraseña" "Nombre Completo" rol
// rol = admin | produccion | calidad | logistica
//
// Ejemplo:
//   node scripts/create-user.js jefe@planta.com Clave123 "Ana Pérez" admin

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const [email, password, nombre, rol] = process.argv.slice(2);
const ROLES = ['admin', 'produccion', 'calidad', 'logistica'];

if (!email || !password || !nombre || !rol) {
  console.error('Faltan datos. Uso: node scripts/create-user.js "email" "contraseña" "Nombre" rol');
  process.exit(1);
}
if (!ROLES.includes(rol)) {
  console.error(`Rol inválido "${rol}". Debe ser uno de: ${ROLES.join(', ')}`);
  process.exit(1);
}

const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const prisma = new PrismaClient();

(async () => {
  // 1) Crear (o reutilizar) el usuario de Supabase Auth.
  let uid;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    if (error.code === 'email_exists' || /already/i.test(error.message)) {
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list.users.find((u) => u.email === email);
      if (!found) throw error;
      uid = found.id;
      console.log('ℹ El usuario ya existía en Supabase Auth, se reutiliza.');
    } else {
      throw error;
    }
  } else {
    uid = created.user.id;
  }

  // 2) Crear o actualizar el registro en nuestra tabla `usuarios`.
  await prisma.usuario.upsert({
    where: { id: uid },
    update: { nombre, rol, email, activo: true },
    create: { id: uid, nombre, email, rol },
  });

  console.log(`✔ Usuario listo: ${email} (rol: ${rol})`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('✖ ERROR:', e.message);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
