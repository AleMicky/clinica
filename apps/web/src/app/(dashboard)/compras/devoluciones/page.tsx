import type { Metadata } from "next";
import { DevolucionProveedorModuleView } from "@/modules/compras/devolucion-proveedor";

export const metadata: Metadata = {
  title: "Devoluciones a Proveedor | Compras",
  description:
    "Gestión de retornos físicos y salidas de almacén por fallas, averías o vencimiento hacia proveedores",
};

export default function DevolucionesProveedorPage() {
  return <DevolucionProveedorModuleView />;
}
