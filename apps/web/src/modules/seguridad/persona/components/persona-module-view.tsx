"use client";

import * as React from "react";
import { toast } from "sonner";
import { PersonaHeader } from "./persona-header";
import { PersonaMetricsCards } from "./persona-metrics";
import { PersonaTable } from "./persona-table";
import { PersonaFormDialog } from "./persona-form-dialog";
import { PersonaDeleteDialog } from "./persona-delete-dialog";
import { usePersonas, useDeletePersona } from "../hooks/use-personas";
import type { PersonaMetrics, PersonaResponse } from "../types/persona.types";

export function PersonaModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [personaToEdit, setPersonaToEdit] = React.useState<PersonaResponse | null>(null);

  // Delete AlertDialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [personaToDelete, setPersonaToDelete] = React.useState<PersonaResponse | null>(null);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // React Query Hook: Requests real API endpoint `/personas`
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePersonas({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeletePersona();

  // Reset pagination when search or page size changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const personas: PersonaResponse[] = apiData?.items ?? [];

  // Compute Metrics from API data
  const metrics: PersonaMetrics = {
    totalPersonas: apiData?.totalItems ?? personas.length,
    personasActivas: personas.filter((p) => p.activo).length,
    conTelefono: personas.filter((p) => Boolean(p.telefono?.trim())).length,
    personasInactivas: personas.filter((p) => !p.activo).length,
  };

  const handleOpenAdd = () => {
    setPersonaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (persona: PersonaResponse) => {
    setPersonaToEdit(persona);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = personas.find((p) => p.id === id);
    if (target) {
      setPersonaToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!personaToDelete) return;

    try {
      await deleteMutation.mutateAsync(personaToDelete.id);
      toast.success(
        `Persona ${personaToDelete.nombres} ${personaToDelete.apellidoPaterno} eliminada correctamente.`
      );
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al eliminar la persona."
      );
    } finally {
      setPersonaToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <PersonaHeader onAddClick={handleOpenAdd} />
      <PersonaMetricsCards metrics={metrics} />
      <PersonaTable
        personas={personas}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as any)?.message}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <PersonaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        personaToEdit={personaToEdit}
        onSuccessCallback={() => refetch()}
      />
      <PersonaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        persona={personaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
