// Prueba rápida de Prisma Client contra la base de datos real.
// Cuenta los usuarios (debe dar 0 en una base recién creada) y confirma la conexión.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  const n = await prisma.usuario.count();
  console.log('✔ Prisma Client conectó correctamente. Usuarios en la base: ' + n);
  await prisma.$disconnect();
})().catch(async (err) => {
  console.error('✖ Error de Prisma Client:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
