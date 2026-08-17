"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  UserPlus,
  Search,
  AlertCircle,
  Check,
  Edit,
} from "lucide-react";
import { getPacienteFullName, getPacienteDocument } from "../../pacientes/components/paciente-card";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { toast } from "sonner";

export interface AdmisionPacienteSectionProps {
  selectedPaciente?: PacienteResponse;
  isPatientValid: boolean;
  patientSearch: string;
  setPatientSearch: (val: string) => void;
  setSelectedPacienteId: (id: string) => void;
  filteredPacientes: PacienteResponse[];
  isLoadingPacientes: boolean;
  onOpenRegisterModal: (paciente?: PacienteResponse | null) => void;
}

export function AdmisionPacienteSection({
  selectedPaciente,
  isPatientValid,
  patientSearch,
  setPatientSearch,
  setSelectedPacienteId,
  filteredPacientes,
  isLoadingPacientes,
  onOpenRegisterModal,
}: AdmisionPacienteSectionProps) {
  return (
    <Card className="border border-border/70 shadow-2xs bg-card">
      <CardHeader className="p-4 pb-2.5 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <User className="size-4 text-primary" />
          1. Selección de Paciente
        </CardTitle>

        {isPatientValid && (
          <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold px-2 py-0.5">
            ✓ Paciente Confirmado
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {selectedPaciente ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Check className="size-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">
                  {getPacienteFullName(selectedPaciente)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {getPacienteDocument(selectedPaciente)} | N° HC: <strong>{selectedPaciente.numeroHistoriaClinica || selectedPaciente.id}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenRegisterModal(selectedPaciente)}
                className="h-7 text-xs text-primary hover:bg-primary/10 border-primary/30 px-2.5 font-semibold gap-1"
                title="Editar expediente de este paciente"
              >
                <Edit className="size-3.5" />
                Editar
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPacienteId("");
                  setPatientSearch("");
                }}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 px-2.5 font-semibold"
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar por Documento, Nombre o N° Historia Clínica..."
                className="h-9.5 text-xs pl-9 pr-3 bg-background shadow-2xs font-medium"
                autoFocus
              />
            </div>

            {/* SUGERENCIA PARA REGISTRAR SI NO EXISTE */}
            {patientSearch.trim().length > 0 && filteredPacientes.length === 0 && (
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] text-foreground font-medium">
                    No existe ningún paciente para <strong>"{patientSearch}"</strong>.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenRegisterModal(null)}
                  className="h-7.5 px-3 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1 shadow-2xs"
                >
                  <UserPlus className="size-3.5" />
                  + Registrar Paciente
                </Button>
              </div>
            )}

            {/* LISTA DE RESULTADOS DE BÚSQUEDA */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {isLoadingPacientes ? (
                <p className="text-xs text-center text-muted-foreground py-4">Buscando pacientes en la BD...</p>
              ) : filteredPacientes.length === 0 && !patientSearch ? (
                <p className="text-xs text-center text-muted-foreground py-4 border border-dashed rounded-xl">
                  Escriba Documento, Nombre o N° Historia Clínica para seleccionar.
                </p>
              ) : (
                filteredPacientes.map((p) => {
                  const nom = getPacienteFullName(p);
                  const docInfo = getPacienteDocument(p);
                  const hc = p.numeroHistoriaClinica || p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPacienteId(p.id.toString());
                        toast.success(`Paciente "${nom}" seleccionado.`);
                      }}
                      className="w-full p-2.5 rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-left flex items-center justify-between text-xs group"
                    >
                      <div>
                        <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{nom}</p>
                        <p className="text-[11px] text-muted-foreground">{docInfo} | N° HC: <strong>{hc}</strong></p>
                      </div>
                      <span className="text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100">Elegir →</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
