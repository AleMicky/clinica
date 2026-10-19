import type { Metadata } from "next";
import { DispensacionModuleView } from "@/modules/farmacia";

export const metadata: Metadata = {
  title: "Farmacia • Dispensación y Ventas | Clínica",
  description:
    "Gestión de preventa, cobro centralizado en caja y dispensación de medicamentos con control de lotes y stock en almacén.",
};

export default function DispensacionesPage() {
  return <DispensacionModuleView />;
}
