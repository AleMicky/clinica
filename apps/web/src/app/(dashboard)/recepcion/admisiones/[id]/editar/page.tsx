import { AdmisionPageForm } from "@/modules/recepcion/admisiones/components/admision-page-form";

interface EditarAdmisionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarAdmisionPage({ params }: EditarAdmisionPageProps) {
  const resolvedParams = await params;
  const admisionId = Number(resolvedParams.id);

  return <AdmisionPageForm admisionId={admisionId} />;
}
