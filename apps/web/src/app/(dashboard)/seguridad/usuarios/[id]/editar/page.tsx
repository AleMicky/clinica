"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { UsuarioPageForm } from "@/modules/seguridad/usuario";

export default function EditarUsuarioPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number(rawId);

  return <UsuarioPageForm id={id} />;
}
