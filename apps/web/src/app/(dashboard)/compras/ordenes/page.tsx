import type { Metadata } from "next";
import { OrdenCompraModuleView } from "@/modules/compras/orden-compra";

export const metadata: Metadata = {
  title: "Órdenes de Compra | Compras",
  description:
    "Emisión, aprobación y seguimiento de órdenes oficiales de compra a proveedores",
};

export default function OrdenesCompraPage() {
  return <OrdenCompraModuleView />;
}
