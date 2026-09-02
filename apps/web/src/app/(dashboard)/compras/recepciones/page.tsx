import type { Metadata } from "next";
import { RecepcionCompraModuleView } from "@/modules/compras/recepcion-compra";

export const metadata: Metadata = {
  title: "Recepciones de Compra | Compras",
  description:
    "Control de ingresos físicos y almacén para órdenes de compra de proveedores",
};

export default function RecepcionesCompraPage() {
  return <RecepcionCompraModuleView />;
}
