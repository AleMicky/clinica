import type { Metadata } from "next";
import { TransferenciaAlmacenModuleView } from "@/modules/almacenes/transferencia-almacen";

export const metadata: Metadata = {
  title: "Transferencias entre Almacenes | Almacenes",
  description:
    "Gestión de traslados, despachos y recepciones de stock entre almacenes",
};

export default function TransferenciasAlmacenPage() {
  return <TransferenciaAlmacenModuleView />;
}
