import { ArqueoCajaPageForm } from "@/modules/cajas";

export const metadata = {
  title: "Nuevo Arqueo de Caja | Clínica",
};

interface NuevoArqueoPageProps {
  searchParams: Promise<{ turnoId?: string }>;
}

export default async function NuevoArqueoCajaPage({
  searchParams,
}: NuevoArqueoPageProps) {
  const resolvedParams = await searchParams;
  const defaultTurnoId = resolvedParams.turnoId
    ? Number(resolvedParams.turnoId)
    : undefined;

  return <ArqueoCajaPageForm defaultTurnoId={defaultTurnoId} />;
}
