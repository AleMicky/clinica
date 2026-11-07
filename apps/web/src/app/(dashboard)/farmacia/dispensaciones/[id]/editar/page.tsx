import type { Metadata } from "next";
import { DispensacionPageForm } from "@/modules/farmacia";

interface EditarDispensacionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar Dispensación • Farmacia | Clínica",
  description: "Modificación de orden de dispensación en estado pendiente de pago.",
};

export default async function EditarDispensacionPage({
  params,
}: EditarDispensacionPageProps) {
  const { id } = await params;
  return <DispensacionPageForm dispensacionId={Number(id)} />;
}

