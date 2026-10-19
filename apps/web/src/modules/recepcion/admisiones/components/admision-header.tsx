"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdmisionHeaderProps {
  onAddClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdmisionHeader({
  onAddClick,
  onRefresh,
  isRefreshing = false,
}: Readonly<AdmisionHeaderProps>) {
  const router = useRouter();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      router.push("/recepcion/admisiones/nueva");
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-primary/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-foreground tracking-tight truncate">
              Admisión de Pacientes
            </h1>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full border border-primary/20 shrink-0">
              Recepción
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:inline truncate">
            Registro de ingresos, prestaciones médicas, control de pagos y atención clínica.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7.5 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={handleAddClick}
          className="h-7.5 px-3 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs shadow-primary/25 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Nueva Admisión
        </Button>
      </div>
    </div>
  );
}
