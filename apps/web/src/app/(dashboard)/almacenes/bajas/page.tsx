import type { Metadata } from "next";
import { BajaInventarioModuleView } from "@/modules/almacenes/baja-inventario";

export const metadata: Metadata = {
  title: "Bajas de Inventario | Almacenes",
  description:
    "Gestión y registro de descartes de stock por vencimiento, rotura, daño o merma",
};

export default function BajasInventarioPage() {
  return <BajaInventarioModuleView />;
}
