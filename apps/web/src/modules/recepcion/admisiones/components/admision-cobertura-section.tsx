"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Building2, UserCheck, Calendar } from "lucide-react";
import type { PacienteConvenioResponse } from "../../pacientes/types/paciente.types";
import type { ConvenioResponse } from "@/modules/servicios/convenio/types/convenio.types";
import type { EmpleadoBaseInfo } from "@/modules/recursos-humanos/empleado/types/empleado.types";

export interface AdmisionCoberturaSectionProps {
  convenioId: string;
  setConvenioId: (id: string) => void;
  recepcionistaId: string;
  setRecepcionistaId: (id: string) => void;
  fechaHora: string;
  setFechaHora: (val: string) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  pacienteConveniosList: PacienteConvenioResponse[];
  conveniosList: ConvenioResponse[];
  empleadosList: EmpleadoBaseInfo[];
  isLoadingPacienteConvenios: boolean;
  isLoadingEmpleados?: boolean;
  selectedConvenioNombre?: string;
}

export function AdmisionCoberturaSection({
  convenioId,
  setConvenioId,
  recepcionistaId,
  setRecepcionistaId,
  fechaHora,
  setFechaHora,
  observacion,
  setObservacion,
  pacienteConveniosList,
  conveniosList,
  empleadosList,
  isLoadingPacienteConvenios,
  isLoadingEmpleados,
}: AdmisionCoberturaSectionProps) {
  const recepcionistaOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleadosList.map((emp) => ({
      value: String(emp.id),
      label: emp.nombreCompleto || emp.codigoEmpleado || `Empleado #${emp.id}`,
    }));
  }, [empleadosList]);

  const convenioOptions: AutocompleteOption[] = React.useMemo(() => {
    const options: AutocompleteOption[] = [
      {
        value: "particular",
        label: "Particular (Sin Convenio / Cobertura Directa)",
        description: "Cobertura directa sin convenio",
      },
    ];

    // 1. Convenios Afiliados al Paciente
    if (pacienteConveniosList.length > 0) {
      pacienteConveniosList.forEach((pc) => {
        const cNombre = pc.convenio?.nombre || `Convenio #${pc.convenioId}`;
        const cCodigo = pc.convenio?.codigo ? ` (${pc.convenio.codigo})` : "";
        const afil = pc.numeroAfiliado ? `N° Afil: ${pc.numeroAfiliado}` : "";
        const principal = pc.esPrincipal ? "★ Principal" : "";
        const desc = [afil, principal].filter(Boolean).join(" • ");

        options.push({
          value: pc.convenioId.toString(),
          label: `${cNombre}${cCodigo}`,
          description: desc ? `Afiliado al paciente (${desc})` : "Afiliado al paciente",
        });
      });
    }

    // 2. Convenios Generales del Sistema
    const affiliatedIds = new Set(pacienteConveniosList.map((pc) => pc.convenioId.toString()));
    conveniosList.forEach((c) => {
      if (!affiliatedIds.has(c.id.toString())) {
        options.push({
          value: c.id.toString(),
          label: `${c.nombre}${c.codigo ? ` (${c.codigo})` : ""}`,
          description: "Convenio general del sistema",
        });
      }
    });

    return options;
  }, [pacienteConveniosList, conveniosList]);

  return (
    <Card className="border border-border/70 shadow-2xs bg-card">
      <CardHeader className="p-3 pb-2 border-b border-border/60">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Building2 className="size-4 text-primary" />
          2. Cobertura & Recepción
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {/* Recepcionista Responsable */}
        <div className="space-y-1 w-full text-xs">
          <div className="flex items-center justify-between">
            <Label htmlFor="recepcionista" className="text-xs font-semibold flex items-center gap-1">
              <UserCheck className="size-3 text-primary" />
              Recepcionista <span className="text-destructive">*</span>
            </Label>
            {isLoadingEmpleados && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Cargando...</span>
            )}
          </div>

          <Autocomplete
            id="recepcionista"
            value={recepcionistaId}
            onValueChange={(val) => setRecepcionistaId(val)}
            options={recepcionistaOptions}
            placeholder="Seleccionar o buscar recepcionista..."
            emptyText="No se encontraron recepcionistas."
            allowCustomValue={false}
            isLoading={isLoadingEmpleados}
            className="h-8 text-xs bg-background border-border/80 font-medium"
          />
        </div>

        {/* Convenio / Cobertura */}
        <div className="space-y-1 w-full text-xs">
          <div className="flex items-center justify-between">
            <Label htmlFor="convenio" className="text-xs font-semibold">Convenio / Cobertura</Label>
            {isLoadingPacienteConvenios && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Cargando...</span>
            )}
          </div>
          <Autocomplete
            id="convenio"
            value={convenioId}
            onValueChange={(val) => setConvenioId(val)}
            options={convenioOptions}
            placeholder="Seleccionar o buscar convenio..."
            emptyText="No se encontraron convenios."
            allowCustomValue={false}
            isLoading={isLoadingPacienteConvenios}
            className="h-8 text-xs bg-background border-border/80 font-medium"
          />
        </div>

        {/* Fecha & Hora de Atención */}
        <div className="space-y-1 w-full text-xs">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            Fecha & Hora de Atención
          </Label>
          <Input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className="h-8 text-xs bg-background font-mono font-medium w-full"
          />
        </div>

        {/* Observaciones */}
        <div className="space-y-1 text-xs">
          <Label className="text-xs font-semibold">Observaciones Clínicas / Indicaciones</Label>
          <Textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Sintomatología de ingreso o notas médicas..."
            rows={2}
            className="text-xs bg-background resize-none border-border/70 min-h-[44px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
