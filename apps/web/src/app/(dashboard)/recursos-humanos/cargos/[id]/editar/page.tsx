import { CargoPageForm } from "@/modules/recursos-humanos/cargo";

interface EditarCargoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Cargo | Clínica",
};

export default async function EditarCargoPage({ params }: EditarCargoPageProps) {
  const { id } = await params;
  return <CargoPageForm id={Number(id)} />;
}
