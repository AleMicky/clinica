"use client";

import Link from "next/link";
import { Plus, ArrowLeftRight, RefreshCw, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface MovimientoCajaHeaderProps {
  onNewMovimientoClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function MovimientoCajaHeader({
  onNewMovimientoClick,
  onRefresh,
  isRefreshing = false,
}: Readonly<MovimientoCajaHeaderProps>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Movimientos de Caja
            </h1>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              Operaciones de Efectivo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro y control de ingresos, egresos, retiros y ajustes en efectivo (Bs.).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={ROUTES.CAJA.REPORTES_MOVIMIENTOS}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 px-2.5 text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20 shrink-0"
          )}
          title="Ver reportes y analítica de movimientos de caja"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span className="hidden sm:inline">Reportes</span>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 text-xs px-3 shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>

        <Button
          onClick={onNewMovimientoClick}
          size="sm"
          className="h-9 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Movimiento</span>
        </Button>
      </div>
    </div>
  );
}
