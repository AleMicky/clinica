"use client";

import * as React from "react";
import { toast } from "sonner";
import { PacienteHeader } from "./paciente-header";
import { PacienteMetricsCards } from "./paciente-metrics";
import { PacienteTable } from "./paciente-table";
import { PacienteFormDialog } from "./paciente-form-dialog";
import { PacienteDeleteDialog } from "./paciente-delete-dialog";
import { PacienteConveniosDialog } from "./paciente-convenios-dialog";
import { usePacientes, useDeletePaciente } from "../hooks/use-pacientes";
import type { PacienteMetrics, PacienteResponse } from "../types/paciente.types";
import { getPacienteFullName } from "./paciente-card";

export function PacienteModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [pacienteToEdit, setPacienteToEdit] = React.useState<PacienteResponse | null>(null);

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pacienteToDelete, setPacienteToDelete] = React.useState<PacienteResponse | null>(null);

  // Convenios dialog state
  const [conveniosDialogOpen, setConveniosDialogOpen] = React.useState(false);
  const [pacienteForConvenios, setPacienteForConvenios] = React.useState<PacienteResponse | null>(
    null
  );

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // React Query Hook: Requests API endpoint `/pacientes`
  const {
    data: apiData,
    isLoading,
    refetch,
  } = usePacientes({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeletePaciente();

  // Reset pagination when search or page size changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const pacientes: PacienteResponse[] = apiData?.items ?? [];

  // Compute Metrics
  const total = apiData?.totalItems ?? pacientes.length;
  const activos = pacientes.filter((p) => p.activo).length;
  const conTelefono = pacientes.filter((p) => Boolean(p.persona?.telefono)).length;

  const metrics: PacienteMetrics = {
    totalPacientes: total,
    pacientesActivos: activos,
    conTelefono: conTelefono,
    conConvenio: Math.round(total * 0.4),
  };

  const handleOpenAdd = () => {
    setPacienteToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (paciente: PacienteResponse) => {
    setPacienteToEdit(paciente);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = pacientes.find((p) => p.id === id);
    if (target) {
      setPacienteToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleOpenConvenios = (paciente: PacienteResponse) => {
    setPacienteForConvenios(paciente);
    setConveniosDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pacienteToDelete) return;

    try {
      await deleteMutation.mutateAsync(pacienteToDelete.id);
      toast.success(
        `Paciente ${getPacienteFullName(pacienteToDelete)} desactivado correctamente.`
      );
      refetch();
    } catch {
    } finally {
      setPacienteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in-50 duration-300">
      <PacienteHeader onAddClick={handleOpenAdd} />
      <PacienteMetricsCards metrics={metrics} />
      <PacienteTable
        pacientes={pacientes}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onManageConvenios={handleOpenConvenios}
        onRefresh={() => refetch()}
      />
      <PacienteFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        pacienteToEdit={pacienteToEdit}
        onSuccessCallback={() => refetch()}
      />
      <PacienteDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        paciente={pacienteToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
      <PacienteConveniosDialog
        open={conveniosDialogOpen}
        onOpenChange={setConveniosDialogOpen}
        paciente={pacienteForConvenios}
      />
    </div>
  );
}
