// Diagnóstico: inicia sesión con un email/contraseña y consulta /api/me.
// Uso: node scripts/login-check.js "email" "contraseña"
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const [email, password] = process.argv.slice(2);
const API = 'http://localhost:3000/api';

(async () => {
  const pub = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await pub.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Login falló: ' + error.message);
  const token = data.session.access_token;

  const me = await fetch(API + '/me', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Login OK. GET /api/me ->', me.status, await me.json());
})().catch((e) => {
  console.error('✖', e.message);
  process.exit(1);
});
