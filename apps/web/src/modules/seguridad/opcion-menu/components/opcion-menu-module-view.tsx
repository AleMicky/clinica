"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useActivarOpcionMenu,
  useDeleteOpcionMenu,
  useInactivarOpcionMenu,
  useOpcionesMenu,
  useOpcionesMenuTree,
} from "../hooks/use-opcion-menu";
import { OpcionMenuHeader, type ViewMode } from "./opcion-menu-header";
import { OpcionMenuTreeView } from "./opcion-menu-tree-view";
import { OpcionMenuTable } from "./opcion-menu-table";
import { OpcionMenuFormDialog } from "./opcion-menu-form-dialog";
import { OpcionMenuDeleteDialog } from "./opcion-menu-delete-dialog";
import { AuditDialog, type AuditInfo } from "@/components/shared/audit-dialog";
import type {
  OpcionMenuResponse,
  OpcionMenuTreeResponse,
} from "../types/opcion-menu.types";

export function OpcionMenuModuleView() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("tree");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 15;

  // Dialogs state
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [auditOpen, setAuditOpen] = React.useState(false);

  const [selectedOpcion, setSelectedOpcion] = React.useState<
    OpcionMenuResponse | OpcionMenuTreeResponse | null
  >(null);
  const [defaultParentId, setDefaultParentId] = React.useState<number | null>(null);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  // Queries
  const {
    data: pagedData,
    isLoading: isPagedLoading,
    refetch: refetchPaged,
    isRefetching: isPagedRefetching,
  } = useOpcionesMenu({
    page,
    pageSize,
    search: search ? search : undefined,
  });

  const {
    data: treeData,
    isLoading: isTreeLoading,
    refetch: refetchTree,
    isRefetching: isTreeRefetching,
  } = useOpcionesMenuTree();

  // Fetch all options for parents
  const { data: allOptionsData, refetch: refetchAll } = useOpcionesMenu({
    page: 1,
    pageSize: 300,
  });

  // Mutations
  const deleteMutation = useDeleteOpcionMenu();
  const activarMutation = useActivarOpcionMenu();
  const inactivarMutation = useInactivarOpcionMenu();

  const allItems = allOptionsData?.items || [];

  const handleRefresh = () => {
    refetchPaged();
    refetchTree();
    refetchAll();
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedOpcion(null);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const handleAddChild = (parent: OpcionMenuTreeResponse) => {
    setSelectedOpcion(null);
    setDefaultParentId(parent.id);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: OpcionMenuResponse | OpcionMenuTreeResponse) => {
    // Find full response if tree item
    const fullItem = allItems.find((x) => x.id === item.id) || item;
    setSelectedOpcion(fullItem);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const handleOpenDelete = (item: OpcionMenuResponse | OpcionMenuTreeResponse) => {
    setSelectedOpcion(item);
    setDeleteOpen(true);
  };

  const handleToggleStatus = async (
    item: OpcionMenuResponse | OpcionMenuTreeResponse
  ) => {
    const flatItem = allItems.find((x) => x.id === item.id);
    const isActive = flatItem ? flatItem.activo : true;

    try {
      if (isActive) {
        await inactivarMutation.mutateAsync(item.id);
        toast.success(`"${item.nombre}" se ha inactivado.`);
      } else {
        await activarMutation.mutateAsync(item.id);
        toast.success(`"${item.nombre}" se ha activado.`);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "No se pudo cambiar el estado de la opción.";
      toast.error(msg);
    }
  };

  const handleViewAudit = (item: OpcionMenuResponse | OpcionMenuTreeResponse) => {
    const fullItem = allItems.find((x) => x.id === item.id);
    setAuditInfo({
      title: "Auditoría de Opción de Menú",
      entityName: item.nombre,
      entityCode: item.codigo,
      id: item.id,
      createdAt: fullItem?.fechaCreacion || null,
      createdBy: fullItem?.creadoPor || null,
      updatedAt: fullItem?.fechaModificacion || null,
      updatedBy: fullItem?.modificadoPor || null,
      extraDetails: [
        { label: "Ruta", value: item.ruta || "Sin ruta" },
        { label: "Icono", value: item.icono || "Shield" },
        { label: "Orden", value: item.orden },
        {
          label: "Jerarquía",
          value: fullItem?.padreId ? `Submenú de ID #${fullItem.padreId}` : "Módulo Raíz",
        },
      ],
    });
    setAuditOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOpcion) return;
    try {
      await deleteMutation.mutateAsync(selectedOpcion.id);
      toast.success("Opción de menú eliminada con éxito.");
      setDeleteOpen(false);
      setSelectedOpcion(null);
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "No se pudo eliminar la opción de menú.";
      toast.error(msg);
    }
  };

  const isRefreshing = isPagedRefetching || isTreeRefetching;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Module Header with view toggle */}
      <OpcionMenuHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNew={handleOpenCreate}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Main View Mode (Tree or Table) */}
      {viewMode === "tree" ? (
        <OpcionMenuTreeView
          treeData={treeData || []}
          flatData={allItems}
          isLoading={isTreeLoading}
          onAddChild={handleAddChild}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleOpenDelete}
          onViewAudit={handleViewAudit}
        />
      ) : (
        <OpcionMenuTable
          data={pagedData}
          allOptions={allItems}
          isLoading={isPagedLoading}
          search={search}
          onSearchChange={handleSearchChange}
          onPageChange={setPage}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleOpenDelete}
          onViewAudit={handleViewAudit}
        />
      )}

      {/* 4. Form Dialog (Create / Edit) */}
      <OpcionMenuFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        opcionToEdit={selectedOpcion}
        defaultParentId={defaultParentId}
        allOptions={allItems}
      />

      {/* 5. Delete Confirmation Dialog */}
      <OpcionMenuDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        opcion={selectedOpcion}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* 6. Shared Audit Dialog */}
      <AuditDialog
        open={auditOpen}
        onOpenChange={setAuditOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
