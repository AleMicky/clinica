import type { Metadata } from "next";
import { InventarioFisicoModuleView } from "@/modules/almacenes/inventario-fisico";

export const metadata: Metadata = {
  title: "Inventarios Físicos | Almacenes",
  description:
    "Control de conteos físicos de existencias, cálculo de discrepancias y ajustes de stock",
};

export default function InventariosFisicosPage() {
  return <InventarioFisicoModuleView />;
}
