import * as React from "react";
import { Metadata } from "next";
import { MedicoEspecialidadesView } from "@/modules/recursos-humanos/medico";

export const metadata: Metadata = {
  title: "Especialidades del Médico | Recursos Humanos",
  description: "Asignación y administración de especialidades acreditadas por médico",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicoEspecialidadesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const medicoId = Number(resolvedParams.id) || 0;

  return <MedicoEspecialidadesView medicoId={medicoId} />;
}
