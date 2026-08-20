"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Trash2,
  Stethoscope,
  Handshake,
  Calendar,
  UserCheck,
  FileBadge,
  CreditCard,
  Edit,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Building2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PageContainer } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import {
  useDeleteMedicoEspecialidad,
  useDeleteMedicoServicioAcuerdo,
  useMedico,
  useMedicoEspecialidades,
  useMedicoServicioAcuerdos,
  useUpdateMedicoEspecialidad,
} from "../hooks/use-medicos";
import { MedicoEspecialidadDialog } from "./medico-especialidad-dialog";
import { MedicoAcuerdoDialog } from "./medico-acuerdo-dialog";
import type { MedicoServicioAcuerdoResponse } from "../types/medico.types";

interface MedicoDetailViewProps {
  medicoId: number;
}

export function MedicoDetailView({ medicoId }: MedicoDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "acuerdos" ? "acuerdos" : "especialidades";

  const [activeTab, setActiveTab] = React.useState(defaultTab);

  // Dialogs State
  const [isEspecialidadDialogOpen, setIsEspecialidadDialogOpen] = React.useState(false);
  const [isAcuerdoDialogOpen, setIsAcuerdoDialogOpen] = React.useState(false);
  const [acuerdoToEdit, setAcuerdoToEdit] =
    React.useState<MedicoServicioAcuerdoResponse | null>(null);

  // Search & Filter States
  const [searchTermEsp, setSearchTermEsp] = React.useState("");
  const [searchTermAcuerdo, setSearchTermAcuerdo] = React.useState("");
  const [filterVigencia, setFilterVigencia] = React.useState<"ALL" | "ACTIVOS" | "FINALIZADOS">("ALL");

  // Fetch Doctor Data
  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  // Fetch Especialidades
  const { data: especialidadesMedicoData, isLoading: isLoadingMedicoEspecialidades } =
    useMedicoEspecialidades(empleadoId, medicoId, Boolean(medico));

  // Fetch Acuerdos
  const { data: acuerdosData, isLoading: isLoadingAcuerdos } =
    useMedicoServicioAcuerdos(empleadoId, medicoId, Boolean(medico));

  // Mutations
  const updateEspMutation = useUpdateMedicoEspecialidad();
  const deleteEspMutation = useDeleteMedicoEspecialidad();
  const deleteAcuerdoMutation = useDeleteMedicoServicioAcuerdo();

  // Memos
  const especialidadesMedico = React.useMemo(
    () => especialidadesMedicoData?.items ?? [],
    [especialidadesMedicoData]
  );

  const acuerdos = React.useMemo(
    () => acuerdosData?.items ?? [],
    [acuerdosData]
  );

  const existingEspecialidadIds = React.useMemo(() => {
    return especialidadesMedico.map((e) => e.especialidadId);
  }, [especialidadesMedico]);

  // Filtered Especialidades
  const filteredEspecialidades = React.useMemo(() => {
    if (!searchTermEsp.trim()) return especialidadesMedico;
    const query = searchTermEsp.toLowerCase().trim();
    return especialidadesMedico.filter(
      (item) =>
        item.especialidad?.nombre?.toLowerCase().includes(query) ||
        item.especialidad?.codigo?.toLowerCase().includes(query)
    );
  }, [especialidadesMedico, searchTermEsp]);

  // Filtered Acuerdos
  const filteredAcuerdos = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return acuerdos.filter((item) => {
      if (searchTermAcuerdo.trim()) {
        const query = searchTermAcuerdo.toLowerCase().trim();
        const nombreMatch = item.servicio?.nombre?.toLowerCase().includes(query);
        const codigoMatch = item.servicio?.codigo?.toLowerCase().includes(query);
        if (!nombreMatch && !codigoMatch) return false;
      }

      if (filterVigencia === "ACTIVOS") {
        if (item.fechaFin && item.fechaFin < today) return false;
        if (!item.activo) return false;
      } else if (filterVigencia === "FINALIZADOS") {
        if (item.fechaFin && item.fechaFin >= today && item.activo) return false;
      }

      return true;
    });
  }, [acuerdos, searchTermAcuerdo, filterVigencia]);

  // Agreement Stats
  const acuerdoStats = React.useMemo(() => {
    const total = acuerdos.length;
    const today = new Date().toISOString().slice(0, 10);
    const activos = acuerdos.filter(
      (a) => a.activo && (!a.fechaFin || a.fechaFin >= today)
    ).length;

    let totalPctMedico = 0;
    let validPctCount = 0;

    acuerdos.forEach((a) => {
      if (a.importeServicio > 0) {
        totalPctMedico += (a.importeMedico / a.importeServicio) * 100;
        validPctCount++;
      }
    });

    const avgMedicoPct = validPctCount > 0 ? Math.round(totalPctMedico / validPctCount) : 0;
    const avgClinicaPct = validPctCount > 0 ? 100 - avgMedicoPct : 0;

    return { total, activos, avgMedicoPct, avgClinicaPct };
  }, [acuerdos]);

  // Handlers
  const handleTogglePrincipalEsp = async (
    espRelId: number,
    currentEspId: number,
    currentEsPrincipal: boolean
  ) => {
    if (!medico || currentEsPrincipal) return;
    try {
      await updateEspMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id: espRelId,
        request: {
          especialidadId: currentEspId,
          esPrincipal: true,
        },
      });
    } catch {
      // Handled by toast
    }
  };

  const handleDeleteEsp = async (id: number) => {
    if (!medico) return;
    try {
      await deleteEspMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
    } catch {
      // Handled by toast
    }
  };

  const handleOpenCreateAcuerdo = () => {
    setAcuerdoToEdit(null);
    setIsAcuerdoDialogOpen(true);
  };

  const handleOpenEditAcuerdo = (acuerdo: MedicoServicioAcuerdoResponse) => {
    setAcuerdoToEdit(acuerdo);
    setIsAcuerdoDialogOpen(true);
  };

  const handleDeleteAcuerdo = async (id: number) => {
    if (!medico) return;
    try {
      await deleteAcuerdoMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
    } catch {
      // Handled by toast
    }
  };

  if (isLoadingMedico) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Cargando expediente del médico...</span>
      </div>
    );
  }

  if (!medico) {
    return (
      <PageContainer>
        <div>
          <Button variant="ghost" onClick={() => router.push("/recursos-humanos/medicos")} className="text-xs gap-1.5">
            <ArrowLeft className="size-4" /> Volver a Médicos
          </Button>
        </div>
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground text-sm">
          No se encontró información para el médico solicitado.
        </div>
      </PageContainer>
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

  const today = new Date().toISOString().slice(0, 10);
  const principalEsp = especialidadesMedico.find((e) => e.esPrincipal);

  return (
    <PageContainer>
      {/* Top Back Navigation Bar */}
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

      {/* Hero Header Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left Avatar & Info */}
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
                        Reg. Minsal: {medico.registroMinisterioSalud}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Quick Action Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/recursos-humanos/medicos/${medicoId}/editar`)}
              className="text-xs gap-1.5 self-start md:self-center cursor-pointer shadow-2xs hover:border-primary/40 hover:text-primary h-9 rounded-xl"
            >
              <Edit className="size-3.5" />
              <span>Editar Expediente</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unified Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 w-full">
        <TabsList className="bg-muted/60 p-1 rounded-xl border border-border/50 h-auto grid grid-cols-2 max-w-md">
          <TabsTrigger
            value="especialidades"
            className="gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:shadow-2xs cursor-pointer"
          >
            <Stethoscope className="size-4 text-primary" />
            <span>Especialidades Médicas</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-bold">
              {especialidadesMedico.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="acuerdos"
            className="gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg data-[state=active]:shadow-2xs cursor-pointer"
          >
            <Handshake className="size-4 text-emerald-600" />
            <span>Acuerdos de Honorarios</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-bold">
              {acuerdos.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ESPECIALIDADES */}
        <TabsContent value="especialidades" className="space-y-4 focus-visible:outline-none">
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-border/60 shadow-2xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Especialidades Asignadas</p>
                  <p className="text-2xl font-bold text-foreground">{especialidadesMedico.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Stethoscope className="size-5" />
                </div>
              </CardContent>
            </Card>

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

          {/* Table Card */}
          <Card className="border-border/70 shadow-xs overflow-hidden bg-card">
            <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por especialidad o código..."
                  value={searchTermEsp}
                  onChange={(e) => setSearchTermEsp(e.target.value)}
                  className="h-9 pl-9 pr-8 text-xs bg-background"
                />
                {searchTermEsp && (
                  <button
                    type="button"
                    onClick={() => setSearchTermEsp("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <Button
                onClick={() => setIsEspecialidadDialogOpen(true)}
                className="text-xs font-semibold gap-1.5 cursor-pointer h-9 rounded-xl self-start sm:self-center"
              >
                <Plus className="size-4" />
                <span>Asignar Especialidad</span>
              </Button>
            </div>

            <CardContent className="p-0">
              {isLoadingMedicoEspecialidades ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-xs font-medium">Cargando especialidades...</span>
                </div>
              ) : filteredEspecialidades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground border">
                    <Stethoscope className="size-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-semibold text-foreground">
                      {searchTermEsp
                        ? "No se encontraron especialidades"
                        : "No hay especialidades asignadas"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchTermEsp
                        ? "Intente con otro término de búsqueda."
                        : "Acredite las especialidades médicas en el expediente del profesional."}
                    </p>
                  </div>
                  {!searchTermEsp && (
                    <Button
                      size="sm"
                      onClick={() => setIsEspecialidadDialogOpen(true)}
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
                          <TableCell className="py-3">
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.especialidad?.codigo || "N/A"}
                            </span>
                          </TableCell>
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
                                  handleTogglePrincipalEsp(
                                    item.id,
                                    item.especialidadId,
                                    item.esPrincipal
                                  )
                                }
                                disabled={updateEspMutation.isPending}
                              >
                                Marcar principal
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-right pr-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                              onClick={() => handleDeleteEsp(item.id)}
                              disabled={deleteEspMutation.isPending}
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
        </TabsContent>

        {/* TAB 2: ACUERDOS DE HONORARIOS */}
        <TabsContent value="acuerdos" className="space-y-4 focus-visible:outline-none">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-border/60 shadow-2xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Total Acuerdos</p>
                  <p className="text-2xl font-bold text-foreground">{acuerdoStats.total}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Handshake className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-2xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Vigentes / Activos</p>
                  <p className="text-2xl font-bold text-emerald-600">{acuerdoStats.activos}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-2xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Honorario Médico Prom.</p>
                  <p className="text-2xl font-bold text-emerald-600 font-mono">{acuerdoStats.avgMedicoPct}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <User className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-2xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Retención Clínica Prom.</p>
                  <p className="text-2xl font-bold text-sky-600 font-mono">{acuerdoStats.avgClinicaPct}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600">
                  <Building2 className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="border-border/70 shadow-xs overflow-hidden bg-card">
            <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <div className="relative flex-1 min-w-[240px] max-w-sm">
                  <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por servicio o código..."
                    value={searchTermAcuerdo}
                    onChange={(e) => setSearchTermAcuerdo(e.target.value)}
                    className="h-9 pl-9 pr-8 text-xs bg-background"
                  />
                  {searchTermAcuerdo && (
                    <button
                      type="button"
                      onClick={() => setSearchTermAcuerdo("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="w-[170px]">
                  <Select
                    value={filterVigencia}
                    onValueChange={(val) => {
                      if (val) setFilterVigencia(val as "ALL" | "ACTIVOS" | "FINALIZADOS");
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Estado de vigencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL" className="text-xs">Todos los acuerdos</SelectItem>
                      <SelectItem value="ACTIVOS" className="text-xs">Solo vigentes</SelectItem>
                      <SelectItem value="FINALIZADOS" className="text-xs">Solo finalizados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleOpenCreateAcuerdo}
                className="text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-9 rounded-xl self-start md:self-center"
              >
                <Plus className="size-4" />
                <span>Nuevo Acuerdo</span>
              </Button>
            </div>

            <CardContent className="p-0">
              {isLoadingAcuerdos ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="size-6 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium">Cargando acuerdos registrados...</span>
                </div>
              ) : filteredAcuerdos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground border">
                    <Handshake className="size-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-semibold text-foreground">
                      {searchTermAcuerdo || filterVigencia !== "ALL"
                        ? "No se encontraron acuerdos con los filtros aplicados"
                        : "No hay acuerdos de servicio configurados"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchTermAcuerdo || filterVigencia !== "ALL"
                        ? "Intente limpiar los filtros de búsqueda."
                        : "Configure la distribución económica por servicios para este médico."}
                    </p>
                  </div>
                  {!searchTermAcuerdo && filterVigencia === "ALL" && (
                    <Button
                      size="sm"
                      onClick={handleOpenCreateAcuerdo}
                      className="text-xs gap-1.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      <Plus className="size-3.5" /> Registrar Primer Acuerdo
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[300px] text-xs font-bold text-foreground">Servicio Clínico</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Importe Total</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Honorario Médico</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Retención Clínica</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Vigencia</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-right pr-4">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAcuerdos.map((item) => {
                        const medicoPct =
                          item.importeServicio > 0
                            ? Math.round((item.importeMedico / item.importeServicio) * 100)
                            : 0;
                        const clinicaPct = 100 - medicoPct;
                        const isExpired = item.fechaFin && item.fechaFin < today;

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                                  <Stethoscope className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate">
                                    {item.servicio?.nombre || `Servicio #${item.servicioId}`}
                                  </p>
                                  <span className="font-mono text-[11px] text-muted-foreground block">
                                    Cód: {item.servicio?.codigo || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-3">
                              <span className="font-mono font-bold text-xs text-foreground">
                                {formatCurrency(item.importeServicio)}
                              </span>
                            </TableCell>

                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-emerald-600">
                                  {formatCurrency(item.importeMedico)}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                >
                                  {medicoPct}%
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-sky-600">
                                  {formatCurrency(item.importeClinica)}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[10px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20"
                                >
                                  {clinicaPct}%
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="py-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                  <Calendar className="size-3 text-muted-foreground" />
                                  <span>{item.fechaInicio}</span>
                                  <span className="text-muted-foreground">al</span>
                                  <span>{item.fechaFin || "Indefinido"}</span>
                                </div>
                                {isExpired ? (
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    Vencido
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    Vigente
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-3 text-right pr-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                  onClick={() => handleOpenEditAcuerdo(item)}
                                  title="Editar acuerdo"
                                >
                                  <Edit2 className="size-3.5" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                                  onClick={() => handleDeleteAcuerdo(item.id)}
                                  disabled={deleteAcuerdoMutation.isPending}
                                  title="Eliminar acuerdo"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Specialty Modal Dialog */}
      <MedicoEspecialidadDialog
        open={isEspecialidadDialogOpen}
        onOpenChange={setIsEspecialidadDialogOpen}
        empleadoId={empleadoId}
        medicoId={medicoId}
        existingEspecialidadIds={existingEspecialidadIds}
      />

      {/* Agreement Modal Dialog */}
      <MedicoAcuerdoDialog
        open={isAcuerdoDialogOpen}
        onOpenChange={setIsAcuerdoDialogOpen}
        empleadoId={empleadoId}
        medicoId={medicoId}
        acuerdoToEdit={acuerdoToEdit}
      />
    </PageContainer>
  );
}
