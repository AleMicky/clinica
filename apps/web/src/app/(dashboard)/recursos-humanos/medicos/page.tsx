import { Metadata } from "next";
import { MedicoModuleView } from "@/modules/recursos-humanos/medico";

export const metadata: Metadata = {
  title: "Cuerpo Médico | Recursos Humanos",
  description: "Expediente del cuerpo médico, gestión de especialidades y acuerdos de servicio",
};

export default function MedicosPage() {
  return <MedicoModuleView />;
}
