"use client";

import * as React from "react";
import { ProductoHeader } from "./producto-header";
import { ProductoMetricsCards } from "./producto-metrics";
import { ProductoMasterList } from "./producto-master-list";
import { ProductoDetailLotesView } from "./producto-detail-lotes-view";
import { ProductoFormDialog } from "./producto-form-dialog";
import { ProductoDeleteDialog } from "./producto-delete-dialog";
import { useProductos } from "../hooks/use-producto";
import { useCategoriasProducto } from "../../categoria-producto/hooks/use-categoria-producto";
import type { ProductoMetrics, ProductoResponse } from "../types/producto.types";
import type { LoteResponse } from "../../lote/types/lote.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { useDebounce } from "@/hooks/use-debounce";

export function ProductoModuleView() {
  // Search, pagination & category filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [categoriaFilter, setCategoriaFilter] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Selected Producto ID for Master-Detail view
  const [selectedProductoId, setSelectedProductoId] = React.useState<number | null>(null);

  const {
    data: productosData,
    isLoading,
    isFetching,
    refetch,
  } = useProductos({
    page,
    pageSize,
    search: debouncedSearch.trim() || undefined,
    categoriaProductoId: categoriaFilter ?? undefined,
  });

  const { data: categoriasData } = useCategoriasProducto({ pageSize: 200 });
  const categorias = React.useMemo(
    () => categoriasData?.items ?? [],
    [categoriasData?.items]
  );

  const productos = React.useMemo(
    () => productosData?.items ?? [],
    [productosData?.items]
  );

  // Derive active selected producto during render (avoids cascading setState in useEffect)
  const selectedProducto = React.useMemo(() => {
    if (productos.length === 0) return null;
    if (selectedProductoId !== null) {
      const found = productos.find((p) => p.id === selectedProductoId);
      if (found) return found;
    }
    return productos[0] ?? null;
  }, [productos, selectedProductoId]);

  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleCategoriaFilterChange = React.useCallback((catId: number | null) => {
    setCategoriaFilter(catId);
    setPage(1);
  }, []);

  const handleClearFilters = React.useCallback(() => {
    setSearchTerm("");
    setCategoriaFilter(null);
    setPage(1);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleSelectProducto = React.useCallback((producto: ProductoResponse) => {
    setSelectedProductoId(producto.id);
  }, []);

  // Metrics computation
  const metrics: ProductoMetrics = React.useMemo(() => {
    const rawItems = productosData?.items ?? [];
    const conLote = rawItems.filter((p) => p.controlaLote).length;
    const conVence = rawItems.filter((p) => p.controlaVencimiento).length;
    const uniqueCats = new Set(rawItems.map((p) => p.categoriaProductoId));

    return {
      totalProductos: productosData?.totalItems ?? rawItems.length,
      controlaLoteCount: conLote,
      controlaVencimientoCount: conVence,
      categoriasCount: uniqueCats.size || (categorias.length > 0 ? categorias.length : 0),
    };
  }, [productosData, categorias]);

  // Form Dialog state (Producto)
  const [formOpen, setFormOpen] = React.useState(false);
  const [productoToEdit, setProductoToEdit] = React.useState<ProductoResponse | null>(null);

  const handleOpenAdd = React.useCallback(() => {
    setProductoToEdit(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((producto: ProductoResponse) => {
    setProductoToEdit(producto);
    setFormOpen(true);
  }, []);

  // Delete Dialog state (Producto)
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [productoToDelete, setProductoToDelete] = React.useState<ProductoResponse | null>(null);

  const handleOpenDelete = React.useCallback((producto: ProductoResponse) => {
    setProductoToDelete(producto);
    setDeleteOpen(true);
  }, []);

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAuditProducto = React.useCallback((producto: ProductoResponse) => {
    setAuditInfo(buildProductoAuditInfo(producto));
    setAuditDialogOpen(true);
  }, []);

  const handleViewAuditLote = React.useCallback((lote: LoteResponse) => {
    setAuditInfo(buildLoteAuditInfo(lote));
    setAuditDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <ProductoHeader />

      <ProductoMetricsCards metrics={metrics} />

      {/* Master-Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Master Panel (Catálogo de Productos) */}
        <div className="lg:col-span-4 xl:col-span-4 h-full">
          <ProductoMasterList
            productos={productos}
            categorias={categorias}
            isLoading={isLoading}
            isFetching={isFetching}
            selectedProductoId={selectedProducto?.id ?? null}
            onSelectProducto={handleSelectProducto}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            categoriaFilter={categoriaFilter}
            onCategoriaFilterChange={handleCategoriaFilterChange}
            onClearFilters={handleClearFilters}
            page={page}
            pageSize={pageSize}
            totalItems={productosData?.totalItems ?? 0}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onAddProducto={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onRefresh={refetch}
          />
        </div>

        {/* Detail Panel (Ficha técnica del Producto y Lotes) */}
        <div className="lg:col-span-8 xl:col-span-8 h-full">
          <ProductoDetailLotesView
            producto={selectedProducto}
            onEditProducto={handleOpenEdit}
            onDeleteProducto={handleOpenDelete}
            onViewAuditProducto={handleViewAuditProducto}
            onViewAuditLote={handleViewAuditLote}
          />
        </div>
      </div>

      {/* Form Dialog (Create / Edit Producto) */}
      <ProductoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        productoToEdit={productoToEdit}
        onSuccessCallback={refetch}
      />

      {/* Delete Dialog (Producto) */}
      <ProductoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productoToDelete={productoToDelete}
        onSuccessCallback={refetch}
      />

      {/* Shared Audit Dialog */}
      <AuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper functions for Audit transformations
// ---------------------------------------------------------------------------

function buildProductoAuditInfo(producto: ProductoResponse): AuditInfo {
  const rawCreated = producto.fechaCreacion || producto.createdAt;
  const rawUpdated = producto.fechaModificacion || producto.updatedAt;
  const createdUser = producto.creadoPor || producto.createdBy;
  const updatedUser = producto.modificadoPor || producto.updatedBy;

  return {
    title: "Auditoría de Producto",
    entityName: producto.nombre,
    entityCode: producto.codigo,
    id: producto.id,
    createdAt: rawCreated,
    createdBy: createdUser,
    updatedAt: rawUpdated,
    updatedBy: updatedUser,
    extraDetails: [
      ...(producto.categoriaProductoNombre
        ? [{ label: "Categoría", value: producto.categoriaProductoNombre }]
        : []),
      ...(producto.unidadMedidaNombre
        ? [
            {
              label: "Unidad de Medida",
              value: `${producto.unidadMedidaNombre} (${producto.unidadMedidaSimbolo ?? ""})`,
            },
          ]
        : []),
      { label: "Controla Lote", value: producto.controlaLote ? "Sí" : "No" },
      {
        label: "Controla Vencimiento",
        value: producto.controlaVencimiento ? "Sí" : "No",
      },
      { label: "Stock Mínimo", value: String(producto.stockMinimo) },
      {
        label: "Stock Máximo",
        value:
          producto.stockMaximo !== null && producto.stockMaximo !== undefined
            ? String(producto.stockMaximo)
            : "Sin límite",
      },
      ...(producto.descripcion
        ? [{ label: "Descripción", value: producto.descripcion }]
        : []),
    ],
  };
}

function buildLoteAuditInfo(lote: LoteResponse): AuditInfo {
  const rawCreated = lote.fechaCreacion || lote.createdAt;
  const rawUpdated = lote.fechaModificacion || lote.updatedAt;
  const createdUser = lote.creadoPor || lote.createdBy;
  const updatedUser = lote.modificadoPor || lote.updatedBy;

  return {
    title: "Auditoría de Lote",
    entityName: `Lote ${lote.numeroLote}`,
    entityCode: lote.numeroLote,
    id: lote.id,
    createdAt: rawCreated,
    createdBy: createdUser,
    updatedAt: rawUpdated,
    updatedBy: updatedUser,
    extraDetails: [
      ...(lote.fechaFabricacion
        ? [{ label: "Fabricación", value: lote.fechaFabricacion }]
        : []),
      ...(lote.fechaVencimiento
        ? [{ label: "Vencimiento", value: lote.fechaVencimiento }]
        : []),
      ...(lote.costoUnitario !== null && lote.costoUnitario !== undefined
        ? [{ label: "Costo Unitario", value: `Bs. ${Number(lote.costoUnitario).toFixed(2)}` }]
        : []),
    ],
  };
}
