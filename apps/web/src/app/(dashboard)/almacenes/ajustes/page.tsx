import type { Metadata } from "next";
import { AjusteInventarioModuleView } from "@/modules/almacenes/ajuste-inventario";

export const metadata: Metadata = {
  title: "Ajustes de Inventario | Almacenes",
  description:
    "Gestión de ajustes manuales positivos y negativos de stock en almacenes clínicos",
};

export default function AjustesInventarioPage() {
  return <AjusteInventarioModuleView />;
}
