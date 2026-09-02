import type { Metadata } from "next";
import { CotizacionCompraModuleView } from "@/modules/compras/cotizacion-compra";

export const metadata: Metadata = {
  title: "Cotizaciones de Compra | Compras",
  description:
    "Gestión y cuadro comparativo de cotizaciones de proveedores para compras",
};

export default function CotizacionesCompraPage() {
  return <CotizacionCompraModuleView />;
}
