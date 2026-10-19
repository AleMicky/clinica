"use client";

import * as React from "react";
import {
  AlertTriangle,
  AlertOctagon,
  CalendarX,
  Clock,
  Warehouse,
  Package,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDate } from "@/lib/utils";
import { useAlertasStock } from "../hooks/use-alertas-stock";
import type {
  AlertaStockResponse,
  TipoAlertaStock,
} from "../types/alerta-stock.types";

interface AlertasStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAlmacenId?: number | null;
  onSelectExistencia?: (almacenId: number, productoId: number) => void;
}

export function AlertasStockDialog({
  open,
  onOpenChange,
  selectedAlmacenId,
  onSelectExistencia,
}: AlertasStockDialogProps) {
  const [activeTab, setActiveTab] = React.useState<string>("todas");
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    data: alerts = [],
    isLoading,
    refetch,
    isFetching,
  } = useAlertasStock(
    open
      ? {
          almacenId: selectedAlmacenId ?? undefined,
        }
      : undefined,
    { enabled: open }
  );

  // Filtered by tab and search
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((item) => {
      // Tab filter
      if (activeTab === "sin-stock" && item.tipoAlerta !== "SinStock") return false;
      if (activeTab === "stock-bajo" && item.tipoAlerta !== "StockBajo") return false;
      if (activeTab === "por-vencer" && item.tipoAlerta !== "ProximoVencer") return false;
      if (activeTab === "vencidos" && item.tipoAlerta !== "Vencido") return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCode = item.productoCodigo?.toLowerCase().includes(term);
        const matchName = item.productoNombre?.toLowerCase().includes(term);
        const matchLote = item.lote?.toLowerCase().includes(term);
        const matchAlm = item.almacenNombre?.toLowerCase().includes(term);
        if (!matchCode && !matchName && !matchLote && !matchAlm) return false;
      }

      return true;
    });
  }, [alerts, activeTab, searchTerm]);

  // Counts
  const countSinStock = alerts.filter((a) => a.tipoAlerta === "SinStock").length;
  const countStockBajo = alerts.filter((a) => a.tipoAlerta === "StockBajo").length;
  const countPorVencer = alerts.filter((a) => a.tipoAlerta === "ProximoVencer").length;
  const countVencido = alerts.filter((a) => a.tipoAlerta === "Vencido").length;

  const getSeverityBadge = (severidad: string, tipo: TipoAlertaStock) => {
    switch (tipo) {
      case "Vencido":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1"
          >
            <CalendarX className="size-2.5" /> Vencido
          </Badge>
        );
      case "SinStock":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 gap-1"
          >
            <AlertOctagon className="size-2.5" /> Sin Stock
          </Badge>
        );
      case "StockBajo":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
          >
            <AlertTriangle className="size-2.5" /> Stock Bajo
          </Badge>
        );
      case "ProximoVencer":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1"
          >
            <Clock className="size-2.5" /> Por Vencer
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-5 max-h-[90vh] flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Monitor de Alertas de Stock y Caducidad</span>
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2 text-foreground"
                  >
                    {alerts.length} alertas detectadas
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Identifica productos en punto de reorden, desabastecidos o con partidas próximas a vencer.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="size-8 shrink-0 border-border/60"
              title="Refrescar alertas"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            <button
              onClick={() => setActiveTab("sin-stock")}
              className={cn(
                "p-2 rounded-lg border text-left transition-colors cursor-pointer",
                activeTab === "sin-stock"
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-muted/30 border-border/60 hover:bg-muted/50"
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Sin Stock (Agotados)
              </div>
              <div className="font-mono text-base font-bold text-red-600 dark:text-red-400">
                {countSinStock}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("stock-bajo")}
              className={cn(
                "p-2 rounded-lg border text-left transition-colors cursor-pointer",
                activeTab === "stock-bajo"
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-muted/30 border-border/60 hover:bg-muted/50"
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Stock Bajo (Reorden)
              </div>
              <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                {countStockBajo}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("por-vencer")}
              className={cn(
                "p-2 rounded-lg border text-left transition-colors cursor-pointer",
                activeTab === "por-vencer"
                  ? "bg-orange-500/10 border-orange-500/40"
                  : "bg-muted/30 border-border/60 hover:bg-muted/50"
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Próximos a Vencer
              </div>
              <div className="font-mono text-base font-bold text-orange-600 dark:text-orange-400">
                {countPorVencer}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("vencidos")}
              className={cn(
                "p-2 rounded-lg border text-left transition-colors cursor-pointer",
                activeTab === "vencidos"
                  ? "bg-rose-500/10 border-rose-500/40"
                  : "bg-muted/30 border-border/60 hover:bg-muted/50"
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Lotes Vencidos
              </div>
              <div className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                {countVencido}
              </div>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-7 p-0.5 bg-muted/60">
                <TabsTrigger value="todas" className="text-xs px-2.5 h-6">
                  Todas ({alerts.length})
                </TabsTrigger>
                <TabsTrigger value="sin-stock" className="text-xs px-2.5 h-6">
                  Sin Stock ({countSinStock})
                </TabsTrigger>
                <TabsTrigger value="stock-bajo" className="text-xs px-2.5 h-6">
                  Bajo ({countStockBajo})
                </TabsTrigger>
                <TabsTrigger value="por-vencer" className="text-xs px-2.5 h-6">
                  Por Vencer ({countPorVencer})
                </TabsTrigger>
                <TabsTrigger value="vencidos" className="text-xs px-2.5 h-6">
                  Vencidos ({countVencido})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar por producto o lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-7 bg-background"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Consultando reglas de alerta de stock...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No se encontraron alertas en esta categoría
              </p>
              <p className="text-[11px] text-muted-foreground">
                Todos los productos cumplen con los niveles mínimos y vigencia de lote.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAlerts.map((alerta, idx) => (
                <div
                  key={`${alerta.productoId}-${alerta.almacenId}-${alerta.lote || idx}`}
                  className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="pt-0.5">
                      {getSeverityBadge(alerta.severidad, alerta.tipoAlerta)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {alerta.productoCodigo}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {alerta.productoNombre}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Warehouse className="size-3" />
                          {alerta.almacenNombre}
                        </span>
                        {alerta.lote && (
                          <span className="flex items-center gap-1 font-mono text-foreground font-medium">
                            <Layers className="size-3 text-primary" />
                            Lote: {alerta.lote}
                          </span>
                        )}
                        {alerta.fechaVencimiento && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            Vence: {formatDate(alerta.fechaVencimiento)}
                            {alerta.diasParaVencer !== undefined && alerta.diasParaVencer !== null && (
                              <span className={alerta.diasParaVencer <= 0 ? "text-rose-600 font-semibold" : "text-orange-600 font-medium"}>
                                ({alerta.diasParaVencer <= 0 ? "Venció hace " + Math.abs(alerta.diasParaVencer) + " d" : "En " + alerta.diasParaVencer + " d"})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/90 mt-1 italic">
                        {alerta.mensaje}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Stock Actual
                      </div>
                      <div className="font-mono text-xs font-bold text-foreground">
                        {alerta.stockActual.toLocaleString()}
                        {alerta.stockMinimo !== undefined && alerta.stockMinimo !== null && (
                          <span className="text-[10px] text-muted-foreground font-normal ml-1">
                            / Min: {alerta.stockMinimo}
                          </span>
                        )}
                      </div>
                    </div>

                    {onSelectExistencia && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onSelectExistencia(alerta.almacenId, alerta.productoId);
                          onOpenChange(false);
                        }}
                        className="h-7 text-xs px-2.5 cursor-pointer"
                      >
                        Ver Stock
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
