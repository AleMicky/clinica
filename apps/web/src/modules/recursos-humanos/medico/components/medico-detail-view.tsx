"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Trash2,
  Stethoscope,
  Handshake,
  Percent,
  Calendar,
  UserCheck,
  FileBadge,
  CreditCard,
  Edit,
  FolderTree,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { StatusBadge } from "@/components/shared";
import { useEspecialidades } from "@/modules/recursos-humanos/especialidad/hooks/use-especialidades";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio";
import { useServicios } from "@/modules/servicios/servicio";
import {
  useCreateMedicoEspecialidad,
  useCreateMedicoServicioAcuerdo,
  useDeleteMedicoEspecialidad,
  useDeleteMedicoServicioAcuerdo,
  useMedico,
  useMedicoEspecialidades,
  useMedicoServicioAcuerdos,
  useUpdateMedicoEspecialidad,
} from "../hooks/use-medicos";
import {
  medicoEspecialidadSchema,
  medicoServicioAcuerdoSchema,
  type MedicoEspecialidadFormValues,
  type MedicoServicioAcuerdoFormValues,
} from "../schemas/medico.schema";
import { MedicoFormDialog } from "./medico-form-dialog";

interface MedicoDetailViewProps {
  medicoId: number;
}

function getTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function MedicoDetailView({ medicoId }: MedicoDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "acuerdos" ? "acuerdos" : "especialidades";

  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Selected Service Category for Acuerdos
  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number>(0);

  // Fetch Doctor Data
  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  // Fetch Especialidades del Médico
  const { data: especialidadesMedicoData, isLoading: isLoadingMedicoEspecialidades } =
    useMedicoEspecialidades(empleadoId, medicoId, Boolean(medico));

  // Fetch Acuerdos del Médico
  const { data: acuerdosData, isLoading: isLoadingAcuerdos } =
    useMedicoServicioAcuerdos(empleadoId, medicoId, Boolean(medico));

  // Fetch Catalogos & Categorias
  const { data: especialidadesCatalogoData, isLoading: isLoadingCatalogo } =
    useEspecialidades({ pageSize: 200 });

  const { data: categoriasData, isLoading: isLoadingCategorias } =
    useCategoriasServicio({ pageSize: 100 });

  const categorias = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);

  // Auto-select first category if not selected
  React.useEffect(() => {
    if (categorias.length > 0 && selectedCategoriaId === 0) {
      setSelectedCategoriaId(categorias[0].id);
    }
  }, [categorias, selectedCategoriaId]);

  // Fetch Servicios filtered by Category
  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServicios(selectedCategoriaId, { pageSize: 200 }, selectedCategoriaId > 0);

  const servicios = React.useMemo(() => serviciosData?.items ?? [], [serviciosData]);

  // Mutations
  const createEspMutation = useCreateMedicoEspecialidad();
  const updateEspMutation = useUpdateMedicoEspecialidad();
  const deleteEspMutation = useDeleteMedicoEspecialidad();

  const createAcuerdoMutation = useCreateMedicoServicioAcuerdo();
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

  const especialidadesCatalogo = React.useMemo(
    () => especialidadesCatalogoData?.items ?? [],
    [especialidadesCatalogoData]
  );

  const especialidadOptions: AutocompleteOption[] = React.useMemo(() => {
    return especialidadesCatalogo.map((esp) => ({
      value: String(esp.id),
      label: esp.nombre,
      description: esp.codigo ? `Cód: ${esp.codigo}` : undefined,
    }));
  }, [especialidadesCatalogo]);

  const categoriaOptions: AutocompleteOption[] = React.useMemo(() => {
    return categorias.map((cat) => ({
      value: String(cat.id),
      label: cat.nombre,
      description: cat.codigo ? `Cód: ${cat.codigo}` : undefined,
    }));
  }, [categorias]);

  const servicioOptions: AutocompleteOption[] = React.useMemo(() => {
    return servicios.map((srv) => ({
      value: String(srv.id),
      label: srv.nombre,
      description: srv.codigo ? `Cód: ${srv.codigo}` : undefined,
    }));
  }, [servicios]);

  // Form 1: Especialidades
  const {
    handleSubmit: handleSubmitEsp,
    reset: resetEsp,
    setValue: setValueEsp,
    watch: watchEsp,
    formState: { errors: errorsEsp, isSubmitting: isSubmittingEsp },
  } = useForm<MedicoEspecialidadFormValues>({
    resolver: zodResolver(medicoEspecialidadSchema),
    defaultValues: {
      especialidadId: 0,
      esPrincipal: false,
    },
  });

  const selectedEspecialidadId = watchEsp("especialidadId");
  const esPrincipalVal = watchEsp("esPrincipal");

  // Form 2: Acuerdos
  const {
    register: registerAcuerdo,
    handleSubmit: handleSubmitAcuerdo,
    reset: resetAcuerdo,
    setValue: setValueAcuerdo,
    watch: watchAcuerdo,
    formState: { errors: errorsAcuerdo, isSubmitting: isSubmittingAcuerdo },
  } = useForm<MedicoServicioAcuerdoFormValues>({
    resolver: zodResolver(medicoServicioAcuerdoSchema),
    defaultValues: {
      servicioId: 0,
      porcentajeMedico: 50,
      fechaInicio: getTodayISO(),
      fechaFin: "",
    },
  });

  const selectedServicioId = watchAcuerdo("servicioId");

  // Submit Handlers
  const onSubmitAddEspecialidad = async (values: MedicoEspecialidadFormValues) => {
    if (!medico) return;
    try {
      await createEspMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        request: {
          especialidadId: values.especialidadId,
          esPrincipal: values.esPrincipal,
        },
      });
      resetEsp({
        especialidadId: 0,
        esPrincipal: false,
      });
    } catch {
      // Toast handles error
    }
  };

  const handleTogglePrincipal = async (espRelId: number, currentEspId: number, currentEsPrincipal: boolean) => {
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
      // Toast handles error
    }
  };

  const handleDeleteEspecialidad = async (id: number) => {
    if (!medico) return;
    try {
      await deleteEspMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
    } catch {
      // Toast handles error
    }
  };

  const onSubmitAddAcuerdo = async (values: MedicoServicioAcuerdoFormValues) => {
    if (!medico) return;
    try {
      await createAcuerdoMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        request: {
          servicioId: values.servicioId,
          porcentajeMedico: values.porcentajeMedico,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin?.trim() || null,
        },
      });
      resetAcuerdo({
        servicioId: 0,
        porcentajeMedico: 50,
        fechaInicio: getTodayISO(),
        fechaFin: "",
      });
    } catch {
      // Toast handles error
    }
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
      // Toast handles error
    }
  };

  if (isLoadingMedico) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
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
        <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-sm">
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/recursos-humanos/medicos")}
          className="text-xs gap-1.5 cursor-pointer shadow-2xs hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          <span>Volver al Cuerpo Médico</span>
        </Button>
      </div>

      {/* Hero Header Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left Avatar & Info */}
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="size-14 border-2 border-primary/20 bg-primary/10 text-primary shrink-0 shadow-2xs">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground truncate leading-tight">
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
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs gap-1.5 self-start md:self-center cursor-pointer shadow-2xs hover:border-primary/40 hover:text-primary"
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
            className="gap-2 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:shadow-2xs cursor-pointer"
          >
            <Stethoscope className="size-4 text-primary" />
            <span>Especialidades Médicas</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-bold">
              {especialidadesMedico.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="acuerdos"
            className="gap-2 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:shadow-2xs cursor-pointer"
          >
            <Handshake className="size-4 text-emerald-600" />
            <span>Acuerdos de Honorarios</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-bold">
              {acuerdos.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ESPECIALIDADES */}
        <TabsContent value="especialidades" className="space-y-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Form Column */}
            <Card className="lg:col-span-5 shadow-xs border-border/70 bg-card">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  <span>Asignar Especialidad</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Acredite una nueva especialidad médica en el expediente del profesional.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSubmitEsp(onSubmitAddEspecialidad)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="especialidadId" className="text-xs">
                      Especialidad Médica <span className="text-destructive">*</span>
                    </Label>
                    <Autocomplete
                      id="especialidadId"
                      value={selectedEspecialidadId ? String(selectedEspecialidadId) : ""}
                      onValueChange={(val) =>
                        setValueEsp("especialidadId", Number(val), { shouldValidate: true })
                      }
                      options={especialidadOptions}
                      placeholder="Buscar especialidad..."
                      emptyText="No se encontraron especialidades"
                      allowCustomValue={false}
                      isLoading={isLoadingCatalogo}
                      error={Boolean(errorsEsp.especialidadId)}
                    />
                    {errorsEsp.especialidadId && (
                      <p className="text-xs text-destructive">
                        {errorsEsp.especialidadId.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="esPrincipal"
                      checked={esPrincipalVal}
                      onCheckedChange={(checked) => setValueEsp("esPrincipal", Boolean(checked))}
                    />
                    <Label htmlFor="esPrincipal" className="text-xs cursor-pointer font-medium">
                      Marcar como Especialidad Principal
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="w-full text-xs gap-1.5 cursor-pointer mt-2"
                    disabled={createEspMutation.isPending || isSubmittingEsp}
                  >
                    {createEspMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-4" /> Asignar a Expediente
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* List Column */}
            <Card className="lg:col-span-7 shadow-xs border-border/70 bg-card">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Stethoscope className="size-4 text-primary" />
                    <span>Especialidades Asignadas</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Catálogo de especialidades registradas para este médico.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-bold text-xs">
                  {especialidadesMedico.length}
                </Badge>
              </CardHeader>

              <CardContent className="p-4">
                {isLoadingMedicoEspecialidades ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                    <Loader2 className="size-5 animate-spin text-primary" /> Cargando especialidades...
                  </div>
                ) : especialidadesMedico.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-xl text-sm text-muted-foreground">
                    El médico aún no tiene especialidades asignadas en su expediente.
                  </div>
                ) : (
                  <div className="divide-y border rounded-xl overflow-hidden bg-card">
                    {especialidadesMedico.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Stethoscope className="size-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground">
                                {item.especialidad?.nombre || `Especialidad #${item.especialidadId}`}
                              </p>
                              {item.esPrincipal ? (
                                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 gap-1 text-[11px]">
                                  <Star className="size-3 fill-amber-100" /> Principal
                                </Badge>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[11px] text-muted-foreground hover:text-amber-600 px-2 cursor-pointer"
                                  onClick={() => handleTogglePrincipal(item.id, item.especialidadId, item.esPrincipal)}
                                  disabled={updateEspMutation.isPending}
                                >
                                  Marcar principal
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              Código: {item.especialidad?.codigo || "N/A"}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-md"
                          onClick={() => handleDeleteEspecialidad(item.id)}
                          disabled={deleteEspMutation.isPending}
                          title="Desasignar especialidad"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: ACUERDOS DE HONORARIOS */}
        <TabsContent value="acuerdos" className="space-y-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Form Column */}
            <Card className="lg:col-span-5 shadow-xs border-border/70 bg-card">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="size-4 text-emerald-600" />
                  <span>Registrar Acuerdo de Honorarios</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Filtre por catálogo o categoría de servicio y establezca el porcentaje de cobro.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSubmitAcuerdo(onSubmitAddAcuerdo)} className="space-y-4">
                  {/* Categoría / Catálogo de Servicio */}
                  <div className="space-y-1.5">
                    <Label htmlFor="categoriaId" className="text-xs flex items-center gap-1 font-semibold">
                      <FolderTree className="size-3 text-emerald-600" /> Catálogo / Categoría de Servicio
                    </Label>
                    <Autocomplete
                      id="categoriaId"
                      value={selectedCategoriaId ? String(selectedCategoriaId) : ""}
                      onValueChange={(val) => {
                        const catId = Number(val);
                        setSelectedCategoriaId(catId);
                        setValueAcuerdo("servicioId", 0, { shouldValidate: false });
                      }}
                      options={categoriaOptions}
                      placeholder="Seleccionar catálogo o categoría..."
                      emptyText="No se encontraron categorías"
                      allowCustomValue={false}
                      isLoading={isLoadingCategorias}
                    />
                  </div>

                  {/* Servicio Clínico */}
                  <div className="space-y-1.5">
                    <Label htmlFor="servicioId" className="text-xs font-semibold">
                      Servicio Clínico <span className="text-destructive">*</span>
                    </Label>
                    <Autocomplete
                      id="servicioId"
                      value={selectedServicioId ? String(selectedServicioId) : ""}
                      onValueChange={(val) =>
                        setValueAcuerdo("servicioId", Number(val), { shouldValidate: true })
                      }
                      options={servicioOptions}
                      placeholder={
                        selectedCategoriaId === 0
                          ? "Seleccione primero una categoría..."
                          : "Buscar servicio en el catálogo..."
                      }
                      emptyText="No se encontraron servicios en esta categoría"
                      allowCustomValue={false}
                      disabled={selectedCategoriaId === 0 || isLoadingServicios}
                      isLoading={isLoadingServicios}
                      error={Boolean(errorsAcuerdo.servicioId)}
                    />
                    {errorsAcuerdo.servicioId && (
                      <p className="text-xs text-destructive">
                        {errorsAcuerdo.servicioId.message}
                      </p>
                    )}
                  </div>

                  {/* Porcentaje % */}
                  <div className="space-y-1.5">
                    <Label htmlFor="porcentajeMedico" className="text-xs">
                      % Honorario del Médico <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="porcentajeMedico"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="h-9 pr-7"
                        {...registerAcuerdo("porcentajeMedico", { valueAsNumber: true })}
                      />
                      <Percent className="size-3.5 absolute right-2.5 top-2.5 text-muted-foreground" />
                    </div>
                    {errorsAcuerdo.porcentajeMedico && (
                      <p className="text-xs text-destructive">
                        {errorsAcuerdo.porcentajeMedico.message}
                      </p>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fechaInicio" className="text-xs">
                        Fecha Inicio <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        className="h-9 text-xs"
                        {...registerAcuerdo("fechaInicio")}
                      />
                      {errorsAcuerdo.fechaInicio && (
                        <p className="text-xs text-destructive">
                          {errorsAcuerdo.fechaInicio.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fechaFin" className="text-xs">
                        Fecha Fin (Opcional)
                      </Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        className="h-9 text-xs"
                        {...registerAcuerdo("fechaFin")}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="w-full text-xs gap-1.5 cursor-pointer mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={createAcuerdoMutation.isPending || isSubmittingAcuerdo}
                  >
                    {createAcuerdoMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-4" /> Registrar Acuerdo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* List Column */}
            <Card className="lg:col-span-7 shadow-xs border-border/70 bg-card">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Handshake className="size-4 text-emerald-600" />
                    <span>Acuerdos Registrados</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Listado de porcentajes de honorarios acordados por servicio.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-bold text-xs">
                  {acuerdos.length}
                </Badge>
              </CardHeader>

              <CardContent className="p-4">
                {isLoadingAcuerdos ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                    <Loader2 className="size-5 animate-spin text-emerald-600" /> Cargando acuerdos...
                  </div>
                ) : acuerdos.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-xl text-sm text-muted-foreground">
                    No hay acuerdos de porcentaje registrados para este médico.
                  </div>
                ) : (
                  <div className="divide-y border rounded-xl overflow-hidden bg-card">
                    {acuerdos.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-0.5 shrink-0 border border-emerald-500/20">
                            {item.porcentajeMedico}%
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {item.servicio?.nombre || `Servicio #${item.servicioId}`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="font-mono">
                                Código: {item.servicio?.codigo || "N/A"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {item.fechaInicio}
                                {item.fechaFin ? ` al ${item.fechaFin}` : " (Vigente)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-md"
                          onClick={() => handleDeleteAcuerdo(item.id)}
                          disabled={deleteAcuerdoMutation.isPending}
                          title="Desactivar acuerdo"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Basic Info Modal */}
      <MedicoFormDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        medicoToEdit={medico}
      />
    </div>
  );
}
