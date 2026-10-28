import type { Metadata } from "next";
import { DispensacionPageForm } from "@/modules/farmacia";

export const metadata: Metadata = {
  title: "Nueva Venta / Dispensación • Farmacia | Clínica",
  description:
    "Registro de orden de dispensación y venta de medicamentos de farmacia con control de lotes y pase directo a caja.",
};

export default function NuevaDispensacionPage() {
  return <DispensacionPageForm />;
}
