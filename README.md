# Optiflow

Sistema de gestión para una **planta procesadora de alimentos** (charcutería/embutidos):
catálogos, producción diaria, trazabilidad, control de stock/vencimientos y dashboards.
Reemplaza el registro manual en Excel por una base de datos centralizada con permisos por rol.

> **¿Eres un colaborador nuevo (o Claude Code)?** Lee primero **[`CLAUDE.md`](CLAUDE.md)**:
> contiene el estado actual del proyecto, las decisiones de arquitectura y por dónde seguir.

---

## Stack

- **Frontend:** React + Vite + TypeScript (Tailwind + shadcn/ui, TanStack Query, Recharts)
- **Backend:** NestJS + TypeScript (Prisma)
- **Base de datos + Auth:** Supabase (PostgreSQL)
- **Monorepo:** npm workspaces (`apps/web`, `apps/api`, `packages/shared`)

---

## Requisitos previos

- [Node.js 20 o superior](https://nodejs.org) (incluye `npm`)
- [Git](https://git-scm.com)
- Una cuenta de [Supabase](https://supabase.com) (gratis para empezar)

---

## Puesta en marcha (desarrollo)

```bash
# 1. Clonar el repositorio
git clone <URL-DEL-REPO>
cd "Proyecto Optiflow"

# 2. Instalar todas las dependencias del monorepo
npm install

# 3. Configurar variables de entorno (copiar los ejemplos y rellenarlos)
#    Se crearán apps/web/.env.example y apps/api/.env.example en la Fase 1.

# 4. Arrancar en desarrollo (disponible a partir de la Fase 1)
npm run dev:api    # backend  (NestJS)
npm run dev:web    # frontend (React)
```

> Las apps `web` y `api` se crean en la **Fase 1**. Hasta entonces solo existe la
> estructura del monorepo y la documentación.

---

## Variables de entorno

Cada app tendrá su propio `.env` (NO se sube al repo; ver `.gitignore`). Se documentarán
en la Fase 1 con archivos `.env.example`. Incluirán, entre otras:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (frontend)
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (backend)

---

## Flujo de trabajo con Git (ramas)

- **`main`** → versión estable / producción. No se trabaja directo aquí.
- **`develop`** → integración del trabajo en curso.
- **`feature/<nombre>`** → una rama por cada tarea/módulo nuevo.

Flujo: crear `feature/...` desde `develop` → trabajar → fusionar a `develop` → cuando está
probado, fusionar `develop` a `main`. Los comandos básicos están en `CLAUDE.md` y se
explican paso a paso durante el trabajo.

---

## Estado actual

Ver **[`CLAUDE.md` › Estado actual](CLAUDE.md#5-estado-actual-del-proyecto)**. Resumen:
Fase 0 (cimientos) en curso; siguiente es crear el repo en GitHub y la Fase 1 (Supabase + Auth).
