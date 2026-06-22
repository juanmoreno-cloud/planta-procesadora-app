// Aplica un archivo .sql contra la base de datos usando la conexión de DATABASE_URL.
// Uso: node scripts/apply-sql.js prisma/init.sql
// Se usa para crear el esquema en Supabase a través del pooler (puerto 6543),
// evitando el cuelgue de "prisma db push" sobre el pooler de transacción.

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

const file = process.argv[2] || 'prisma/init.sql';
// Quita un posible BOM (carácter invisible) al inicio, que Postgres rechaza.
const sql = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/^﻿/, '');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  await client.query(sql);
  console.log('✔ SQL aplicado correctamente desde ' + file);
  await client.end();
})().catch(async (err) => {
  console.error('✖ Error al aplicar el SQL:', err.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
