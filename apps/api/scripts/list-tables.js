// Lista las tablas creadas en el esquema "public" de la base de datos.
// Uso: node scripts/list-tables.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  const { rows } = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('Tablas en la base de datos (' + rows.length + '):');
  rows.forEach((r) => console.log('  - ' + r.table_name));
  await client.end();
})().catch(async (err) => {
  console.error('Error:', err.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
