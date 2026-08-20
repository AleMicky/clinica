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
import { getPacienteFullName, getPacienteDocument } from "../../pacientes/components/paciente-list";
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
      <CardHeader className="p-3 pb-2 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <User className="size-4 text-primary" />
          1. Selección de Paciente
        </CardTitle>

        {isPatientValid && (
          <Badge className="bg-emerald-600 text-white border-0 text-[9px] font-bold px-1.5 py-0 h-4.5">
            ✓ Confirmado
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {selectedPaciente ? (
          <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Check className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-foreground truncate">
                  {getPacienteFullName(selectedPaciente)}
                </p>
                <p className="text-[10.5px] text-muted-foreground truncate">
                  {getPacienteDocument(selectedPaciente)} • HC: <strong className="text-foreground">{selectedPaciente.numeroHistoriaClinica || selectedPaciente.id}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenRegisterModal(selectedPaciente)}
                className="h-6.5 text-[11px] text-primary hover:bg-primary/10 border-primary/30 px-2 font-semibold gap-1 cursor-pointer"
                title="Editar paciente"
              >
                <Edit className="size-3" />
                <span>Editar</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPacienteId("");
                  setPatientSearch("");
                }}
                className="h-6.5 text-[11px] text-rose-600 hover:bg-rose-50 px-2 font-semibold cursor-pointer"
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar por Documento, Nombre o N° HC..."
                className="h-8.5 text-xs pl-8 pr-3 bg-background shadow-2xs font-medium"
                autoFocus
              />
            </div>

            {/* Sugerencia para registrar paciente si no se encuentra */}
            {patientSearch.trim().length > 0 && filteredPacientes.length === 0 && (
              <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px] text-foreground truncate">
                    No existe: <strong>"{patientSearch}"</strong>
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenRegisterModal(null)}
                  className="h-6.5 px-2 text-[10.5px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1 cursor-pointer"
                >
                  <UserPlus className="size-3" />
                  <span>+ Registrar</span>
                </Button>
              </div>
            )}

            {/* Lista de resultados de búsqueda */}
            <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
              {isLoadingPacientes ? (
                <p className="text-xs text-center text-muted-foreground py-3">Buscando pacientes...</p>
              ) : filteredPacientes.length === 0 && !patientSearch ? (
                <p className="text-[11px] text-center text-muted-foreground py-3 border border-dashed rounded-lg bg-muted/5">
                  Escriba DNI, Nombre o N° HC para seleccionar.
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
                      className="w-full p-2 rounded-lg border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-left flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {nom}
                        </p>
                        <p className="text-[10.5px] text-muted-foreground truncate">
                          {docInfo} • HC: <strong>{hc}</strong>
                        </p>
                      </div>
                      <span className="text-[10.5px] font-bold text-primary opacity-70 group-hover:opacity-100 shrink-0">
                        Elegir →
                      </span>
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
