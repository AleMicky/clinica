import { Metadata } from "next";
import { EspecialidadModuleView } from "@/modules/recursos-humanos/especialidad";

export const metadata: Metadata = {
  title: "Especialidades Médicas | Recursos Humanos",
  description: "Administración del catálogo de especialidades médicas y subespecialidades",
};

export default function EspecialidadesPage() {
  return <EspecialidadModuleView />;
}
