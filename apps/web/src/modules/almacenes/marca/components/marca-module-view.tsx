"use client";

import * as React from "react";
import { MarcaHeader } from "./marca-header";
import { MarcaList } from "./marca-list";
import { MarcaFormDialog } from "./marca-form-dialog";
import { MarcaDeleteDialog } from "./marca-delete-dialog";
import { useMarcas } from "../hooks/use-marca";
import type { MarcaResponse } from "../types/marca.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function MarcaModuleView() {
  // Search, pagination state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [selectedMarcasMap, setSelectedMarcasMap] = React.useState<
    Map<number, MarcaResponse>
  >(new Map());

  const {
    data: marcasData,
    isLoading,
    refetch,
  } = useMarcas({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
  });

  const marcas = marcasData?.items ?? [];

  // Keep map updated with current page marcas
  const handleSelectionChange = (newSelectedIds: number[]) => {
    setSelectedIds(newSelectedIds);
    setSelectedMarcasMap((prev) => {
      const next = new Map(prev);
      marcas.forEach((m) => {
        if (newSelectedIds.includes(m.id)) {
          next.set(m.id, m);
        }
      });
      for (const id of next.keys()) {
        if (!newSelectedIds.includes(id)) {
          next.delete(id);
        }
      }
      return next;
    });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [marcaToEdit, setMarcaToEdit] = React.useState<MarcaResponse | null>(null);

  const handleOpenAdd = () => {
    setMarcaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (marca: MarcaResponse) => {
    setMarcaToEdit(marca);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [marcaToDelete, setMarcaToDelete] = React.useState<MarcaResponse | null>(null);
  const [marcasToDelete, setMarcasToDelete] = React.useState<MarcaResponse[]>([]);

  const handleOpenDelete = (marca: MarcaResponse) => {
    setMarcaToDelete(marca);
    setMarcasToDelete([]);
    setDeleteOpen(true);
  };

  const handleOpenDeleteMultiple = (ids: number[]) => {
    const items = ids
      .map((id) => selectedMarcasMap.get(id) ?? marcas.find((m) => m.id === id))
      .filter((item): item is MarcaResponse => Boolean(item));

    setMarcaToDelete(null);
    setMarcasToDelete(items);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (marca: MarcaResponse) => {
    const rawCreated =
      marca.fechaCreacion ||
      marca.createdAt ||
      marca.created_at ||
      marca.creadoEn;
    const rawUpdated =
      marca.fechaModificacion ||
      marca.updatedAt ||
      marca.updated_at ||
      marca.actualizadoEn;
    const createdUser =
      marca.creadoPor ||
      marca.createdBy ||
      marca.created_by ||
      marca.usuarioCreacion;
    const updatedUser =
      marca.modificadoPor ||
      marca.updatedBy ||
      marca.updated_by ||
      marca.usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Marca",
      entityName: marca.nombre,
      entityCode: marca.codigo,
      id: marca.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        ...(marca.descripcion ? [{ label: "Descripción", value: marca.descripcion }] : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <MarcaHeader />

      <MarcaList
        marcas={marcas}
        isLoading={isLoading}
        totalItems={marcasData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddMarca={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onDeleteMultiple={handleOpenDeleteMultiple}
      />

      {/* Form Dialog (Create / Edit) */}
      <MarcaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        marcaToEdit={marcaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog (Single & Multiple) */}
      <MarcaDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        marcaToDelete={marcaToDelete}
        marcasToDelete={marcasToDelete}
        onSuccessCallback={() => {
          setSelectedIds([]);
          setSelectedMarcasMap(new Map());
          refetch();
        }}
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
