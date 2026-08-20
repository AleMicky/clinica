import { EspecialidadPageForm } from "@/modules/recursos-humanos/especialidad";

interface EditarEspecialidadPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Especialidad | Clínica",
};

export default async function EditarEspecialidadPage({ params }: EditarEspecialidadPageProps) {
  const { id } = await params;
  return <EspecialidadPageForm id={Number(id)} />;
}
