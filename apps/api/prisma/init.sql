-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'produccion', 'calidad', 'logistica');

-- CreateEnum
CREATE TYPE "TipoMateriaPrima" AS ENUM ('principal', 'insumo');

-- CreateEnum
CREATE TYPE "OrigenConsumo" AS ENUM ('manual', 'backflush');

-- CreateEnum
CREATE TYPE "TipoMovimientoStock" AS ENUM ('entrada', 'salida', 'ajuste', 'merma');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "area" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL,
    "razon_social" TEXT NOT NULL,
    "identificacion_fiscal" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "razon_social" TEXT NOT NULL,
    "identificacion_fiscal" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_primas" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "tipo" "TipoMateriaPrima" NOT NULL,
    "proveedor_id" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materias_primas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_mp" (
    "id" UUID NOT NULL,
    "materia_prima_id" UUID NOT NULL,
    "proveedor_id" UUID,
    "lote_proveedor" TEXT,
    "fecha_recepcion" DATE NOT NULL,
    "fecha_vencimiento" DATE,
    "cantidad_recibida" DECIMAL(14,3) NOT NULL,
    "cantidad_disponible" DECIMAL(14,3) NOT NULL,
    "unidad" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_mp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock_mp" (
    "id" UUID NOT NULL,
    "lote_mp_id" UUID NOT NULL,
    "tipo" "TipoMovimientoStock" NOT NULL,
    "cantidad" DECIMAL(14,3) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "motivo" TEXT,

    CONSTRAINT "movimientos_stock_mp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rendimiento_esperado" DECIMAL(14,3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_items" (
    "id" UUID NOT NULL,
    "receta_id" UUID NOT NULL,
    "materia_prima_id" UUID NOT NULL,
    "cantidad_por_unidad" DECIMAL(14,3) NOT NULL,
    "unidad" TEXT NOT NULL,

    CONSTRAINT "receta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_produccion" (
    "id" UUID NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "turno" TEXT,
    "producto_id" UUID NOT NULL,
    "cantidad_producida" DECIMAL(14,3) NOT NULL,
    "unidad" TEXT NOT NULL,
    "merma" DECIMAL(14,3),
    "responsable_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumos_mp" (
    "id" UUID NOT NULL,
    "lote_produccion_id" UUID NOT NULL,
    "lote_mp_id" UUID NOT NULL,
    "cantidad_consumida" DECIMAL(14,3) NOT NULL,
    "unidad" TEXT NOT NULL,
    "origen" "OrigenConsumo" NOT NULL DEFAULT 'manual',

    CONSTRAINT "consumos_mp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "numero_documento" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despacho_items" (
    "id" UUID NOT NULL,
    "despacho_id" UUID NOT NULL,
    "lote_produccion_id" UUID NOT NULL,
    "cantidad" DECIMAL(14,3) NOT NULL,
    "unidad" TEXT NOT NULL,

    CONSTRAINT "despacho_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materias_primas_codigo_key" ON "materias_primas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_produccion_codigo_lote_key" ON "lotes_produccion"("codigo_lote");

-- AddForeignKey
ALTER TABLE "materias_primas" ADD CONSTRAINT "materias_primas_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_mp" ADD CONSTRAINT "lotes_mp_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_mp" ADD CONSTRAINT "lotes_mp_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock_mp" ADD CONSTRAINT "movimientos_stock_mp_lote_mp_id_fkey" FOREIGN KEY ("lote_mp_id") REFERENCES "lotes_mp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_produccion" ADD CONSTRAINT "lotes_produccion_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_produccion" ADD CONSTRAINT "lotes_produccion_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumos_mp" ADD CONSTRAINT "consumos_mp_lote_produccion_id_fkey" FOREIGN KEY ("lote_produccion_id") REFERENCES "lotes_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumos_mp" ADD CONSTRAINT "consumos_mp_lote_mp_id_fkey" FOREIGN KEY ("lote_mp_id") REFERENCES "lotes_mp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_lote_produccion_id_fkey" FOREIGN KEY ("lote_produccion_id") REFERENCES "lotes_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

