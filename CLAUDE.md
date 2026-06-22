# CLAUDE.md — Memoria del proyecto Optiflow

> **Lee este archivo primero.** Es la fuente de verdad del proyecto. Cualquier
> colaborador (humano o Claude Code) debe leerlo antes de trabajar para entender
> el estado actual sin tener que releer todo el código. Manténlo actualizado al
> final de cada sesión.

---

## 1. Descripción y objetivo de negocio

Optiflow es una aplicación web para una **planta procesadora de alimentos**
(charcutería/embutidos). Reemplaza el registro manual en Excel por una base de datos
centralizada con captura por área y permisos por rol.

**Problema que resuelve:** hoy la operación (producción diaria, proveedores, clientes,
productos, materias primas) se registra en Excel disperso; los reportes en Power BI
dependen de que terceros envíen archivos. Optiflow centraliza la captura, genera
dashboards integrados y permite conectar Power BI directo a la base de datos.

**Áreas/roles:** `admin`, `produccion`, `calidad`, `logistica`.

**Requisitos críticos por ser alimentos:** control de **vencimiento y stock** de materias
primas, y **trazabilidad bidireccional para recall** (de un insumo defectuoso hacia los
clientes afectados, y de un producto vendido hacia sus insumos/proveedor).

---

## 2. Stack tecnológico y decisiones de arquitectura

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Frontend | React + Vite + TypeScript | Estándar, rápido, fácil de colaborar |
| UI | Tailwind CSS + shadcn/ui | Componentes listos, bajo mantenimiento |
| Datos (front) | TanStack Query | Llamadas a API y caché sin código repetitivo |
| Gráficos | Recharts | Dashboards simples |
| Backend | NestJS + TypeScript | Estructura clara, guards de roles |
| ORM/DB | Prisma + PostgreSQL (Supabase) | Esquema tipado, migraciones versionadas |
| Validación | Zod (compartida en `packages/shared`) | Una sola fuente de verdad front/back |
| Auth | Supabase Auth (JWT) | Login listo; backend verifica token y aplica roles |

**Decisiones clave:**
- **Frontend y backend separados** (no Next.js monolito) — decisión del dueño.
- **Auth:** el frontend hace login con `supabase-js` → recibe JWT → lo envía al backend
  en `Authorization: Bearer`. Un guard de NestJS verifica el token, lee el `user_id`,
  busca el rol en la tabla `usuarios` y autoriza. La autorización vive en el backend
  (no en RLS), para tener las reglas en un solo lugar.
- **Backend accede a Postgres con la clave de servicio de Supabase.**
- **Trazabilidad con backflush:** para productos de receta fija, los insumos se descuentan
  automáticamente desde `recetas`/`receta_items` sin digitarlos por lote.

---

## 3. Estructura de carpetas y convenciones

```
optiflow/
├─ apps/
│  ├─ web/        # React + Vite (frontend)
│  │  └─ src/{features, components, lib, routes}
│  └─ api/        # NestJS (backend)
│     ├─ src/{modules, auth, prisma}
│     └─ prisma/schema.prisma
├─ packages/
│  └─ shared/     # tipos + esquemas Zod compartidos
├─ CLAUDE.md      # este archivo
├─ README.md      # onboarding
└─ package.json   # npm workspaces
```

**Convenciones:** TypeScript estricto; nombres de archivos/carpetas en inglés, textos de
UI en español; un módulo NestJS por entidad; esquemas Zod en `packages/shared` reutilizados
por web y api.

---

## 4. Modelo de datos (esquema actual)

> Borrador aprobado. Los campos exactos de cada formulario se confirman con el dueño
> antes de construir cada módulo.

- **usuarios**: id (= uid Supabase), nombre, email, rol, area, activo, creado_en.
- **productos**: id, codigo, nombre, descripcion, unidad_medida, categoria, activo, ts.
- **proveedores**: id, razon_social, identificacion_fiscal, contacto, telefono, email, direccion, activo, ts.
- **clientes**: id, razon_social, identificacion_fiscal, contacto, telefono, email, direccion, activo, ts.
- **materias_primas**: id, codigo, nombre, unidad_medida, tipo (principal|insumo), proveedor_id?, activo, ts.
- **lotes_mp** (recepción física, stock + vencimiento): id, materia_prima_id, proveedor_id, lote_proveedor, fecha_recepcion, fecha_vencimiento, cantidad_recibida, cantidad_disponible, unidad, ts.
- **movimientos_stock_mp** (auditoría, fase posterior): id, lote_mp_id, tipo (entrada|salida|ajuste|merma), cantidad, fecha, referencia, motivo.
- **recetas**: id, producto_id, version, rendimiento_esperado, activo.
- **receta_items**: id, receta_id, materia_prima_id, cantidad_por_unidad, unidad.
- **lotes_produccion**: id, codigo_lote, fecha, turno, producto_id, cantidad_producida, unidad, merma, responsable_id, observaciones, ts.
- **consumos_mp**: id, lote_produccion_id, lote_mp_id, cantidad_consumida, unidad, origen (manual|backflush).
- **despachos**: id, cliente_id, fecha, numero_documento, observaciones, ts.
- **despacho_items**: id, despacho_id, lote_produccion_id, cantidad, unidad.

**Trazabilidad recall:**
- Adelante: lote_mp → consumos_mp → lotes_produccion → despacho_items → despachos → clientes.
- Atrás: despacho → lote_produccion → consumos_mp → lotes_mp → proveedor.

---

## 5. Estado actual del proyecto

**Hecho:**
- Fase 0 (en curso): estructura de monorepo, `.gitignore`, `CLAUDE.md`, `README.md`,
  Stop hook de Claude Code.

**Falta (próximos pasos inmediatos):**
- Crear repositorio en GitHub y primer push (con guía para el dueño).
- Fase 1: proyecto Supabase + Prisma + migración inicial + login/RBAC.
- Fase 2: catálogos base (Productos → Proveedores → Clientes → Materias primas) + importador Excel.
- Fase 3: stock/vencimientos + recetas + producción + despachos.
- Fase 4: reporte de recall + dashboards + despliegue.

**Plan completo de fases:** ver el plan aprobado (resumen en sección 5 y README).

---

## 6. Cómo correr el proyecto localmente

> Aún no hay apps creadas. Esta sección se completará en Fase 1.
> Requisitos previos: Node.js 20+ y npm.

```bash
npm install          # instala dependencias de todo el monorepo
# (próximamente) npm run dev:web   y   npm run dev:api
```

---

## 7. Cómo desplegar

> Se completará en Fase 4.
> - Frontend (web) → Vercel
> - Backend (api) → Render o Railway
> - Base de datos + Auth → Supabase (plan Pro para respaldos diarios)

---

## 8. Decisiones pendientes / notas para retomar

- Campos exactos de cada formulario (se confirman módulo por módulo con el dueño).
- Unidades de medida estándar (¿kg, unidades, ambos?) y conversiones.
- ¿Arrancar producción directo en Supabase Pro o probar en Free primero?
- Costo de producción estimado: ~$30-32/mes (Supabase Pro $25 + backend $5-7 + Vercel $0).

---

## 9. Reglas para el asistente (Claude Code) en este proyecto

- El dueño **no tiene experiencia con terminal**: al pedir un comando, darlo exacto y
  explicar en una frase qué hace.
- Avanzar en **pasos pequeños y verificables**, no bloques enormes de código.
- **Preguntar** ante ambigüedad de negocio (campos, reglas) en vez de asumir.
- Al final de cada sesión: resumir lo hecho y lo que sigue, **actualizar este CLAUDE.md**,
  y hacer **commit + push** a GitHub.
