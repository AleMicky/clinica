"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PersonaHeader } from "./persona-header";
import { PersonaMetricsCards } from "./persona-metrics";
import { PersonaList } from "./persona-list";
import { PersonaDeleteDialog } from "./persona-delete-dialog";
import { usePersonas, useDeletePersona } from "../hooks/use-personas";
import type { PersonaMetrics, PersonaResponse } from "../types/persona.types";

export function PersonaModuleView() {
  const router = useRouter();

  // Delete AlertDialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [personaToDelete, setPersonaToDelete] = React.useState<PersonaResponse | null>(null);

  // Filtros & Paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // React Query Hook: Requests real API endpoint `/personas`
  const {
    data: apiData,
    isLoading,
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

  const handleStatusTabChange = (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const allPersonas: PersonaResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredPersonas = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allPersonas.filter((p) => p.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allPersonas.filter((p) => !p.activo);
    }
    return allPersonas;
  }, [allPersonas, selectedStatusTab]);

  // Compute Metrics from API data
  const total = apiData?.totalItems ?? allPersonas.length;
  const activas = allPersonas.filter((p) => p.activo).length;
  const inactivas = allPersonas.filter((p) => !p.activo).length;
  const conTelefono = allPersonas.filter((p) => Boolean(p.telefono?.trim())).length;

  const metrics: PersonaMetrics = {
    totalPersonas: total,
    personasActivas: activas,
    personasInactivas: inactivas,
    conTelefono,
  };

  const handleOpenAdd = () => {
    router.push("/seguridad/personas/nueva");
  };

  const handleOpenEdit = (persona: PersonaResponse) => {
    router.push(`/seguridad/personas/${persona.id}/editar`);
  };

  const handleOpenDelete = (id: number) => {
    const target = allPersonas.find((p) => p.id === id);
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
        `Persona "${personaToDelete.nombres} ${personaToDelete.apellidoPaterno}" eliminada correctamente.`
      );
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar la persona.");
    } finally {
      setPersonaToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <PersonaHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <PersonaMetricsCards metrics={metrics} />

      {/* Listado Principal de Personas (Formato Lista igual a Admisiones y Usuarios) */}
      <PersonaList
        personas={filteredPersonas}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allPersonas.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={handleStatusTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />

      {/* Modal: Confirmación de Eliminación */}
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
