import { TipoAreaPageForm } from "@/modules/recursos-humanos/tipo-area";

interface EditarTipoAreaPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Tipo de Área | Clínica",
};

export default async function EditarTipoAreaPage({ params }: EditarTipoAreaPageProps) {
  const { id } = await params;
  return <TipoAreaPageForm id={Number(id)} />;
}
