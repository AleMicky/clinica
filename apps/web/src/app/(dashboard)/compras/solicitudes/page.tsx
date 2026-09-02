import type { Metadata } from "next";
import { SolicitudCompraModuleView } from "@/modules/compras/solicitud-compra";

export const metadata: Metadata = {
  title: "Solicitudes de Compra | Compras",
  description:
    "Gestión y flujo de aprobación de requerimientos y solicitudes de compra para almacenes",
};

export default function SolicitudesCompraPage() {
  return <SolicitudCompraModuleView />;
}
