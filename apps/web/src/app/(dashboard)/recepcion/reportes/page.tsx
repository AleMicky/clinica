import type { Metadata } from "next";
import { AdmisionReporteView } from "@/modules/recepcion/admisiones";

export const metadata: Metadata = {
  title: "Reportes de Admisión - Recepción | Clínica",
  description:
    "Generador, analítica y exportador oficial a Excel de reportes de admisiones de pacientes y prestaciones médicas.",
};

export default function ReporteAdmisionesPage() {
  return <AdmisionReporteView />;
}
