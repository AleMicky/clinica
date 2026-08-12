"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdmisionesPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <PageHeader
        title="Gestión de Admisiones"
        description="Registro de atenciones, orden de servicios y estados de ingreso."
        icon={FileText}
        actionLabel="Nueva Admisión"
      />

      <Card className="border border-border/70 shadow-xs">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="size-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">Módulo de Admisiones en Recepción</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Próximamente: Registro de órdenes de atención, selección de servicios y médicos tratantes para pacientes ingresados.
          </p>
          <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 mt-2">
            <Plus className="size-3.5" />
            Crear Admisión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
