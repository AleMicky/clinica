"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FolderTree,
  DollarSign,
  Building2,
  User,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { StatusBadge } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio";
import { useServicios } from "@/modules/servicios/servicio";
import {
  useCreateMedicoServicioAcuerdo,
  useDeleteMedicoServicioAcuerdo,
  useMedico,
  useMedicoServicioAcuerdos,
} from "../hooks/use-medicos";
import {
  medicoServicioAcuerdoSchema,
  type MedicoServicioAcuerdoFormValues,
} from "../schemas/medico.schema";

interface MedicoAcuerdosViewProps {
  medicoId: number;
}

function getTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function MedicoAcuerdosView({ medicoId }: MedicoAcuerdosViewProps) {
  const router = useRouter();

  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  // Selected Service Category
  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number>(0);

  const { data: acuerdosData, isLoading: isLoadingAcuerdos } =
    useMedicoServicioAcuerdos(empleadoId, medicoId, Boolean(medico));

  // Fetch Categorías
  const { data: categoriasData, isLoading: isLoadingCategorias } =
    useCategoriasServicio({ pageSize: 100 });

  const categorias = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);

  // Auto-select first category
  React.useEffect(() => {
    if (categorias.length > 0 && selectedCategoriaId === 0) {
      setSelectedCategoriaId(categorias[0].id);
    }
  }, [categorias, selectedCategoriaId]);

  // Fetch Servicios filtered by Category
  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServicios(selectedCategoriaId, { pageSize: 200 }, selectedCategoriaId > 0);

  const createMutation = useCreateMedicoServicioAcuerdo();
  const deleteMutation = useDeleteMedicoServicioAcuerdo();

  const acuerdos = React.useMemo(
    () => acuerdosData?.items ?? [],
    [acuerdosData]
  );

  const servicios = React.useMemo(
    () => serviciosData?.items ?? [],
    [serviciosData]
  );

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
      description: srv.codigo
        ? `Cód: ${srv.codigo}${srv.precio || srv.Precio ? ` • ${formatCurrency(Number(srv.precio ?? srv.Precio))}` : ""}`
        : undefined,
    }));
  }, [servicios]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoServicioAcuerdoFormValues>({
    resolver: zodResolver(medicoServicioAcuerdoSchema),
    defaultValues: {
      servicioId: 0,
      importeServicio: 0,
      importeMedico: 0,
      fechaInicio: getTodayISO(),
      fechaFin: "",
    },
  });

  const selectedServicioId = watch("servicioId");
  const watchImporteServicio = watch("importeServicio") || 0;
  const watchImporteMedico = watch("importeMedico") || 0;
  const calculatedClinica = Math.max(0, watchImporteServicio - watchImporteMedico);
  const calculatedMedicoPct =
    watchImporteServicio > 0
      ? Math.round((watchImporteMedico / watchImporteServicio) * 100)
      : 0;
  const calculatedClinicaPct =
    watchImporteServicio > 0
      ? Math.round((calculatedClinica / watchImporteServicio) * 100)
      : 0;

  const handleSelectServicio = (val: string) => {
    const sId = Number(val);
    setValue("servicioId", sId, { shouldValidate: true });

    const srv = servicios.find((s) => s.id === sId);
    if (srv) {
      const precioBase = Number(srv.precio ?? srv.Precio ?? 0);
      if (precioBase > 0) {
        setValue("importeServicio", precioBase, { shouldValidate: true });
        // Set default 50% for doctor
        setValue("importeMedico", Math.round(precioBase * 0.5 * 100) / 100, {
          shouldValidate: true,
        });
      }
    }
  };

  const applyPercentageShortcut = (pct: number) => {
    if (watchImporteServicio > 0) {
      const valor = Math.round(watchImporteServicio * (pct / 100) * 100) / 100;
      setValue("importeMedico", valor, { shouldValidate: true });
    }
  };

  const onSubmitAdd = async (values: MedicoServicioAcuerdoFormValues) => {
    if (!medico) return;
    try {
      await createMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        request: {
          servicioId: values.servicioId,
          importeServicio: values.importeServicio,
          importeMedico: values.importeMedico,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin?.trim() || null,
        },
      });
      reset({
        servicioId: 0,
        importeServicio: 0,
        importeMedico: 0,
        fechaInicio: getTodayISO(),
        fechaFin: "",
      });
    } catch {
      // Error handled by mutation
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
      // Error handled by mutation
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/recursos-humanos/medicos")}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Volver a Médicos</span>
        </Button>
      </div>

      {/* Header Info Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar className="size-12 border-2 border-primary/20 bg-primary/10 text-primary shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground truncate">{nombreCompleto}</h1>
                  <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono flex items-center gap-1">
                    <UserCheck className="size-3 text-muted-foreground" />
                    {codigoEmpleado}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1 font-semibold text-foreground">
                    <CreditCard className="size-3 text-muted-foreground" />
                    Matrícula: {medico.matriculaProfesional}
                  </span>
                  {medico.registroMinisterioSalud && (
                    <>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1 text-muted-foreground">
                        <FileBadge className="size-3 text-sky-500" />
                        Minsal: {medico.registroMinisterioSalud}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="self-start sm:self-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
              <Handshake className="size-4" />
              Acuerdos Económicos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Column */}
        <Card className="lg:col-span-5 shadow-xs border-border/70">
          <CardHeader className="p-4 pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="size-4 text-emerald-600" />
              <span>Registrar Acuerdo de Servicio</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure los importes y distribución de honorarios por servicio clínico.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
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
                    setValue("servicioId", 0, { shouldValidate: false });
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
                  onValueChange={handleSelectServicio}
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
                  error={Boolean(errors.servicioId)}
                />
                {errors.servicioId && (
                  <p className="text-xs text-destructive">
                    {errors.servicioId.message}
                  </p>
                )}
              </div>

              {/* Importes: Servicio & Médico */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="importeServicio" className="text-xs font-semibold">
                    Importe Servicio <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="importeServicio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-9 pl-7 text-xs font-mono font-medium"
                      {...register("importeServicio", { valueAsNumber: true })}
                    />
                    <DollarSign className="size-3.5 absolute left-2 top-2.5 text-muted-foreground" />
                  </div>
                  {errors.importeServicio && (
                    <p className="text-xs text-destructive">
                      {errors.importeServicio.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="importeMedico" className="text-xs font-semibold">
                    Importe Médico <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="importeMedico"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-9 pl-7 text-xs font-mono font-medium"
                      {...register("importeMedico", { valueAsNumber: true })}
                    />
                    <DollarSign className="size-3.5 absolute left-2 top-2.5 text-emerald-600" />
                  </div>
                  {errors.importeMedico && (
                    <p className="text-xs text-destructive">
                      {errors.importeMedico.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick % Helpers */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calculator className="size-3" /> Asignación rápida % Médico:
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[40, 50, 60, 70, 80, 100].map((pct) => (
                    <Button
                      key={pct}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px] cursor-pointer flex-1"
                      onClick={() => applyPercentageShortcut(pct)}
                      disabled={watchImporteServicio <= 0}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Live Distribution Summary Card */}
              {watchImporteServicio > 0 && (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold border-b pb-1.5">
                    <span>Desglose de Acuerdo</span>
                    <span className="font-mono text-foreground font-bold">
                      {formatCurrency(watchImporteServicio)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <User className="size-3.5" /> Médico ({calculatedMedicoPct}%)
                    </span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {formatCurrency(watchImporteMedico)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1 text-sky-600 font-medium">
                      <Building2 className="size-3.5" /> Clínica ({calculatedClinicaPct}%)
                    </span>
                    <span className="font-mono font-semibold text-sky-600">
                      {formatCurrency(calculatedClinica)}
                    </span>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fechaInicio" className="text-xs font-semibold">
                    Fecha Inicio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    className="h-9 text-xs"
                    {...register("fechaInicio")}
                  />
                  {errors.fechaInicio && (
                    <p className="text-xs text-destructive">
                      {errors.fechaInicio.message}
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
                    {...register("fechaFin")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full text-xs gap-1.5 cursor-pointer mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={createMutation.isPending || isSubmitting}
              >
                {createMutation.isPending ? (
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
        <Card className="lg:col-span-7 shadow-xs border-border/70">
          <CardHeader className="p-4 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Handshake className="size-4 text-emerald-600" />
                <span>Acuerdos Registrados</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Distribución económica y honorarios vigentes por servicio.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {acuerdos.length}
            </Badge>
          </CardHeader>

          <CardContent className="p-4">
            {isLoadingAcuerdos ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-emerald-600" /> Cargando acuerdos de servicio...
              </div>
            ) : acuerdos.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
                No hay acuerdos de servicio registrados para este médico.
              </div>
            ) : (
              <div className="divide-y border rounded-lg">
                {acuerdos.map((item) => {
                  const medicoPct =
                    item.importeServicio > 0
                      ? Math.round((item.importeMedico / item.importeServicio) * 100)
                      : 0;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-muted/10 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.servicio?.nombre || `Servicio #${item.servicioId}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
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

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          title="Eliminar acuerdo"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {/* Amounts Breakdown Cards */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-muted/40 rounded-md p-2 border border-border/50">
                          <span className="text-[11px] text-muted-foreground block font-medium">
                            Importe Total
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(item.importeServicio)}
                          </span>
                        </div>

                        <div className="bg-emerald-500/10 rounded-md p-2 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium block">
                              Médico
                            </span>
                            <span className="text-[10px] font-bold px-1 rounded bg-emerald-500/20">
                              {medicoPct}%
                            </span>
                          </div>
                          <span className="font-mono font-bold">
                            {formatCurrency(item.importeMedico)}
                          </span>
                        </div>

                        <div className="bg-sky-500/10 rounded-md p-2 border border-sky-500/20 text-sky-700 dark:text-sky-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium block">
                              Clínica
                            </span>
                            <span className="text-[10px] font-bold px-1 rounded bg-sky-500/20">
                              {100 - medicoPct}%
                            </span>
                          </div>
                          <span className="font-mono font-bold">
                            {formatCurrency(item.importeClinica)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
