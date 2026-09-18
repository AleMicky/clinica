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
  CheckCircle2,
  Edit3,
  RefreshCw,
  Phone,
  FileText,
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

function getInitials(name: string): string {
  if (!name) return "P";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  const fullName = selectedPaciente ? getPacienteFullName(selectedPaciente) : "";
  const initials = getInitials(fullName);
  const docInfo = selectedPaciente ? getPacienteDocument(selectedPaciente) : "";
  const hcNumber = selectedPaciente?.numeroHistoriaClinica || selectedPaciente?.id;
  const telefono = selectedPaciente?.persona?.telefono;

  return (
    <Card className="border border-border/80 shadow-2xs bg-card overflow-hidden">
      <CardHeader className="p-3 pb-2.5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <div className="size-5 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
            1
          </div>
          <span>Selección de Paciente</span>
        </CardTitle>

        {isPatientValid && (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 h-5 gap-1 shadow-2xs">
            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Verificado</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {selectedPaciente ? (
          /* FICHA MODERNA DE PACIENTE SELECCIONADO (PATIENT ID CARD) */
          <div className="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/5 via-background to-emerald-500/10 p-3 space-y-3 shadow-2xs">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar con Iniciales y Gradiente */}
                <div className="size-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 tracking-wider">
                  {initials}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                      {fullName}
                    </h4>
                    <Badge variant="outline" className="text-[9px] bg-background/80 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold px-1.5 py-0 h-4 shrink-0">
                      Activo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground/80">
                      <FileText className="size-3 text-muted-foreground" />
                      {docInfo}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      HC: <strong className="font-mono text-primary font-bold">{hcNumber}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenRegisterModal(selectedPaciente)}
                  className="h-7 text-[11px] text-primary hover:bg-primary/10 border-primary/30 px-2.5 font-semibold gap-1 rounded-lg cursor-pointer transition-colors"
                  title="Editar datos del paciente"
                >
                  <Edit3 className="size-3" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPacienteId("");
                    setPatientSearch("");
                  }}
                  className="h-7 text-[11px] text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 px-2 rounded-lg font-semibold gap-1 cursor-pointer transition-colors"
                  title="Seleccionar otro paciente"
                >
                  <RefreshCw className="size-3" />
                  <span className="hidden sm:inline">Cambiar</span>
                </Button>
              </div>
            </div>

            {/* Badges de Información Adicional (Teléfono / Contacto) */}
            {telefono && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-foreground/80 font-mono">
                  <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                  {telefono}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* MODO BÚSQUEDA Y SELECCIÓN */
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar por DNI/Documento, Nombre o N° HC..."
                className="h-8.5 text-xs pl-8 pr-3 bg-background border-border/80 shadow-2xs font-medium focus-visible:ring-primary/30"
                autoFocus
              />
            </div>

            {/* Sugerencia para registrar paciente si no se encuentra */}
            {patientSearch.trim().length > 0 && filteredPacientes.length === 0 && !isLoadingPacientes && (
              <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-2 text-xs animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">
                      Sin coincidencias para: <span className="font-bold font-mono">&ldquo;{patientSearch}&rdquo;</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ¿Desea registrar al paciente ahora mismo?
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenRegisterModal(null)}
                  className="h-7 px-2.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1 rounded-lg cursor-pointer shadow-xs"
                >
                  <UserPlus className="size-3.5" />
                  <span>+ Registrar</span>
                </Button>
              </div>
            )}

            {/* Lista de resultados de búsqueda */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
              {isLoadingPacientes ? (
                <div className="py-4 text-center space-y-1">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[11px] text-muted-foreground font-medium">Buscando pacientes...</p>
                </div>
              ) : filteredPacientes.length === 0 && !patientSearch ? (
                <div className="p-3 text-center border border-dashed border-border/70 rounded-xl bg-muted/10 space-y-1">
                  <User className="size-5 text-muted-foreground/50 mx-auto" />
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Escriba DNI, Nombre o N° de Historia Clínica para buscar.
                  </p>
                </div>
              ) : (
                filteredPacientes.map((p) => {
                  const nom = getPacienteFullName(p);
                  const pInitials = getInitials(nom);
                  const docPInfo = getPacienteDocument(p);
                  const hc = p.numeroHistoriaClinica || p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPacienteId(p.id.toString());
                        toast.success(`Paciente "${nom}" seleccionado.`);
                      }}
                      className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all text-left flex items-center justify-between text-xs group cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="size-7 rounded-lg bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {pInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                            {nom}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            <span className="font-mono">{docPInfo}</span> • HC: <strong className="font-mono text-foreground/90">{hc}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100 shrink-0 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground px-2 py-0.5 rounded-md transition-all">
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
