"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import {
  Building2,
  UserCheck,
  Calendar,
  ShieldCheck,
  FileEdit,
  Sparkles,
} from "lucide-react";
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

  const selectedAffiliated = React.useMemo(() => {
    if (convenioId === "particular") return null;
    return pacienteConveniosList.find((pc) => pc.convenioId.toString() === convenioId);
  }, [convenioId, pacienteConveniosList]);

  return (
    <Card className="border border-border/70 shadow-2xs bg-card">
      <CardHeader className="p-3 pb-2 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Building2 className="size-4 text-primary" />
          <span>2. Cobertura & Recepción</span>
        </CardTitle>

        {selectedAffiliated ? (
          <Badge className="bg-emerald-600 text-white border-0 text-[9px] font-bold px-1.5 py-0 h-4.5 gap-1 shadow-2xs">
            <ShieldCheck className="size-2.5" />
            <span>{selectedAffiliated.esPrincipal ? "★ Cobertura Principal" : "Convenio Activo"}</span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[9px] font-semibold text-muted-foreground px-1.5 py-0 h-4.5">
            Particular
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {/* Fila 1 en Grid Compacto: Recepcionista y Fecha/Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Recepcionista Responsable */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="recepcionista" className="text-[11px] font-semibold flex items-center gap-1">
                <UserCheck className="size-3 text-primary" />
                <span>Recepcionista <span className="text-destructive">*</span></span>
              </Label>
              {isLoadingEmpleados && (
                <span className="text-[9.5px] text-muted-foreground animate-pulse">Cargando...</span>
              )}
            </div>

            <Autocomplete
              id="recepcionista"
              value={recepcionistaId}
              onValueChange={(val) => setRecepcionistaId(val)}
              options={recepcionistaOptions}
              placeholder="Buscar recepcionista..."
              emptyText="No se encontraron recepcionistas."
              allowCustomValue={false}
              isLoading={isLoadingEmpleados}
              className="h-8 text-xs bg-background border-border/80 font-medium"
            />
          </div>

          {/* Fecha & Hora de Atención */}
          <div className="space-y-1 text-xs">
            <Label htmlFor="fechaHora" className="text-[11px] font-semibold flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" />
              <span>Fecha & Hora <span className="text-destructive">*</span></span>
            </Label>
            <Input
              id="fechaHora"
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="h-8 text-xs bg-background font-mono font-medium w-full"
            />
          </div>
        </div>

        {/* Fila 2: Convenio / Cobertura con Información de Afiliación */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <Label htmlFor="convenio" className="text-[11px] font-semibold flex items-center gap-1">
              <Building2 className="size-3 text-primary" />
              <span>Convenio / Cobertura</span>
            </Label>

            {isLoadingPacienteConvenios ? (
              <span className="text-[9.5px] text-muted-foreground animate-pulse">Consultando convenios...</span>
            ) : pacienteConveniosList.length > 0 ? (
              <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {pacienteConveniosList.length} afiliado(s)
              </span>
            ) : null}
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

          {/* Micro-tarjeta de afiliación si está seleccionado un convenio vinculado */}
          {selectedAffiliated && (
            <div className="mt-1 p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="size-3 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {selectedAffiliated.numeroAfiliado ? (
                    <>N° Afiliado: <strong className="font-mono">{selectedAffiliated.numeroAfiliado}</strong></>
                  ) : (
                    "Afiliación activa verificada"
                  )}
                </span>
              </div>
              <span className="font-semibold text-[10px] text-emerald-700 dark:text-emerald-300 shrink-0">
                Tarifa preferencial
              </span>
            </div>
          )}
        </div>

        {/* Fila 3: Observaciones Clínicas / Indicaciones */}
        <div className="space-y-1 text-xs">
          <Label htmlFor="observaciones" className="text-[11px] font-semibold flex items-center gap-1">
            <FileEdit className="size-3 text-muted-foreground" />
            <span>Observaciones de Ingreso</span>
          </Label>
          <Textarea
            id="observaciones"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Sintomatología de ingreso, derivación o notas clínicas (opcional)..."
            rows={2}
            className="text-xs bg-background resize-none border-border/70 min-h-[42px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
