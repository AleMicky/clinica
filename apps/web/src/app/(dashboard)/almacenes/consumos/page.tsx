import type { Metadata } from "next";
import { ConsumoInternoModuleView } from "@/modules/almacenes/consumo-interno";

export const metadata: Metadata = {
  title: "Consumos Internos | Almacenes",
  description:
    "Vales de despacho de insumos y materiales para áreas, salas y servicios hospitalarios",
};

export default function ConsumosInternoPage() {
  return <ConsumoInternoModuleView />;
}
