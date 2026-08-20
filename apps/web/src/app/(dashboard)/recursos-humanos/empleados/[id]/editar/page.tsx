import { EmpleadoPageForm } from "@/modules/recursos-humanos/empleado";

interface EditarEmpleadoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar Empleado | Clínica",
};

export default async function EditarEmpleadoPage({ params }: EditarEmpleadoPageProps) {
  const { id } = await params;
  return <EmpleadoPageForm id={Number(id)} />;
}
