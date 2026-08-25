"use client";

import * as React from "react";
import { toast } from "sonner";

import { useDeleteRol, useRoles } from "../hooks/use-roles";
import type { RolResponse } from "../types/rol.types";
import { RolDeleteDialog } from "./rol-delete-dialog";
import { RolDetailView } from "./rol-detail-view";
import { RolFormDialog } from "./rol-form-dialog";
import { RolHeader } from "./rol-header";
import { RolMasterList } from "./rol-master-list";

export function RolModuleView() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 15;

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRolId, setSelectedRolId] = React.useState<number | null>(null);
  const [dialogRol, setDialogRol] = React.useState<RolResponse | null>(null);

  const { data, isLoading } = useRoles({
    page,
    pageSize,
    search: search ? search : undefined,
  });

  const deleteMutation = useDeleteRol();

  const items = React.useMemo(() => data?.items ?? [], [data]);

  // Derive active role without synchronous setState inside effects
  const activeRol = React.useMemo(() => {
    if (items.length === 0) return null;
    if (selectedRolId !== null) {
      const found = items.find((x) => x.id === selectedRolId);
      if (found) return found;
    }
    return items[0];
  }, [items, selectedRolId]);

  const effectiveSelectedId = activeRol?.id ?? null;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setDialogRol(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (rol: RolResponse) => {
    setDialogRol(rol);
    setFormOpen(true);
  };

  const handleOpenDelete = (rol: RolResponse) => {
    setDialogRol(rol);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!dialogRol) return;
    try {
      await deleteMutation.mutateAsync(dialogRol.id);
      toast.success("Rol eliminado exitosamente");
      setDeleteOpen(false);
      setDialogRol(null);
      if (selectedRolId === dialogRol.id) {
        setSelectedRolId(null);
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
      };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudo eliminar el rol.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <RolHeader onNew={handleOpenCreate} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Master List (Left Pane) */}
        <div className="lg:col-span-4 xl:col-span-4 w-full">
          <RolMasterList
            data={data}
            isLoading={isLoading}
            selectedRolId={effectiveSelectedId}
            onSelectRol={(rol) => setSelectedRolId(rol.id)}
            search={search}
            onSearchChange={handleSearchChange}
            page={page}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </div>

        {/* Detail & Menu Permissions View (Right Pane) */}
        <div className="lg:col-span-8 xl:col-span-8 w-full">
          <RolDetailView
            key={activeRol?.id ?? "empty"}
            rol={activeRol}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </div>
      </div>

      {/* Role Form Modal (Create / Edit) */}
      <RolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rolToEdit={dialogRol}
      />

      {/* Role Delete Confirmation Modal */}
      <RolDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        rol={dialogRol}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
