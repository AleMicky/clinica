"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Filter,
  RefreshCw,
  Search,
  X,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

import {
  useAdmisiones,
  useExportarAdmisionesExcel,
  useOpenAdmisionPdf,
} from "../hooks/use-admisiones";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  formatRecepcionistaNombre,
  type AdmisionResponse,
  type ExportarAdmisionesQueryParams,
} from "../types/admision.types";
import { AdmisionStatusBadge } from "./admision-status-badge";
import { AdmisionDetailSheet } from "./admision-detail-sheet";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const getTodayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getYesterdayIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getStartOfWeekIso = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
};

const getStartOfMonthIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const getThirtyDaysAgoIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function AdmisionReporteView() {
  // ---------------------------------------------------------------------------
  // Filters State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [fechaDesde, setFechaDesde] = React.useState<string>(getStartOfMonthIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);
  const [selectedEstado, setSelectedEstado] = React.useState<string>("TODOS");
  const [selectedConvenioId, setSelectedConvenioId] = React.useState<string>("TODOS");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  // Selected admission for detail sheet
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedAdmision, setSelectedAdmision] = React.useState<AdmisionResponse | null>(null);

  // Convenios for selector
  const { data: conveniosData } = useConvenios({ pageSize: 200 });
  const convenios = React.useMemo(() => conveniosData?.items ?? [], [conveniosData]);

  // Mutations
  const exportMutation = useExportarAdmisionesExcel();
  const openPdfMutation = useOpenAdmisionPdf();

  // ---------------------------------------------------------------------------
  // Parsed Filters
  // ---------------------------------------------------------------------------
  const parsedEstado = React.useMemo(() => {
    if (selectedEstado === "TODOS") return undefined;
    const num = Number(selectedEstado);
    return Number.isNaN(num) ? undefined : (num as EstadoAdmision);
  }, [selectedEstado]);

  const parsedConvenioId = React.useMemo(() => {
    if (selectedConvenioId === "TODOS") return undefined;
    if (selectedConvenioId === "PARTICULAR") return undefined;
    const num = Number(selectedConvenioId);
    return Number.isNaN(num) ? undefined : num;
  }, [selectedConvenioId]);

  // Query Params
  const queryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      estado: parsedEstado,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      convenioId: parsedConvenioId,
    }),
    [page, pageSize, debouncedSearch, parsedEstado, fechaDesde, fechaHasta, parsedConvenioId]
  );

  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useAdmisiones(queryParams);

  const items = React.useMemo(() => apiData?.items ?? [], [apiData]);
  const totalItems = apiData?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // ---------------------------------------------------------------------------
  // Metrics & Analytics Calculation from Current Filtered Page / Dataset
  // ---------------------------------------------------------------------------
  const metrics = React.useMemo(() => {
    let totalImporte = 0;
    let registradasCount = 0;
    let confirmadasCount = 0;
    let enviadasVentaCount = 0;
    let canceladasCount = 0;

    items.forEach((adm) => {
      const rowTotal =
        adm.totalAdmision ??
        (adm.detalles ?? []).reduce(
          (acc, d) => acc + (d.total || (d.cantidad || 1) * (d.precioUnitario || 0) - (d.descuento || 0)),
          0
        );
      totalImporte += rowTotal;

      if (adm.estado === EstadoAdmision.Registrada) registradasCount++;
      else if (adm.estado === EstadoAdmision.Confirmada) confirmadasCount++;
      else if (adm.estado === EstadoAdmision.EnviadaVenta) enviadasVentaCount++;
      else if (adm.estado === EstadoAdmision.Cancelada) canceladasCount++;
    });

    const efectivas = confirmadasCount + enviadasVentaCount;
    const tasaEfectividad = items.length > 0 ? ((efectivas / items.length) * 100).toFixed(1) : "0.0";

    return {
      totalEnPagina: items.length,
      totalImporte,
      registradasCount,
      confirmadasCount,
      enviadasVentaCount,
      canceladasCount,
      tasaEfectividad,
    };
  }, [items]);

  // Chart data: Distribution by Status
  const statusChartData = React.useMemo(() => {
    return [
      { name: "Registradas", cantidad: metrics.registradasCount, color: "#3B82F6" },
      { name: "Confirmadas", cantidad: metrics.confirmadasCount, color: "#10B981" },
      { name: "Enviadas Venta", cantidad: metrics.enviadasVentaCount, color: "#8B5CF6" },
      { name: "Canceladas", cantidad: metrics.canceladasCount, color: "#F43F5E" },
    ];
  }, [metrics]);

  // Chart data: Distribution by Convenio
  const convenioChartData = React.useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((adm) => {
      const name = adm.convenio?.nombre || "Particular";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [items]);

  const PIE_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4"];

  // ---------------------------------------------------------------------------
  // Filter Handlers
  // ---------------------------------------------------------------------------
  const handleClearFilters = () => {
    setSearchTerm("");
    setFechaDesde(getStartOfMonthIso());
    setFechaHasta(getTodayIso());
    setSelectedEstado("TODOS");
    setSelectedConvenioId("TODOS");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedEstado !== "TODOS" ||
      selectedConvenioId !== "TODOS" ||
      fechaDesde !== getStartOfMonthIso() ||
      fechaHasta !== getTodayIso()
  );

  const applyPreset = (preset: "hoy" | "ayer" | "semana" | "mes" | "30dias" | "todo") => {
    const today = getTodayIso();
    setPage(1);
    switch (preset) {
      case "hoy":
        setFechaDesde(today);
        setFechaHasta(today);
        break;
      case "ayer": {
        const ayer = getYesterdayIso();
        setFechaDesde(ayer);
        setFechaHasta(ayer);
        break;
      }
      case "semana":
        setFechaDesde(getStartOfWeekIso());
        setFechaHasta(today);
        break;
      case "mes":
        setFechaDesde(getStartOfMonthIso());
        setFechaHasta(today);
        break;
      case "30dias":
        setFechaDesde(getThirtyDaysAgoIso());
        setFechaHasta(today);
        break;
      case "todo":
        setFechaDesde("");
        setFechaHasta("");
        break;
    }
  };

  // ---------------------------------------------------------------------------
  // Export to Excel Handler
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarAdmisionesQueryParams = {
        search: debouncedSearch.trim() || undefined,
        estado: parsedEstado,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        convenioId: parsedConvenioId,
      };

      toast.loading("Generando reporte oficial en Excel (.xlsx)...", { id: "export-excel" });

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      link.download = `Reporte_Admisiones_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("¡Reporte Excel descargado exitosamente!", {
        id: "export-excel",
        description: "El archivo contiene el desglose detallado de admisiones, pacientes y montos.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error("Error al exportar a Excel", {
        id: "export-excel",
        description: error.message || "No se pudo generar el archivo de reporte.",
      });
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8">
      {/* =========================================================================
          1. HEADER & TOP ACTIONS
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 p-4 sm:p-5 rounded-2xl border border-border/70 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <Link href={ROUTES.RECEPCION.ADMISIONES}>
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-xl border-border/80 hover:bg-accent cursor-pointer shrink-0"
              title="Volver a Admisiones"
            >
              <ArrowLeft className="size-4.5" />
            </Button>
          </Link>
          <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-2xs shrink-0">
            <FileSpreadsheet className="size-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Reporte de Admisiones y Prestaciones
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Auditoría & Analítica
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              Filtre por período, estado, cobertura médica y exporte los registros a Excel (.xlsx) con un clic.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-9 px-3 text-xs gap-1.5 border-border/80 hover:bg-accent transition-all cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", (isLoading || isFetching) && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={exportMutation.isPending || isLoading}
            className="h-9 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
          >
            <Download className={cn("size-4", exportMutation.isPending && "animate-bounce")} />
            <span>Exportar Excel (.xlsx)</span>
            {totalItems > 0 && (
              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          2. QUICK PRESETS & ADVANCED FILTER PANEL
         ========================================================================= */}
      <Card className="border border-border/70 bg-card shadow-2xs">
        <CardContent className="p-4 space-y-3.5">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-border/40 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Calendar className="size-3 text-primary" /> Período rápido:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("hoy")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-lg cursor-pointer",
                fechaDesde === getTodayIso() && fechaHasta === getTodayIso() && "bg-primary/10 text-primary border-primary/30 font-semibold"
              )}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("ayer")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-lg cursor-pointer",
                fechaDesde === getYesterdayIso() && fechaHasta === getYesterdayIso() && "bg-primary/10 text-primary border-primary/30 font-semibold"
              )}
            >
              Ayer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("semana")}
              className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              Esta Semana
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("mes")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-lg cursor-pointer",
                fechaDesde === getStartOfMonthIso() && fechaHasta === getTodayIso() && "bg-primary/10 text-primary border-primary/30 font-semibold"
              )}
            >
              Este Mes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("30dias")}
              className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              Últimos 30 días
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("todo")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-lg cursor-pointer",
                !fechaDesde && !fechaHasta && "bg-primary/10 text-primary border-primary/30 font-semibold"
              )}
            >
              Todo el Historial
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 ml-auto gap-1 cursor-pointer"
              >
                <X className="size-3" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Form Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            {/* Search Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Search className="size-3" /> Búsqueda General
              </Label>
              <div className="relative">
                <Input
                  placeholder="N° admisión, paciente, DNI, HC..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="h-8.5 text-xs pl-8 pr-7"
                />
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Fecha Desde */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Fecha Desde</Label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 text-xs"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Fecha Hasta</Label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 text-xs"
              />
            </div>

            {/* Estado Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
              <Select
                value={selectedEstado}
                onValueChange={(val) => {
                  setSelectedEstado(val || "TODOS");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs w-full">
                  <SelectValue placeholder="Todos los Estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los Estados</SelectItem>
                  <SelectItem value={String(EstadoAdmision.Registrada)}>Registrada</SelectItem>
                  <SelectItem value={String(EstadoAdmision.Confirmada)}>Confirmada</SelectItem>
                  <SelectItem value={String(EstadoAdmision.EnviadaVenta)}>Enviada a Venta</SelectItem>
                  <SelectItem value={String(EstadoAdmision.Cancelada)}>Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Convenio / Cobertura */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Convenio / Seguro</Label>
              <Select
                value={selectedConvenioId}
                onValueChange={(val) => {
                  setSelectedConvenioId(val || "TODOS");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs w-full">
                  <SelectValue placeholder="Todas las Coberturas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas las Coberturas</SelectItem>
                  {convenios.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          3. STAT CARDS / ANALYTICS SUMMARY
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Admisiones */}
        <Card className="border border-border/70 bg-card hover:border-primary/30 transition-all shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Registros
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {totalItems}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  en el filtro
                </span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Monto Acumulado en Página */}
        <Card className="border border-border/70 bg-card hover:border-emerald-500/30 transition-all shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Facturado / Estimado
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  S/. {metrics.totalImporte.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <CreditCard className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tasa de Efectividad */}
        <Card className="border border-border/70 bg-card hover:border-purple-500/30 transition-all shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Efectividad / Cierre
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {metrics.tasaEfectividad}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  confirmadas o en venta
                </span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Desglose Rápido de Estados */}
        <Card className="border border-border/70 bg-card shadow-2xs">
          <CardContent className="p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Desglose en Vista
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div className="flex items-center justify-between px-2 py-0.5 rounded bg-blue-500/5 text-blue-600 dark:text-blue-400 font-medium">
                <span>Registradas:</span>
                <span className="font-bold">{metrics.registradasCount}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Confirmadas:</span>
                <span className="font-bold">{metrics.confirmadasCount}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-0.5 rounded bg-purple-500/5 text-purple-600 dark:text-purple-400 font-medium">
                <span>En Venta:</span>
                <span className="font-bold">{metrics.enviadasVentaCount}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-0.5 rounded bg-rose-500/5 text-rose-600 dark:text-rose-400 font-medium">
                <span>Canceladas:</span>
                <span className="font-bold">{metrics.canceladasCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          4. CHARTS / VISUAL BREAKDOWN (COLLAPSIBLE / COMPACT)
         ========================================================================= */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart 1: Distribución por Estado */}
          <Card className="border border-border/70 bg-card shadow-2xs lg:col-span-2">
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  <CardTitle className="text-xs font-bold text-foreground">
                    Volumen de Admisiones por Estado (Página actual)
                  </CardTitle>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Muestra {items.length} registros
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-4">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Top Coberturas / Convenios */}
          <Card className="border border-border/70 bg-card shadow-2xs">
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-xs font-bold text-foreground">
                  Top Coberturas Médicas
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-4">
              {convenioChartData.length > 0 ? (
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={convenioChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={55}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${(name ?? "Particular").slice(0, 8)} (${(((percent ?? 0) * 100)).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {convenioChartData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
                  Sin suficientes datos para graficar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          5. INTERACTIVE DATA TABLE PREVIEW
         ========================================================================= */}
      <Card className="border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Vista Previa de Registros
            </h2>
            <Badge variant="outline" className="text-[10px] font-semibold bg-background">
              {totalItems} encontrados
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground text-[11px]">Filas por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 text-xs w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-28 text-xs font-semibold">N° Admisión</TableHead>
                <TableHead className="w-36 text-xs font-semibold">Fecha y Hora</TableHead>
                <TableHead className="min-w-48 text-xs font-semibold">Paciente & HC</TableHead>
                <TableHead className="min-w-36 text-xs font-semibold">Convenio / Seguro</TableHead>
                <TableHead className="min-w-44 text-xs font-semibold">Servicios Solicitados</TableHead>
                <TableHead className="w-28 text-xs font-semibold text-right">Total (S/.)</TableHead>
                <TableHead className="w-28 text-xs font-semibold text-center">Estado</TableHead>
                <TableHead className="w-28 text-xs font-semibold text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-7 w-16 mx-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-1">
                        <FileSpreadsheet className="size-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        No se encontraron admisiones
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        No existen registros que coincidan con el rango de fechas o los filtros seleccionados.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="mt-2 text-xs"
                        >
                          Restablecer todos los filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((adm) => {
                  const pacienteNombre = formatPacienteNombre(adm.paciente, adm.pacienteNombre || undefined);
                  const pacienteDoc = formatPacienteDocumento(adm.paciente, adm.pacienteDocumento || undefined);
                  const convenioNombre = formatConvenioNombre(adm.convenio, adm.convenioNombre);
                  const hcNumero =
                    adm.paciente && "numeroHistoriaClinica" in adm.paciente
                      ? adm.paciente.numeroHistoriaClinica
                      : "HC-S/N";

                  const totalCalculado =
                    adm.totalAdmision ??
                    (adm.detalles ?? []).reduce(
                      (acc, d) =>
                        acc +
                        (d.total || (d.cantidad || 1) * (d.precioUnitario || 0) - (d.descuento || 0)),
                      0
                    );

                  const serviciosResumen =
                    adm.detalles && adm.detalles.length > 0
                      ? adm.detalles.map((d) => d.servicio?.nombre || d.servicioNombre || "Servicio").join(", ")
                      : "Sin servicios registrados";

                  return (
                    <TableRow
                      key={adm.id}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* N° Admisión */}
                      <TableCell className="font-semibold text-xs text-foreground">
                        <span className="font-mono text-primary font-bold">
                          {adm.numero}
                        </span>
                      </TableCell>

                      {/* Fecha y Hora */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {new Date(adm.fechaHora).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(adm.fechaHora).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Paciente & HC */}
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground line-clamp-1">
                            {pacienteNombre}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-mono text-[10px] bg-muted px-1 rounded">
                              {hcNumero}
                            </span>
                            <span>&bull;</span>
                            <span>{pacienteDoc}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Convenio */}
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium border-border/80",
                            adm.convenio ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {convenioNombre}
                        </Badge>
                      </TableCell>

                      {/* Servicios */}
                      <TableCell className="text-xs max-w-56">
                        <p className="line-clamp-2 text-muted-foreground text-[11px]" title={serviciosResumen}>
                          {serviciosResumen}
                        </p>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="text-xs text-right font-bold font-mono text-foreground">
                        S/. {totalCalculado.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center">
                        <AdmisionStatusBadge estado={adm.estado} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmision(adm);
                              setDetailSheetOpen(true);
                            }}
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Ver Ficha Detallada"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPdfMutation.mutate(adm.id)}
                            className="size-7 text-muted-foreground hover:text-primary cursor-pointer"
                            title="Imprimir Ticket PDF"
                          >
                            <Printer className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-muted/10">
          <div className="text-muted-foreground text-[11px]">
            Mostrando {items.length} de {totalItems} admisiones
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <span className="text-muted-foreground text-[11px] mr-1">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || isLoading}
              className="size-7 cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || isLoading}
              className="size-7 cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          6. SLIDE-OVER DETAIL SHEET
         ========================================================================= */}
      <AdmisionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        admision={selectedAdmision}
      />
    </div>
  );
}
