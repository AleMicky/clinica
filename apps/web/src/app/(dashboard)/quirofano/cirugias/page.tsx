import type { Metadata } from "next";
import { QuirofanoModuleView } from "@/modules/quirofano";

export const metadata: Metadata = {
  title: "Quirófano • Intervenciones Quirúrgicas | Clínica",
  description:
    "Gestión de cirugías, programación de quirófanos, registro de equipo médico, hoja de gasto de materiales y descuento de inventario en almacén.",
};

export default function QuirofanoCirugiasPage() {
  return <QuirofanoModuleView />;
}
