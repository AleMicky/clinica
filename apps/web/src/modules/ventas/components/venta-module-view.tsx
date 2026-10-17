"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { VentaHeader } from "./venta-header";
import { VentaMetricsCards } from "./venta-metrics";
import { VentaList } from "./venta-list";
import { VentaFormDialog } from "./venta-form-dialog";
import { VentaDetailSheet } from "./venta-detail-sheet";
import { VentaDetailCard } from "./venta-detail-card";
import { VentaStatusDialog } from "./venta-status-dialog";
import { VentaEnviarCajaDialog } from "./venta-enviar-caja-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";

import {
  useAnularVenta,
  useCambiarEstadoVenta,
  useVentaMetrics,
  useVentas,
} from "../hooks/use-ventas";
import {
  EstadoVenta,
  EstadoVentaLabels,
  type VentaMetrics,
  type VentaResponse,
} from "../types/ventas.types";

function extractErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

function getTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function VentaModuleView() {
  // Modal State: Form Nueva Venta
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);

  // Modal State: Ficha Detalle Venta
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVentaId, setSelectedVentaId] = React.useState<number | null>(null);

  // Modal State: Enviar Venta a Caja
  const [enviarCajaDialogOpen, setEnviarCajaDialogOpen] = React.useState(false);
  const [selectedVentaForEnviarCaja, setSelectedVentaForEnviarCaja] =
    React.useState<VentaResponse | null>(null);

  // Modal State: Cambiar Estado con Formulario
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedVentaForStatus, setSelectedVentaForStatus] =
    React.useState<VentaResponse | null>(null);

  // Modal State: Anular Venta
  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [ventaToAnularId, setVentaToAnularId] = React.useState<number | null>(null);

  // Filters & Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<EstadoVenta>(
    EstadoVenta.Pendiente
  );
  // Rango de fecha por defecto: el día de hoy
  const [fechaDesde, setFechaDesde] = React.useState<string>(getTodayIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);

  // Debounce para evitar peticiones innecesarias en cada pulsación del buscador
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 350);

  // React Query Fetch para la lista filtrada
  const {
    data: apiData,
    isLoading,
    isRefetching,
    refetch,
  } = useVentas({
    pageNumber: currentPage,
    pageSize: pageSize,
    search: debouncedSearchTerm || undefined,
    estado: selectedEstadoTab,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  // Fetch para métricas globales desde el backend sincronizadas con el rango de fecha
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useVentaMetrics({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    search: debouncedSearchTerm || undefined,
  });

  const cambiarEstadoMutation = useCambiarEstadoVenta();
  const anularMutation = useAnularVenta();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleEstadoTabChange = (tab: EstadoVenta) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (desde: string, hasta: string) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setCurrentPage(1);
  };

  const handleFechaDesdeChange = (val: string) => {
    setFechaDesde(val);
    setCurrentPage(1);
  };

  const handleFechaHastaChange = (val: string) => {
    setFechaHasta(val);
    setCurrentPage(1);
  };

  const ventas: VentaResponse[] = React.useMemo(
    () => apiData?.items ?? [],
    [apiData?.items]
  );

  // Métricas obtenidas directamente de la base de datos a través de la API
  const metrics: VentaMetrics = React.useMemo(() => {
    return (
      metricsData ?? {
        totalVentas: 0,
        pendientes: 0,
        pendientesCobro: 0,
        pagadas: 0,
        anuladas: 0,
        montoTotal: 0,
        montoCobrado: 0,
        montoPorCobrar: 0,
        subtotalBruto: 0,
        totalDescuentos: 0,
        ticketPromedio: 0,
      }
    );
  }, [metricsData]);

  // Auto-seleccionar la venta para la vista Master-Detail en pantallas grandes
  const selectedVentaForDetail = React.useMemo(() => {
    if (ventas.length === 0) return null;
    if (selectedVentaId !== null) {
      const found = ventas.find((v) => v.id === selectedVentaId);
      if (found) return found;
    }
    return ventas[0] ?? null;
  }, [ventas, selectedVentaId]);

  // Handlers
  const handleOpenAdd = () => {
    setFormDialogOpen(true);
  };

  const handleViewDetail = (venta: VentaResponse) => {
    setSelectedVentaId(venta.id);
    // En móviles/tablets (ancho menor a breakpoint lg: 1024px) abre el panel sheet deslizable
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setDetailSheetOpen(true);
    }
  };

  const handleOpenEnviarCaja = (venta: VentaResponse) => {
    setSelectedVentaForEnviarCaja(venta);
    setEnviarCajaDialogOpen(true);
  };

  const handleConfirmEnviarCaja = async (cajaId: number, motivo?: string) => {
    if (!selectedVentaForEnviarCaja) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedVentaForEnviarCaja.id,
        data: {
          estadoDestino: EstadoVenta.PendienteCobro,
          cajaId,
          motivo: motivo || "Venta enviada a caja para cobro",
        },
      });
      toast.success(
        `Venta #${selectedVentaForEnviarCaja.numero} enviada a caja exitosamente.`
      );
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "No se pudo enviar la venta a caja."));
      throw error;
    }
  };

  const handleOpenStatusDialog = (venta: VentaResponse) => {
    setSelectedVentaForStatus(venta);
    setStatusDialogOpen(true);
  };

  const handleOpenAnular = (id: number) => {
    setVentaToAnularId(id);
    setAnularDialogOpen(true);
  };

  const handleConfirmStatusChange = async (
    targetEstado: EstadoVenta,
    motivo?: string,
    cajaId?: number
  ) => {
    if (!selectedVentaForStatus) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedVentaForStatus.id,
        data: {
          estadoDestino: targetEstado,
          cajaId,
          motivo: motivo || `Cambio de estado a ${EstadoVentaLabels[targetEstado]}`,
        },
      });
      toast.success(
        `Estado de la venta #${selectedVentaForStatus.numero} actualizado.`
      );
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "No se pudo actualizar el estado de la venta."));
      throw error;
    }
  };

  const handleConfirmAnular = async () => {
    if (!ventaToAnularId) return;

    try {
      await anularMutation.mutateAsync(ventaToAnularId);
      toast.success("Comprobante de venta anulado correctamente.");
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Ocurrió un error al anular el comprobante de venta."));
    } finally {
      setVentaToAnularId(null);
      setAnularDialogOpen(false);
    }
  };

  let periodLabel = "período";
  if (fechaDesde === getTodayIso() && fechaHasta === getTodayIso()) {
    periodLabel = "hoy";
  } else if (!fechaDesde && !fechaHasta) {
    periodLabel = "histórico";
  }

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <VentaHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => {
          void refetch();
          void refetchMetrics();
        }}
        isRefreshing={isRefetching}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onDateRangeChange={handleDateRangeChange}
        onFechaDesdeChange={handleFechaDesdeChange}
        onFechaHastaChange={handleFechaHastaChange}
      />

      {/* Tarjetas de Métricas */}
      <VentaMetricsCards
        metrics={metrics}
        isLoading={isMetricsLoading}
        periodLabel={periodLabel}
      />

      {/* CUERPO PRINCIPAL: MASTER - DETAIL SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* PANEL IZQUIERDO: MASTER LIST (7 Columnas) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-2.5">
          <VentaList
            ventas={ventas}
            isLoading={isLoading}
            totalItems={apiData?.totalItems ?? ventas.length}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            selectedEstadoTab={selectedEstadoTab}
            selectedVentaId={selectedVentaForDetail?.id ?? null}
            onEstadoTabChange={handleEstadoTabChange}
            onSearchChange={handleSearchChange}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            onViewDetail={handleViewDetail}
            onRefresh={() => refetch()}
          />
        </div>

        {/* PANEL DERECHO: DETAIL CARD (5 Columnas - Sticky en Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-4 space-y-2.5">
          <VentaDetailCard
            venta={selectedVentaForDetail}
            onEnviarACajaClick={handleOpenEnviarCaja}
            onChangeStatusClick={handleOpenStatusDialog}
            onAnularClick={handleOpenAnular}
          />
        </div>
      </div>

      {/* Modal: Nueva Venta */}
      <VentaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccessCallback={() => refetch()}
      />

      {/* Sheet: Detalle Ficha Venta (Para Móvil o Pantallas Pequeñas) */}
      <VentaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        venta={selectedVentaForDetail}
        onEnviarACajaClick={handleOpenEnviarCaja}
        onChangeStatusClick={handleOpenStatusDialog}
        onAnularClick={handleOpenAnular}
      />

      {/* Modal: Enviar Venta a Caja */}
      <VentaEnviarCajaDialog
        open={enviarCajaDialogOpen}
        onOpenChange={setEnviarCajaDialogOpen}
        venta={selectedVentaForEnviarCaja}
        onConfirm={handleConfirmEnviarCaja}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Modal: Cambiar Estado con Formulario */}
      <VentaStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        venta={selectedVentaForStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={cambiarEstadoMutation.isPending}
      />


      {/* Modal: Confirmación de Anulación */}
      <ConfirmDeleteDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        onConfirm={handleConfirmAnular}
        title="¿Anular este comprobante de venta?"
        description="Esta acción cambiará el estado de la venta a Anulada y cancelará las asignaciones de pagadores. ¿Desea continuar?"
        isLoading={anularMutation.isPending}
      />
    </div>
  );
}
