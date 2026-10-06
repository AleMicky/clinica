import Link from "next/link";
import { Boxes, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export function ProductoHeader() {
  return (
    <div className="flex items-center justify-between gap-2.5 pb-1 border-b border-border/40">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Boxes className="size-4" />
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Catálogo de Productos
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Gestión de artículos, medicamentos, insumos, lotes y niveles de stock
          </span>
        </div>
      </div>

      <Link href={ROUTES.ALMACENES.REPORTES_PRODUCTOS}>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
        >
          <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Generar Reportes</span>
        </Button>
      </Link>
    </div>
  );
}
