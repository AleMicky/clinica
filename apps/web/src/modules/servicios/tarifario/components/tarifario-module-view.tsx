"use client";

import * as React from "react";
import { TarifarioHeader } from "./tarifario-header";
import { TarifarioMetricsCards } from "./tarifario-metrics";
import { TarifarioTable } from "./tarifario-table";
import { TarifarioFormDialog } from "./tarifario-form-dialog";
import { TarifarioDetallesDialog } from "./tarifario-detalles-dialog";
import { TarifarioDeleteDialog } from "./tarifario-delete-dialog";
import { useTarifarios } from "../hooks/use-tarifario";
import { useMonedas, type MonedaResponse } from "@/modules/parametros/moneda";
import type { TarifarioItem, TarifarioMetrics, TarifarioResponse } from "../types/tarifario.types";

export function TarifarioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [tarifarioToEdit, setTarifarioToEdit] = React.useState<TarifarioItem | null>(null);

  const [detallesDialogOpen, setDetallesDialogOpen] = React.useState(false);
  const [tarifarioForDetalles, setTarifarioForDetalles] = React.useState<TarifarioItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tarifarioToDelete, setTarifarioToDelete] = React.useState<TarifarioItem | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const monedasMap = React.useMemo(() => {
    const map = new Map<number, string>();
    (monedasData?.items || []).forEach((m: MonedaResponse) => {
      map.set(m.id, `${m.codigo} (${m.simbolo})`);
    });
    return map;
  }, [monedasData]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useTarifarios({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const tarifarios: TarifarioItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item: TarifarioResponse) => ({
      ...item,
      monedaNombre: monedasMap.get(item.monedaId) || `ID ${item.monedaId}`,
    }));
  }, [apiData, monedasMap]);

  const metrics: TarifarioMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    const principales = rawItems.filter((t: TarifarioResponse) => t.esPrincipal).length;
    const vigentes = rawItems.filter((t: TarifarioResponse) => {
      if (!t.fechaFin) return true;
      return new Date(t.fechaFin) >= new Date();
    }).length;

    return {
      totalTarifarios: apiData?.totalItems ?? rawItems.length,
      principalesCount: principales,
      vigentesCount: vigentes,
    };
  }, [apiData]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setTarifarioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (t: TarifarioItem) => {
    setTarifarioToEdit(t);
    setFormDialogOpen(true);
  };

  const handleOpenManagePrices = (t: TarifarioItem) => {
    setTarifarioForDetalles(t);
    setDetallesDialogOpen(true);
  };

  const handleOpenDelete = (t: TarifarioItem) => {
    setTarifarioToDelete(t);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <TarifarioHeader onAddClick={handleOpenAdd} />
      <TarifarioMetricsCards metrics={metrics} />
      <TarifarioTable
        tarifarios={tarifarios}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onManagePrices={handleOpenManagePrices}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <TarifarioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tarifarioToEdit={tarifarioToEdit}
        onSuccessCallback={() => refetch()}
      />
      <TarifarioDetallesDialog
        open={detallesDialogOpen}
        onOpenChange={setDetallesDialogOpen}
        tarifario={tarifarioForDetalles}
      />
      <TarifarioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tarifarioToDelete={tarifarioToDelete}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
