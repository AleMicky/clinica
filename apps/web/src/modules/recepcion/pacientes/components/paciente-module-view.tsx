"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PacienteHeader } from "./paciente-header";
import { PacienteMetricsCards } from "./paciente-metrics";
import { PacienteList } from "./paciente-list";
import { PacienteDeleteDialog } from "./paciente-delete-dialog";
import { PacienteConveniosDialog } from "./paciente-convenios-dialog";
import { PacienteImportDialog } from "./paciente-import-dialog";
import { usePacientes, useDeletePaciente } from "../hooks/use-pacientes";
import type { PacienteMetrics, PacienteResponse } from "../types/paciente.types";

export function PacienteModuleView() {
  const router = useRouter();

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pacienteToDelete, setPacienteToDelete] = React.useState<PacienteResponse | null>(null);

  // Convenios dialog state
  const [conveniosDialogOpen, setConveniosDialogOpen] = React.useState(false);
  const [pacienteForConvenios, setPacienteForConvenios] = React.useState<PacienteResponse | null>(
    null
  );

  // Import Excel dialog state
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

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

  const handleStatusTabChange = (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const allPacientes: PacienteResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredPacientes = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allPacientes.filter((p) => p.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allPacientes.filter((p) => !p.activo);
    }
    return allPacientes;
  }, [allPacientes, selectedStatusTab]);

  // Compute Metrics from API data
  const total = apiData?.totalItems ?? allPacientes.length;
  const activos = allPacientes.filter((p) => p.activo).length;
  const conTelefono = allPacientes.filter((p) => Boolean(p.persona?.telefono?.trim())).length;
  const conConvenio = 0; // Calculable según convenios activos

  const metrics: PacienteMetrics = {
    totalPacientes: total,
    pacientesActivos: activos,
    conTelefono,
    conConvenio,
  };

  const handleOpenAdd = () => {
    router.push("/recepcion/pacientes/nuevo");
  };

  const handleOpenEdit = (paciente: PacienteResponse) => {
    router.push(`/recepcion/pacientes/${paciente.id}/editar`);
  };

  const handleOpenConvenios = (paciente: PacienteResponse) => {
    setPacienteForConvenios(paciente);
    setConveniosDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = allPacientes.find((p) => p.id === id);
    if (target) {
      setPacienteToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pacienteToDelete) return;

    try {
      await deleteMutation.mutateAsync(pacienteToDelete.id);
      const nombre = pacienteToDelete.persona
        ? `${pacienteToDelete.persona.nombres} ${pacienteToDelete.persona.apellidoPaterno}`
        : `#${pacienteToDelete.id}`;
      toast.success(`Paciente "${nombre}" eliminado correctamente.`);
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar el paciente.");
    } finally {
      setPacienteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <PacienteHeader
        onAddClick={handleOpenAdd}
        onImportClick={() => setImportDialogOpen(true)}
        onRefresh={() => refetch()}
      />

      {/* Tarjetas de Métricas en Vivo */}
      <PacienteMetricsCards metrics={metrics} />

      {/* Listado Principal de Pacientes (Formato Lista igual a Admisiones, Usuarios y Personas) */}
      <PacienteList
        pacientes={filteredPacientes}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allPacientes.length}
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
        onManageConvenios={handleOpenConvenios}
        onRefresh={() => refetch()}
      />

      {/* Modal: Importación Masiva desde Excel */}
      <PacienteImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Modal: Gestión de Convenios y Aseguradoras */}
      <PacienteConveniosDialog
        open={conveniosDialogOpen}
        onOpenChange={setConveniosDialogOpen}
        paciente={pacienteForConvenios}
      />

      {/* Modal: Confirmación de Eliminación */}
      <PacienteDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        paciente={pacienteToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
