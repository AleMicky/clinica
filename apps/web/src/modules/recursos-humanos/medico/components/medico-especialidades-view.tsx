"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Trash2,
  Stethoscope,
  UserCheck,
  FileBadge,
  CreditCard,
  Search,
  CheckCircle2,
  X,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared";
import {
  useDeleteMedicoEspecialidad,
  useMedico,
  useMedicoEspecialidades,
  useUpdateMedicoEspecialidad,
} from "../hooks/use-medicos";
import { MedicoEspecialidadDialog } from "./medico-especialidad-dialog";

interface MedicoEspecialidadesViewProps {
  medicoId: number;
}

export function MedicoEspecialidadesView({ medicoId }: MedicoEspecialidadesViewProps) {
  const router = useRouter();

  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: especialidadesMedicoData, isLoading: isLoadingMedicoEspecialidades } =
    useMedicoEspecialidades(empleadoId, medicoId, Boolean(medico));

  const updateMutation = useUpdateMedicoEspecialidad();
  const deleteMutation = useDeleteMedicoEspecialidad();

  const especialidadesMedico = React.useMemo(
    () => especialidadesMedicoData?.items ?? [],
    [especialidadesMedicoData]
  );

  const existingEspecialidadIds = React.useMemo(() => {
    return especialidadesMedico.map((e) => e.especialidadId);
  }, [especialidadesMedico]);

  const filteredEspecialidades = React.useMemo(() => {
    if (!searchTerm.trim()) return especialidadesMedico;
    const query = searchTerm.toLowerCase().trim();
    return especialidadesMedico.filter(
      (item) =>
        item.especialidad?.nombre?.toLowerCase().includes(query) ||
        item.especialidad?.codigo?.toLowerCase().includes(query)
    );
  }, [especialidadesMedico, searchTerm]);

  // KPIs
  const totalEspecialidades = especialidadesMedico.length;
  const principalEsp = especialidadesMedico.find((e) => e.esPrincipal);

  const handleTogglePrincipal = async (
    espRelId: number,
    currentEspId: number,
    currentEsPrincipal: boolean
  ) => {
    if (!medico || currentEsPrincipal) return;
    try {
      await updateMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id: espRelId,
        request: {
          especialidadId: currentEspId,
          esPrincipal: true,
        },
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleDelete = async (id: number) => {
    if (!medico) return;
    try {
      await deleteMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  if (isLoadingMedico) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Cargando expediente médico...</span>
      </div>
    );
  }

  if (!medico) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/recursos-humanos/medicos")} className="text-xs gap-1.5">
          <ArrowLeft className="size-4" /> Volver a Médicos
        </Button>
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground text-sm">
          No se encontró información para el médico solicitado.
        </div>
      </div>
    );
  }

  const nombreCompleto =
    medico.empleado?.nombreCompleto ||
    [
      medico.empleado?.persona?.nombres,
      medico.empleado?.persona?.apellidoPaterno,
      medico.empleado?.persona?.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(" ") ||
    `Empleado #${medico.empleadoId}`;

  const codigoEmpleado = medico.empleado?.codigoEmpleado || `EMP-${medico.empleadoId}`;

  const initials = nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "MD";

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/recursos-humanos/medicos")}
          className="text-xs gap-1.5 cursor-pointer shadow-2xs hover:bg-muted font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>Volver al Cuerpo Médico</span>
        </Button>
      </div>

      {/* Hero Doctor Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Doctor Info */}
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="size-14 sm:size-16 border-2 border-primary/20 bg-primary/10 text-primary shrink-0 shadow-2xs">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base sm:text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate leading-tight">
                    {nombreCompleto}
                  </h1>
                  <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono flex items-center gap-1 font-medium">
                    <UserCheck className="size-3.5 text-muted-foreground/80" />
                    {codigoEmpleado}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1 font-semibold text-foreground">
                    <CreditCard className="size-3.5 text-muted-foreground/80" />
                    Matrícula: {medico.matriculaProfesional}
                  </span>
                  {medico.registroMinisterioSalud && (
                    <>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1 text-muted-foreground">
                        <FileBadge className="size-3.5 text-sky-500" />
                        Minsal: {medico.registroMinisterioSalud}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="text-xs font-semibold gap-2 cursor-pointer shadow-sm px-4 h-10 rounded-xl"
              >
                <Plus className="size-4" />
                <span>Asignar Especialidad</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Especialidades */}
        <Card className="border-border/60 shadow-2xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Especialidades Asignadas</p>
              <p className="text-2xl font-bold text-foreground">{totalEspecialidades}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Especialidad Principal */}
        <Card className="border-border/60 shadow-2xs bg-card sm:col-span-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Especialidad Principal</p>
              <p className="text-lg font-bold text-foreground truncate">
                {principalEsp?.especialidad?.nombre || "No configurada"}
              </p>
              {principalEsp?.especialidad?.codigo && (
                <p className="font-mono text-xs text-muted-foreground">
                  Cód: {principalEsp.especialidad.codigo}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Star className="size-5 fill-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List & Table Card */}
      <Card className="border-border/70 shadow-xs overflow-hidden bg-card">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por especialidad o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-background"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>
              {filteredEspecialidades.length} de {especialidadesMedico.length} especialidades
            </span>
          </div>
        </div>

        {/* Content Area */}
        <CardContent className="p-0">
          {isLoadingMedicoEspecialidades ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Cargando especialidades médicas...</span>
            </div>
          ) : filteredEspecialidades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground border">
                <Stethoscope className="size-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-semibold text-foreground">
                  {searchTerm
                    ? "No se encontraron especialidades con el término ingresado"
                    : "El médico no tiene especialidades asignadas"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm
                    ? "Intente con otra búsqueda."
                    : "Acredite las especialidades médicas correspondientes en su expediente."}
                </p>
              </div>
              {!searchTerm && (
                <Button
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="text-xs gap-1.5 mt-2 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Asignar Primera Especialidad
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[320px] text-xs font-bold text-foreground">Especialidad Médica</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Código</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Tipo / Rol</TableHead>
                    <TableHead className="text-xs font-bold text-foreground text-right pr-4">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEspecialidades.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Stethoscope className="size-4" />
                          </div>
                          <p className="text-xs font-bold text-foreground">
                            {item.especialidad?.nombre || `Especialidad #${item.especialidadId}`}
                          </p>
                        </div>
                      </TableCell>

                      {/* Code */}
                      <TableCell className="py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.especialidad?.codigo || "N/A"}
                        </span>
                      </TableCell>

                      {/* Role / Principal Status */}
                      <TableCell className="py-3">
                        {item.esPrincipal ? (
                          <Badge
                            variant="default"
                            className="bg-amber-500 hover:bg-amber-600 gap-1 text-[11px] font-bold text-white shadow-2xs"
                          >
                            <Star className="size-3 fill-amber-100" /> Especialidad Principal
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[11px] text-muted-foreground hover:text-amber-600 hover:border-amber-500/40 px-2 cursor-pointer"
                            onClick={() =>
                              handleTogglePrincipal(
                                item.id,
                                item.especialidadId,
                                item.esPrincipal
                              )
                            }
                            disabled={updateMutation.isPending}
                          >
                            Marcar como principal
                          </Button>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 text-right pr-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          title="Desasignar especialidad"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <MedicoEspecialidadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        empleadoId={empleadoId}
        medicoId={medicoId}
        existingEspecialidadIds={existingEspecialidadIds}
      />
    </div>
  );
}
