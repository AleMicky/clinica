"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Building2, UserCheck, Calendar } from "lucide-react";
import type { PacienteConvenioResponse } from "../../pacientes/types/paciente.types";
import type { ConvenioResponse } from "@/modules/servicios/convenio/types/convenio.types";
import type { EmpleadoResponse } from "@/modules/recursos-humanos/empleado/types/empleado.types";

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
  empleadosList: EmpleadoResponse[];
  isLoadingPacienteConvenios: boolean;
  isLoadingEmpleados?: boolean;
  selectedConvenioNombre: string;
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
  selectedConvenioNombre,
}: AdmisionCoberturaSectionProps) {
  const recepcionistaOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleadosList.map((emp) => {
      const nombre = emp.persona
        ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${emp.persona.apellidoMaterno || ""}`.trim()
        : emp.codigoEmpleado || `Empleado #${emp.id}`;
      return {
        value: String(emp.id),
        label: nombre,
      };
    });
  }, [empleadosList]);

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
            <Label className="text-xs font-semibold">Convenio / Cobertura</Label>
            {isLoadingPacienteConvenios && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Cargando...</span>
            )}
          </div>
          <Select
            value={convenioId}
            onValueChange={(val: string | null) => setConvenioId(val || "particular")}
          >
            <SelectTrigger className="h-8 w-full bg-background text-xs font-medium border-border/80">
              <SelectValue placeholder="Seleccionar convenio...">
                {selectedConvenioNombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-w-xl w-full">
              <SelectItem value="particular" label="Particular (Sin Convenio / Cobertura Directa)">
                Particular (Sin Convenio / Cobertura Directa)
              </SelectItem>

              {pacienteConveniosList.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Convenios Afiliados al Paciente
                  </SelectLabel>
                  {pacienteConveniosList.map((pc) => {
                    const cNombre = pc.convenio?.nombre || `Convenio #${pc.convenioId}`;
                    const cCodigo = pc.convenio?.codigo ? ` (${pc.convenio.codigo})` : "";
                    const afil = pc.numeroAfiliado ? ` - Afil: ${pc.numeroAfiliado}` : "";
                    const star = pc.esPrincipal ? " ★ [Principal]" : "";
                    const labelText = `${cNombre}${cCodigo}${afil}${star}`;
                    return (
                      <SelectItem key={`pc-${pc.id}`} value={pc.convenioId.toString()} label={labelText}>
                        {cNombre}{cCodigo}{afil}{star}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              )}

              <SelectSeparator />

              <SelectGroup>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Todos los Convenios del Sistema
                </SelectLabel>
                {conveniosList.map((c) => {
                  const cLabel = `${c.nombre}${c.codigo ? ` (${c.codigo})` : ""}`;
                  return (
                    <SelectItem key={`c-${c.id}`} value={c.id.toString()} label={cLabel}>
                      {c.nombre} {c.codigo ? `(${c.codigo})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
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
