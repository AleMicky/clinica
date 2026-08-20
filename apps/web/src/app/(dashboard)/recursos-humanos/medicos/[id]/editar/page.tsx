import { MedicoPageForm } from "@/modules/recursos-humanos/medico";

interface EditarMedicoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Médico | Clínica",
};

export default async function EditarMedicoPage({ params }: EditarMedicoPageProps) {
  const { id } = await params;
  return <MedicoPageForm id={Number(id)} />;
}
