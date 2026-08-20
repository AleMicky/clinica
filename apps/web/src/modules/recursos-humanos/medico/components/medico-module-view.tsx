"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MedicoHeader } from "./medico-header";
import { MedicoMetricsCards, type MedicoMetrics } from "./medico-metrics";
import { MedicoList, getMedicoFullName } from "./medico-list";
import { MedicoDeleteDialog } from "./medico-delete-dialog";
import { useMedicos } from "../hooks/use-medicos";
import type { MedicoResponse } from "../types/medico.types";

export function MedicoModuleView() {
  const router = useRouter();

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [medicoToDelete, setMedicoToDelete] = React.useState<MedicoResponse | null>(null);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useMedicos({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

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

  const allMedicos: MedicoResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredMedicos = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allMedicos.filter((m) => m.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allMedicos.filter((m) => !m.activo);
    }
    return allMedicos;
  }, [allMedicos, selectedStatusTab]);

  // Compute Metrics
  const total = apiData?.totalCount ?? allMedicos.length;
  const activos = allMedicos.filter((m) => m.activo).length;
  const conMinsal = allMedicos.filter((m) => Boolean(m.registroMinisterioSalud?.trim())).length;

  const metrics: MedicoMetrics = {
    totalMedicos: total,
    medicosActivos: activos,
    conRegistroMinsal: conMinsal,
  };

  const handleOpenAdd = () => {
    router.push("/recursos-humanos/medicos/nuevo");
  };

  const handleOpenEdit = (medico: MedicoResponse) => {
    router.push(`/recursos-humanos/medicos/${medico.id}/editar`);
  };

  const handleOpenDelete = (medico: MedicoResponse) => {
    setMedicoToDelete(medico);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <MedicoHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <MedicoMetricsCards metrics={metrics} />

      {/* Listado Principal de Médicos (Formato Lista igual a Admisiones, Usuarios, Personas, Pacientes y Empleados) */}
      <MedicoList
        medicos={filteredMedicos}
        isLoading={isLoading}
        totalItems={apiData?.totalCount ?? allMedicos.length}
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
      <MedicoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setMedicoToDelete(null);
            refetch();
          }
        }}
        medico={medicoToDelete}
      />
    </div>
  );
}
