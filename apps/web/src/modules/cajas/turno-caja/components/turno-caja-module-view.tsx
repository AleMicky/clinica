"use client";

import * as React from "react";
import { useTurnosCaja } from "../hooks/use-turnos-caja";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";
import { TurnoCajaHeader } from "./turno-caja-header";
import { TurnoCajaMetrics } from "./turno-caja-metrics";
import { TurnoCajaList } from "./turno-caja-list";
import { TurnoCajaFormDialog } from "./turno-caja-form-dialog";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";

export function TurnoCajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ABIERTOS" | "CERRADOS"
  >("TODOS");
  const [selectedCajaFilter, setSelectedCajaFilter] =
    React.useState<string>("ALL");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"open" | "close">("open");
  const [turnoToClose, setTurnoToClose] =
    React.useState<TurnoCajaResponse | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: turnosData,
    isLoading: isLoadingTurnos,
    refetch,
  } = useTurnosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    cajaId: selectedCajaFilter !== "ALL" ? Number(selectedCajaFilter) : undefined,
  });

  const { data: cajasData } = useCajas({ page: 1, pageSize: 100 });

  const turnosList: TurnoCajaResponse[] = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? (turnosData as unknown as TurnoCajaResponse[])
      : [];
  }, [turnosData]);

  const cajasList: CajaResponse[] = React.useMemo(() => {
    return Array.isArray(cajasData?.items)
      ? cajasData.items
      : Array.isArray(cajasData)
      ? (cajasData as unknown as CajaResponse[])
      : [];
  }, [cajasData]);

  const totalItems = turnosData?.totalItems ?? turnosList.length;

  // Filtrado local por estado
  const filteredTurnos = React.useMemo(() => {
    return turnosList.filter((turno) => {
      if (selectedStatusTab === "ABIERTOS") {
        return turno.estado === EstadoTurnoCaja.Abierto;
      }
      if (selectedStatusTab === "CERRADOS") {
        return turno.estado === EstadoTurnoCaja.Cerrado;
      }
      return true;
    });
  }, [turnosList, selectedStatusTab]);

  // Contadores para Métricas
  const metrics = React.useMemo(() => {
    let abiertos = 0;
    let cerrados = 0;

    turnosList.forEach((t) => {
      if (t.estado === EstadoTurnoCaja.Abierto) abiertos++;
      else if (t.estado === EstadoTurnoCaja.Cerrado) cerrados++;
    });

    return {
      totalTurnos: totalItems,
      turnosAbiertos: abiertos,
      turnosCerrados: cerrados,
    };
  }, [turnosList, totalItems]);

  const handleOpenCreateModal = () => {
    setTurnoToClose(null);
    setFormMode("open");
    setFormDialogOpen(true);
  };

  const handleCloseTurno = (turno: TurnoCajaResponse) => {
    setTurnoToClose(turno);
    setFormMode("close");
    setFormDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <TurnoCajaHeader onNewTurnoClick={handleOpenCreateModal} />

      <TurnoCajaMetrics
        metrics={metrics}
        selectedFilter={selectedStatusTab}
        onFilterChange={(f: "TODOS" | "ABIERTOS" | "CERRADOS") => {
          setSelectedStatusTab(f);
          setCurrentPage(1);
        }}
      />

      <TurnoCajaList
        turnos={filteredTurnos}
        cajas={cajasList}
        counts={{
          total: totalItems,
          abiertos: metrics.turnosAbiertos,
          cerrados: metrics.turnosCerrados,
        }}
        isLoading={isLoadingTurnos}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        selectedCajaFilter={selectedCajaFilter}
        onStatusTabChange={(tab) => {
          setSelectedStatusTab(tab);
          setCurrentPage(1);
        }}
        onCajaFilterChange={(cajaId) => {
          setSelectedCajaFilter(cajaId);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onCloseTurno={handleCloseTurno}
        onNewTurnoClick={handleOpenCreateModal}
        onRefresh={() => refetch()}
      />

      <TurnoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        turnoToClose={turnoToClose}
        mode={formMode}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
