"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CargoHeader } from "./cargo-header";
import { CargoMetricsCards, type CargoMetrics } from "./cargo-metrics";
import { CargoList } from "./cargo-list";
import { CargoDeleteDialog } from "./cargo-delete-dialog";
import { useDeleteCargo, useCargos } from "../hooks/use-cargos";
import type { CargoResponse } from "../types/cargo.types";

export function CargoModuleView() {
  const router = useRouter();

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [cargoToDelete, setCargoToDelete] = React.useState<CargoResponse | null>(null);

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
  } = useCargos({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteCargo();

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

  const allCargos: CargoResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredCargos = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allCargos.filter((c) => c.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allCargos.filter((c) => !c.activo);
    }
    return allCargos;
  }, [allCargos, selectedStatusTab]);

  // Compute Metrics
  const total = apiData?.totalItems ?? allCargos.length;
  const activos = allCargos.filter((c) => c.activo).length;
  const inactivos = allCargos.filter((c) => !c.activo).length;

  const metrics: CargoMetrics = {
    total,
    activos,
    inactivos,
  };

  const handleOpenAdd = () => {
    router.push("/recursos-humanos/cargos/nuevo");
  };

  const handleOpenEdit = (cargo: CargoResponse) => {
    router.push(`/recursos-humanos/cargos/${cargo.id}/editar`);
  };

  const handleOpenDelete = (cargo: CargoResponse) => {
    setCargoToDelete(cargo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cargoToDelete) return;

    try {
      await deleteMutation.mutateAsync(cargoToDelete.id);
      toast.success(`Cargo "${cargoToDelete.nombre}" eliminado correctamente.`);
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar el cargo.");
    } finally {
      setCargoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <CargoHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <CargoMetricsCards metrics={metrics} />

      {/* Listado Principal de Cargos (Formato Lista igual a los demás módulos) */}
      <CargoList
        cargos={filteredCargos}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allCargos.length}
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
      <CargoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cargo={cargoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}