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
import { OpcionMenuHeader } from "./opcion-menu-header";
import { OpcionMenuTreeView } from "./opcion-menu-tree-view";
import { OpcionMenuFormDialog } from "./opcion-menu-form-dialog";
import { OpcionMenuDeleteDialog } from "./opcion-menu-delete-dialog";
import { AuditDialog, type AuditInfo } from "@/components/shared/audit-dialog";
import type {
  OpcionMenuResponse,
  OpcionMenuTreeResponse,
} from "../types/opcion-menu.types";

export function OpcionMenuModuleView() {
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
    data: treeData,
    isLoading: isTreeLoading,
    refetch: refetchTree,
    isRefetching: isTreeRefetching,
  } = useOpcionesMenuTree();

  // Fetch all options for parents selection and flat lookup
  const {
    data: allOptionsData,
    refetch: refetchAll,
    isRefetching: isAllRefetching,
  } = useOpcionesMenu({
    page: 1,
    pageSize: 300,
  });

  // Mutations
  const deleteMutation = useDeleteOpcionMenu();
  const activarMutation = useActivarOpcionMenu();
  const inactivarMutation = useInactivarOpcionMenu();

  const allItems = allOptionsData?.items || [];

  const handleRefresh = () => {
    refetchTree();
    refetchAll();
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudo cambiar el estado de la opción.";
      toast.error(msg);
    }
  };

  const handleViewAudit = (item: OpcionMenuResponse | OpcionMenuTreeResponse) => {
    const fullItem = allItems.find((x) => x.id === item.id);
    const parentItem = fullItem?.padreId
      ? allItems.find((x) => x.id === fullItem.padreId)
      : null;

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
        { label: "Icono", value: item.icono || "Folder" },
        { label: "Orden", value: item.orden },
        {
          label: "Menú Padre",
          value: parentItem
            ? `${parentItem.nombre} (${parentItem.codigo})`
            : "Módulo Principal / Raíz",
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudo eliminar la opción de menú.";
      toast.error(msg);
    }
  };

  const isRefreshing = isTreeRefetching || isAllRefetching;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Module Header */}
      <OpcionMenuHeader
        onNew={handleOpenCreate}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Hierarchical Tree Explorer */}
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

      {/* 3. Form Dialog (Create / Edit) */}
      <OpcionMenuFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        opcionToEdit={selectedOpcion}
        defaultParentId={defaultParentId}
        allOptions={allItems}
      />

      {/* 4. Delete Confirmation Dialog */}
      <OpcionMenuDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        opcion={selectedOpcion}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* 5. Shared Audit Dialog */}
      <AuditDialog
        open={auditOpen}
        onOpenChange={setAuditOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
