import type { Metadata } from "next";
import { VentaReporteView } from "@/modules/ventas";

export const metadata: Metadata = {
  title: "Reporte de Ventas - Punto de Venta | Clínica",
  description:
    "Generador, analítica en vivo y exportador oficial a Excel (.xlsx) de reportes de ventas y comprobantes.",
};

export default function ReporteVentasPage() {
  return <VentaReporteView />;
}
