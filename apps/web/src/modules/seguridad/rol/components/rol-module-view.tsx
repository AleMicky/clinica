"use client";

import * as React from "react";
import { toast } from "sonner";

import { useDeleteRol, useRoles } from "../hooks/use-roles";
import type { RolResponse } from "../types/rol.types";
import { RolDeleteDialog } from "./rol-delete-dialog";
import { RolFormDialog } from "./rol-form-dialog";
import { RolHeader } from "./rol-header";
import { RolTable } from "./rol-table";

export function RolModuleView() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRol, setSelectedRol] = React.useState<RolResponse | null>(null);

  const { data, isLoading } = useRoles({
    page,
    pageSize,
    search: search ? search : undefined,
  });

  const deleteMutation = useDeleteRol();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedRol(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (rol: RolResponse) => {
    setSelectedRol(rol);
    setFormOpen(true);
  };

  const handleOpenDelete = (rol: RolResponse) => {
    setSelectedRol(rol);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRol) return;
    try {
      await deleteMutation.mutateAsync(selectedRol.id);
      toast.success("Rol eliminado exitosamente");
      setDeleteOpen(false);
      setSelectedRol(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "No se pudo eliminar el rol.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <RolHeader onNew={handleOpenCreate} />

      <RolTable
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <RolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rolToEdit={selectedRol}
      />

      <RolDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        rol={selectedRol}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
