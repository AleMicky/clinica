import * as React from "react";
import { Metadata } from "next";
import { MedicoDetailView } from "@/modules/recursos-humanos/medico";

export const metadata: Metadata = {
  title: "Expediente del Médico | Recursos Humanos",
  description: "Administración integral de especialidades médicas y acuerdos de honorarios por servicio",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicoDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const medicoId = Number(resolvedParams.id) || 0;

  return <MedicoDetailView medicoId={medicoId} />;
}
