"use client";

import * as React from "react";
import { toast } from "sonner";
import { TipoCambioHeader } from "./tipo-cambio-header";
import { TipoCambioMetricsCards } from "./tipo-cambio-metrics";
import { TipoCambioTable, type TipoCambioItem } from "./tipo-cambio-table";
import { TipoCambioFormDialog } from "./tipo-cambio-form-dialog";
import { TipoCambioDeleteDialog } from "./tipo-cambio-delete-dialog";
import {
  useTiposCambio,
  useDeleteTipoCambio,
} from "../hooks/use-tipos-cambio";
import { useMonedas } from "../../moneda/hooks/use-monedas";
import type { TipoCambioResponse } from "../types/tipo-cambio.types";

export function TipoCambioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [tipoCambioToEdit, setTipoCambioToEdit] = React.useState<
    TipoCambioResponse | TipoCambioItem | null
  >(null);

  // Delete AlertDialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<TipoCambioItem | null>(null);

  // Pagination & Search state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // React Query Hooks
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTiposCambio({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const deleteMutation = useDeleteTipoCambio();

  // Create a map of moneda ID -> Moneda object for fast lookup of currency codes
  const monedasMap = React.useMemo(() => {
    const map = new Map<number, any>();
    if (monedasData?.items) {
      monedasData.items.forEach((m) => map.set(m.id, m));
    }
    return map;
  }, [monedasData]);

  // Convert API response items to table items
  const tiposCambio: TipoCambioItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item) => ({
      id: item.id,
      monedaOrigenId: item.monedaOrigenId,
      monedaDestinoId: item.monedaDestinoId,
      monedaOrigenCodigo: monedasMap.get(item.monedaOrigenId)?.codigo,
      monedaDestinoCodigo: monedasMap.get(item.monedaDestinoId)?.codigo,
      compra: item.compra,
      venta: item.venta,
      fecha: item.fecha,
      activo: item.activo,
    }));
  }, [apiData, monedasMap]);

  const handleOpenAdd = () => {
    setTipoCambioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: TipoCambioItem) => {
    setTipoCambioToEdit(item);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = tiposCambio.find((t) => t.id === id);
    if (target) {
      setItemToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      toast.success("Registro de tipo de cambio eliminado correctamente.");
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al eliminar el registro de tipo de cambio."
      );
    } finally {
      setItemToDelete(null);
    }
  };

  // Compute metrics from real API dataset
  const latestRate = tiposCambio[0];

  const avgCompra = React.useMemo(() => {
    if (!tiposCambio || tiposCambio.length === 0) return "-";
    const sum = tiposCambio.reduce((acc, curr) => acc + curr.compra, 0);
    return (sum / tiposCambio.length).toFixed(4);
  }, [tiposCambio]);

  const ultimaTasa = latestRate ? latestRate.venta.toFixed(4) : "-";
  const parOriginal = latestRate
    ? `${latestRate.monedaOrigenCodigo || `ID:${latestRate.monedaOrigenId}`} → ${latestRate.monedaDestinoCodigo || `ID:${latestRate.monedaDestinoId}`}`
    : "Sin registros";
  const ultimaFecha = latestRate ? latestRate.fecha : "-";

  return (
    <div className="flex flex-col gap-6 p-6">
      <TipoCambioHeader
        onAddClick={handleOpenAdd}
        onRefreshClick={() => refetch()}
        isLoading={isLoading}
      />
      <TipoCambioMetricsCards
        ultimaTasa={ultimaTasa}
        parOriginal={parOriginal}
        tasaCompraPromedio={avgCompra}
        totalRegistros={apiData?.totalItems ?? 0}
        ultimaFecha={ultimaFecha}
        isLoading={isLoading}
      />
      <TipoCambioTable
        tiposCambio={tiposCambio}
        monedasMap={monedasMap}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as any)?.message}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        onPageSizeChange={(val) => {
          setPageSize(val);
          setCurrentPage(1);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <TipoCambioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tipoCambioToEdit={tipoCambioToEdit}
        onSuccessCallback={() => refetch()}
      />
      <TipoCambioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tipoCambio={itemToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
