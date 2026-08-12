"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMedicos } from "../hooks/use-medicos";
import { MedicoHeader } from "./medico-header";
import { MedicoMetricsCards, type MedicoMetrics } from "./medico-metrics";
import { MedicoCardList } from "./medico-card-list";
import { MedicoFormDialog } from "./medico-form-dialog";
import { MedicoDeleteDialog } from "./medico-delete-dialog";
import type { MedicoResponse } from "../types/medico.types";

export function MedicoModuleView() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const [selectedMedico, setSelectedMedico] = React.useState<MedicoResponse | null>(null);

  // Search debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, refetch } = useMedicos({
    page: currentPage,
    pageSize,
    search: debouncedSearch,
  });

  const medicos = React.useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalCount ?? 0;

  // Calculate metrics
  const metrics: MedicoMetrics = React.useMemo(() => {
    const totalMedicos = totalItems;
    const conRegistroMinsal = medicos.filter(
      (m) => Boolean(m.registroMinisterioSalud && m.registroMinisterioSalud.trim().length > 0)
    ).length;
    const medicosActivos = medicos.filter((m) => m.activo).length;

    return {
      totalMedicos,
      conRegistroMinsal,
      medicosActivos,
    };
  }, [medicos, totalItems]);

  const handleAddClick = () => {
    setSelectedMedico(null);
    setIsFormOpen(true);
  };

  const handleEdit = (medico: MedicoResponse) => {
    setSelectedMedico(medico);
    setIsFormOpen(true);
  };

  const handleManageExpediente = (medico: MedicoResponse) => {
    router.push(`/recursos-humanos/medicos/${medico.id}`);
  };

  const handleDelete = (medico: MedicoResponse) => {
    setSelectedMedico(medico);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Header with "+ Nuevo Médico" action */}
      <MedicoHeader onAddClick={handleAddClick} />

      {/* 2. Metrics Cards */}
      <MedicoMetricsCards metrics={metrics} />

      {/* 3. Outer Card Container (Search, Mode Toggles, Filter Pills, List/Grid/Table, Pagination) */}
      <MedicoCardList
        medicos={medicos}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onEdit={handleEdit}
        onManageExpediente={handleManageExpediente}
        onDelete={handleDelete}
        onRefresh={refetch}
      />

      {/* Modals */}
      <MedicoFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        medicoToEdit={selectedMedico}
      />

      <MedicoDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        medico={selectedMedico}
      />
    </div>
  );
}
