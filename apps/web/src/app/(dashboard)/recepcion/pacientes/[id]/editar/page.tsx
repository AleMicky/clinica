import { PacientePageForm } from "@/modules/recepcion/pacientes";

interface EditarPacientePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Paciente | Clínica",
};

export default async function EditarPacientePage({ params }: EditarPacientePageProps) {
  const { id } = await params;
  return <PacientePageForm id={Number(id)} />;
}
