import type { Metadata } from "next";
import { ProductoReporteView } from "@/modules/almacenes/producto";

export const metadata: Metadata = {
  title: "Reporte de Productos - Almacenes | Clínica",
  description:
    "Generador y exportador de reportes de productos con filtros de catálogo, unidades de medida, categorías, marcas y proveedores.",
};

export default function ReporteProductosPage() {
  return <ProductoReporteView />;
}
