import type { Metadata } from "next";
import { MovimientoCajaReporteView } from "@/modules/cajas/movimiento-caja/components/movimiento-caja-reporte-view";

export const metadata: Metadata = {
  title: "Reporte de Movimientos de Caja - Flujo de Efectivo | Clínica",
  description:
    "Analítica interactiva, KPIs financieros y exportación a Excel (.xlsx) de movimientos, ingresos y egresos de caja.",
};

export default function ReporteMovimientosCajaPage() {
  return <MovimientoCajaReporteView />;
}
