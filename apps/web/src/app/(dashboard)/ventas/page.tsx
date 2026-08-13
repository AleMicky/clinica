import { VentaModuleView } from "@/modules/ventas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ventas y Facturación | MediServ",
  description: "Módulo de gestión de ventas, comprobantes y distribución de pagadores.",
};

export default function VentasPage() {
  return <VentaModuleView />;
}
