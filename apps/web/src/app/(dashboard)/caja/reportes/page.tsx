import type { Metadata } from "next";
import { CobroReporteView } from "@/modules/cajas/cobro/components/cobro-reporte-view";

export const metadata: Metadata = {
  title: "Reporte de Cobranzas - Caja y Recaudación | Clínica",
  description:
    "Generador, analítica en vivo y exportador oficial a Excel (.xlsx) de reportes de cobranzas, arqueos y formas de pago.",
};

export default function ReporteCobranzasPage() {
  return <CobroReporteView />;
}
