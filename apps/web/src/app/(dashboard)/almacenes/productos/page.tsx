import type { Metadata } from "next";
import { ProductoModuleView } from "@/modules/almacenes/producto";

export const metadata: Metadata = {
  title: "Catálogo de Productos - Almacenes | Clínica",
  description: "Gestión del catálogo de artículos, medicamentos, insumos y stocks de almacén",
};

export default function ProductosPage() {
  return <ProductoModuleView />;
}
