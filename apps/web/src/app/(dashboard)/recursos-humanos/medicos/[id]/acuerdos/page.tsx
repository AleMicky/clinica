import * as React from "react";
import { Metadata } from "next";
import { MedicoAcuerdosView } from "@/modules/recursos-humanos/medico";

export const metadata: Metadata = {
  title: "Acuerdos de Honorarios | Recursos Humanos",
  description: "Configuración de porcentajes de pago por servicios clínicos prestados por el médico",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicoAcuerdosPage({ params }: PageProps) {
  const resolvedParams = await params;
  const medicoId = Number(resolvedParams.id) || 0;

  return <MedicoAcuerdosView medicoId={medicoId} />;
}
