"use client";

import * as React from "react";
import { toast } from "sonner";
import { MedicoHeader } from "./medico-header";
import { MedicoMetricsCards, type MedicoMetrics } from "./medico-metrics";
import { MedicoList } from "./medico-list";
import { MedicoFormDialog } from "./medico-form-dialog";
import { MedicoAcuerdosModal } from "./medico-acuerdos-modal";
import { MedicoDeleteDialog } from "./medico-delete-dialog";
import { MedicoImportDialog } from "./medico-import-dialog";
import { useMedicos } from "../hooks/use-medicos";
import { exportarMedicosExcel } from "../api/medico.api";
import { useDebounce } from "@/hooks/use-debounce";
import type { MedicoResponse } from "../types/medico.types";

export function MedicoModuleView() {
  // Form Dialog state (Crear / Editar + Especialidades)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [medicoToEdit, setMedicoToEdit] = React.useState<MedicoResponse | null>(null);

  // Import Dialog state (Importación masiva Excel)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  // Export loading state
  const [isExporting, setIsExporting] = React.useState(false);

  // Agreements Modal state (Gestión en Modal con Tabla de Acuerdos)
  const [acuerdosModalMedico, setAcuerdosModalMedico] =
    React.useState<MedicoResponse | null>(null);

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [medicoToDelete, setMedicoToDelete] = React.useState<MedicoResponse | null>(null);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // Main paginated query
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useMedicos({
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch || undefined,
  });

  // Global query for accurate metrics
  const { data: globalData, refetch: refetchGlobal } = useMedicos({
    pageSize: 500,
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

  const allMedicos = React.useMemo<MedicoResponse[]>(
    () => apiData?.items ?? [],
    [apiData?.items]
  );

  // Filter by status tab on current data
  const filteredMedicos = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allMedicos.filter((m) => m.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allMedicos.filter((m) => !m.activo);
    }
    return allMedicos;
  }, [allMedicos, selectedStatusTab]);

  // Compute Metrics from global dataset
  const globalItems = globalData?.items ?? allMedicos;
  const metrics = React.useMemo<MedicoMetrics>(() => {
    const total = globalData?.totalCount ?? globalItems.length;
    const activos = globalItems.filter((m) => m.activo).length;
    const conMinsal = globalItems.filter((m) =>
      Boolean(m.registroMinisterioSalud?.trim())
    ).length;

    return {
      totalMedicos: total,
      medicosActivos: activos,
      conRegistroMinsal: conMinsal,
    };
  }, [globalData?.totalCount, globalItems]);

  const handleOpenAdd = React.useCallback(() => {
    setMedicoToEdit(null);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEdit = (medico: MedicoResponse) => {
    setMedicoToEdit(medico);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (medico: MedicoResponse) => {
    setMedicoToDelete(medico);
    setDeleteDialogOpen(true);
  };

  const handleOpenAcuerdos = (medico: MedicoResponse) => {
    setAcuerdosModalMedico(medico);
  };

  const handleMutationSuccess = () => {
    refetch();
    refetchGlobal();
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.info("Generando reporte de médicos en Excel...");
      const blob = await exportarMedicosExcel(debouncedSearch || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      link.setAttribute("download", `directorio_medicos_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Reporte Excel descargado correctamente.");
    } catch {
      toast.error("Ocurrió un error al exportar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard shortcut: Alt+N to open new Doctor dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        handleOpenAdd();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenAdd]);

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <MedicoHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => {
          refetch();
          refetchGlobal();
        }}
        onExportClick={handleExportExcel}
        onImportClick={() => setImportDialogOpen(true)}
        isExporting={isExporting}
      />

      {/* Tarjetas de Métricas en Vivo */}
      <MedicoMetricsCards metrics={metrics} />

      {/* Listado Principal de Médicos */}
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
        onManageAcuerdos={handleOpenAcuerdos}
        onAddClick={handleOpenAdd}
        onRefresh={() => {
          refetch();
          refetchGlobal();
        }}
      />

      {/* Modal: Crear / Editar Médico con Especialidades Integradas */}
      <MedicoFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setMedicoToEdit(null);
          }
        }}
        medicoToEdit={medicoToEdit}
        onSuccessCallback={handleMutationSuccess}
      />

      {/* Modal: Importación Masiva Excel */}
      <MedicoImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleMutationSuccess}
      />

      {/* Modal: Gestión de Acuerdos de Honorarios en Tabla */}
      <MedicoAcuerdosModal
        open={Boolean(acuerdosModalMedico)}
        onOpenChange={(open) => {
          if (!open) {
            setAcuerdosModalMedico(null);
          }
        }}
        medico={acuerdosModalMedico}
      />

      {/* Modal: Confirmación de Eliminación */}
      <MedicoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setMedicoToDelete(null);
          }
        }}
        medico={medicoToDelete}
        onSuccessCallback={handleMutationSuccess}
      />
    </div>
  );
}

