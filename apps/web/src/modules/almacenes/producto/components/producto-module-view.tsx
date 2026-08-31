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

export function ProductoModuleView() {
  // Search, pagination & category filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoriaFilter, setCategoriaFilter] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Selected Producto for Master-Detail view
  const [selectedProducto, setSelectedProducto] = React.useState<ProductoResponse | null>(null);

  const {
    data: productosData,
    isLoading,
    refetch,
  } = useProductos({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    categoriaProductoId: categoriaFilter ?? undefined,
  });

  const { data: categoriasData } = useCategoriasProducto({ pageSize: 200 });
  const categorias = categoriasData?.items ?? [];

  const productos = productosData?.items ?? [];

  // Automatically select the first item when data loads or selection changes
  React.useEffect(() => {
    if (productos.length > 0) {
      if (!selectedProducto || !productos.some((p) => p.id === selectedProducto.id)) {
        setSelectedProducto(productos[0]);
      } else {
        // Keep updated item reference
        const updated = productos.find((p) => p.id === selectedProducto.id);
        if (updated) setSelectedProducto(updated);
      }
    } else {
      setSelectedProducto(null);
    }
  }, [productos, selectedProducto]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleCategoriaFilterChange = (catId: number | null) => {
    setCategoriaFilter(catId);
    setPage(1);
  };

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

  const handleOpenAdd = () => {
    setProductoToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (producto: ProductoResponse) => {
    setProductoToEdit(producto);
    setFormOpen(true);
  };

  // Delete Dialog state (Producto)
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [productoToDelete, setProductoToDelete] = React.useState<ProductoResponse | null>(null);

  const handleOpenDelete = (producto: ProductoResponse) => {
    setProductoToDelete(producto);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAuditProducto = (producto: ProductoResponse) => {
    const rawCreated =
      producto.fechaCreacion ||
      producto.createdAt ||
      (producto as any).created_at ||
      (producto as any).creadoEn;
    const rawUpdated =
      producto.fechaModificacion ||
      producto.updatedAt ||
      (producto as any).updated_at ||
      (producto as any).actualizadoEn;
    const createdUser =
      producto.creadoPor ||
      producto.createdBy ||
      (producto as any).created_by ||
      (producto as any).usuarioCreacion;
    const updatedUser =
      producto.modificadoPor ||
      producto.updatedBy ||
      (producto as any).updated_by ||
      (producto as any).usuarioModificacion;

    setAuditInfo({
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
    });
    setAuditDialogOpen(true);
  };

  const handleViewAuditLote = (lote: LoteResponse) => {
    const rawCreated =
      lote.fechaCreacion ||
      lote.createdAt ||
      (lote as any).created_at ||
      (lote as any).creadoEn;
    const rawUpdated =
      lote.fechaModificacion ||
      lote.updatedAt ||
      (lote as any).updated_at ||
      (lote as any).actualizadoEn;
    const createdUser =
      lote.creadoPor ||
      lote.createdBy ||
      (lote as any).created_by ||
      (lote as any).usuarioCreacion;
    const updatedUser =
      lote.modificadoPor ||
      lote.updatedBy ||
      (lote as any).updated_by ||
      (lote as any).usuarioModificacion;

    setAuditInfo({
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
          ? [{ label: "Costo Unitario", value: `$${Number(lote.costoUnitario).toFixed(2)}` }]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

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
            selectedProductoId={selectedProducto?.id ?? null}
            onSelectProducto={setSelectedProducto}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            categoriaFilter={categoriaFilter}
            onCategoriaFilterChange={handleCategoriaFilterChange}
            page={page}
            pageSize={pageSize}
            totalItems={productosData?.totalItems ?? 0}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onAddProducto={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onRefresh={() => refetch()}
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
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog (Producto) */}
      <ProductoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productoToDelete={productoToDelete}
        onSuccessCallback={() => refetch()}
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
