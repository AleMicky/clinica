"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Handshake,
  Calendar,
  UserCheck,
  FileBadge,
  CreditCard,
  Search,
  Edit2,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Stethoscope,
  Building2,
  User,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PageContainer } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio";
import {
  useDeleteMedicoServicioAcuerdo,
  useMedico,
  useMedicoServicioAcuerdos,
} from "../hooks/use-medicos";
import { MedicoAcuerdoDialog } from "./medico-acuerdo-dialog";
import type { MedicoServicioAcuerdoResponse } from "../types/medico.types";

interface MedicoAcuerdosViewProps {
  medicoId: number;
}

export function MedicoAcuerdosView({ medicoId }: MedicoAcuerdosViewProps) {
  const router = useRouter();

  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [acuerdoToEdit, setAcuerdoToEdit] =
    React.useState<MedicoServicioAcuerdoResponse | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCategoria, setFilterCategoria] = React.useState<string>("ALL");
  const [filterVigencia, setFilterVigencia] = React.useState<"ALL" | "ACTIVOS" | "FINALIZADOS">("ALL");

  // Agreements Query
  const { data: acuerdosData, isLoading: isLoadingAcuerdos } =
    useMedicoServicioAcuerdos(empleadoId, medicoId, Boolean(medico));

  // Categories Query for filtering
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });
  const categorias = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);

  const deleteMutation = useDeleteMedicoServicioAcuerdo();

  const acuerdos = React.useMemo(
    () => acuerdosData?.items ?? [],
    [acuerdosData]
  );

  // Filtered Agreements
  const filteredAcuerdos = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return acuerdos.filter((item) => {
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nombreMatch = item.servicio?.nombre?.toLowerCase().includes(query);
        const codigoMatch = item.servicio?.codigo?.toLowerCase().includes(query);
        if (!nombreMatch && !codigoMatch) return false;
      }

      // Vigencia filter
      if (filterVigencia === "ACTIVOS") {
        if (item.fechaFin && item.fechaFin < today) return false;
        if (!item.activo) return false;
      } else if (filterVigencia === "FINALIZADOS") {
        if (item.fechaFin && item.fechaFin >= today && item.activo) return false;
      }

      return true;
    });
  }, [acuerdos, searchTerm, filterVigencia]);

  // Statistics
  const stats = React.useMemo(() => {
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

  const handleOpenCreate = () => {
    setAcuerdoToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (acuerdo: MedicoServicioAcuerdoResponse) => {
    setAcuerdoToEdit(acuerdo);
    setIsDialogOpen(true);
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
      // Toast handled by mutation
    }
  };

  if (isLoadingMedico) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
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

  return (
    <PageContainer>
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

      {/* Hero Doctor Header & Action */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Doctor Info */}
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="size-14 sm:size-16 border-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shrink-0 shadow-2xs">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-base sm:text-lg">
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
                onClick={handleOpenCreate}
                className="text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm px-4 h-10 rounded-xl"
              >
                <Plus className="size-4" />
                <span>Nuevo Acuerdo de Servicio</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Acuerdos */}
        <Card className="border-border/60 shadow-2xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Total Acuerdos</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Handshake className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Acuerdos Activos */}
        <Card className="border-border/60 shadow-2xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Vigentes / Activos</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.activos}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Promedio Médico */}
        <Card className="border-border/60 shadow-2xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Promedio Honorario Médico</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono">{stats.avgMedicoPct}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <User className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Promedio Clínica */}
        <Card className="border-border/60 shadow-2xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Retención Promedio Clínica</p>
              <p className="text-2xl font-bold text-sky-600 font-mono">{stats.avgClinicaPct}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600">
              <Building2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List & Table Card */}
      <Card className="border-border/70 shadow-xs overflow-hidden bg-card">
        {/* Toolbar: Search, Filters & Counter */}
        <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por servicio o código..."
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

            {/* Vigencia Filter */}
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

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>
              {filteredAcuerdos.length} de {acuerdos.length} acuerdos
            </span>
          </div>
        </div>

        {/* Content Area */}
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
                  {searchTerm || filterVigencia !== "ALL"
                    ? "No se encontraron acuerdos con los filtros aplicados"
                    : "No hay acuerdos de servicio configurados"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm || filterVigencia !== "ALL"
                    ? "Intente limpiar los filtros de búsqueda para ver más resultados."
                    : "Configure los servicios que realiza este médico y la distribución de honorarios."}
                </p>
              </div>
              {!searchTerm && filterVigencia === "ALL" && (
                <Button
                  size="sm"
                  onClick={handleOpenCreate}
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
                        {/* Servicio Name & Code */}
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

                        {/* Importe Total */}
                        <TableCell className="py-3">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {formatCurrency(item.importeServicio)}
                          </span>
                        </TableCell>

                        {/* Honorario Médico */}
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

                        {/* Retención Clínica */}
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

                        {/* Vigencia */}
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

                        {/* Acciones */}
                        <TableCell className="py-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => handleOpenEdit(item)}
                              title="Editar acuerdo"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteMutation.isPending}
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

      {/* Modal Dialog for Create & Edit */}
      <MedicoAcuerdoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        empleadoId={empleadoId}
        medicoId={medicoId}
        acuerdoToEdit={acuerdoToEdit}
      />
    </PageContainer>
  );
}
