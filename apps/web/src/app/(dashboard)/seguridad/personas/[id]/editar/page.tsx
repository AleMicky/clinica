import { PersonaPageForm } from "@/modules/seguridad/persona";

interface EditarPersonaPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Persona | Clínica",
};

export default async function EditarPersonaPage({ params }: EditarPersonaPageProps) {
  const { id } = await params;
  return <PersonaPageForm id={Number(id)} />;
}
