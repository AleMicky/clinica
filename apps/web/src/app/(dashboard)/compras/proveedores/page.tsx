import type { Metadata } from "next";
import { ProveedorModuleView } from "@/modules/compras/proveedor";

export const metadata: Metadata = {
  title: "Proveedores | Clínica",
  description: "Gestión y catálogo de proveedores para el módulo de compras",
};

export default function ProveedoresPage() {
  return <ProveedorModuleView />;
}
