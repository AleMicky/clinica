import type { Metadata } from "next";
import { PacienteModuleView } from "@/modules/recepcion";

export const metadata: Metadata = {
  title: "Pacientes | Recepción | Sistema Médico",
  description: "Gestión de expedientes clínicos e historias clínicas de pacientes en Recepción.",
};

export default function RecepcionPacientesPage() {
  return <PacienteModuleView />;
}
