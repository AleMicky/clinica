"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Trash2,
  Handshake,
  Calendar,
  DollarSign,
  Building2,
  User,
  Calculator,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { formatCurrency } from "@/lib/utils";
import { useServicios } from "@/modules/servicios/servicio";
import {
  useCreateMedicoServicioAcuerdo,
  useDeleteMedicoServicioAcuerdo,
  useMedicoServicioAcuerdos,
} from "../hooks/use-medicos";
import {
  medicoServicioAcuerdoSchema,
  type MedicoServicioAcuerdoFormValues,
} from "../schemas/medico.schema";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoAcuerdosDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoResponse | null;
}

function getTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function MedicoAcuerdosDrawer({
  open,
  onOpenChange,
  medico,
}: MedicoAcuerdosDrawerProps) {
  const empleadoId = medico?.empleadoId ?? 0;
  const medicoId = medico?.id ?? 0;

  const { data: acuerdosData, isLoading: isLoadingAcuerdos } =
    useMedicoServicioAcuerdos(empleadoId, medicoId, open);

  // Fetch clinical services
  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServicios(0, { pageSize: 200 }, open);

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

  React.useEffect(() => {
    if (open) {
      reset({
        servicioId: 0,
        importeServicio: 0,
        importeMedico: 0,
        fechaInicio: getTodayISO(),
        fechaFin: "",
      });
    }
  }, [open, reset]);

  const handleSelectServicio = (val: string) => {
    const sId = Number(val);
    setValue("servicioId", sId, { shouldValidate: true });

    const srv = servicios.find((s) => s.id === sId);
    if (srv) {
      const precioBase = Number(srv.precio ?? srv.Precio ?? 0);
      if (precioBase > 0) {
        setValue("importeServicio", precioBase, { shouldValidate: true });
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

  const medicoNombre = medico?.empleado?.nombreCompleto || `Médico #${medico?.id}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-3xl overflow-y-auto p-6 space-y-6">
          <DrawerHeader className="p-0">
            <div className="flex items-center gap-2 text-primary">
              <Handshake className="size-5" />
              <DrawerTitle className="text-lg">Acuerdos de Honorarios por Servicio</DrawerTitle>
            </div>
            <DrawerDescription>
              Configuración de importes y distribución de cobro por servicio clínico para{" "}
              <span className="font-semibold text-foreground">{medicoNombre}</span>.
            </DrawerDescription>
          </DrawerHeader>

          {/* Formulario Registrar Acuerdo */}
          <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registrar Nuevo Acuerdo
            </h4>
            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Servicio Autocomplete */}
                <div className="sm:col-span-12 space-y-1.5">
                  <Label htmlFor="drawerServicioId" className="text-xs font-semibold">
                    Servicio Clínico <span className="text-destructive">*</span>
                  </Label>
                  <Autocomplete
                    id="drawerServicioId"
                    value={selectedServicioId ? String(selectedServicioId) : ""}
                    onValueChange={handleSelectServicio}
                    options={servicioOptions}
                    placeholder="Buscar servicio..."
                    emptyText="No se encontraron servicios"
                    allowCustomValue={false}
                    isLoading={isLoadingServicios}
                    error={Boolean(errors.servicioId)}
                  />
                  {errors.servicioId && (
                    <p className="text-xs text-destructive">
                      {errors.servicioId.message}
                    </p>
                  )}
                </div>

                {/* Importe Servicio */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="drawerImporteServicio" className="text-xs font-semibold">
                    Importe Servicio <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drawerImporteServicio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-9 pl-7 text-xs font-mono"
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

                {/* Importe Médico */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="drawerImporteMedico" className="text-xs font-semibold">
                    Importe Médico <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drawerImporteMedico"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-9 pl-7 text-xs font-mono"
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

                {/* Fecha Inicio */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="drawerFechaInicio" className="text-xs font-semibold">
                    Fecha Inicio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="drawerFechaInicio"
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

                {/* Fecha Fin & Botón */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="drawerFechaFin" className="text-xs">
                    Fecha Fin (Opcional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="drawerFechaFin"
                      type="date"
                      className="h-9 text-xs"
                      {...register("fechaFin")}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-3 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={createMutation.isPending || isSubmitting}
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick % Helpers */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calculator className="size-3" /> % Médico:
                </span>
                {[40, 50, 60, 70, 80, 100].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px] cursor-pointer"
                    onClick={() => applyPercentageShortcut(pct)}
                    disabled={watchImporteServicio <= 0}
                  >
                    {pct}%
                  </Button>
                ))}
                {watchImporteServicio > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-medium">
                    Clínica ({calculatedClinicaPct}%):{" "}
                    <span className="font-mono text-foreground font-bold">
                      {formatCurrency(calculatedClinica)}
                    </span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Listado de Acuerdos */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Acuerdos Registrados ({acuerdos.length})
            </h4>

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
                      className="p-3.5 hover:bg-muted/10 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
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

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {/* Amounts Breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-muted/40 rounded p-1.5 border">
                          <span className="text-[10px] text-muted-foreground block">
                            Total
                          </span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(item.importeServicio)}
                          </span>
                        </div>
                        <div className="bg-emerald-500/10 rounded p-1.5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <span className="text-[10px] block">
                            Médico ({medicoPct}%)
                          </span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(item.importeMedico)}
                          </span>
                        </div>
                        <div className="bg-sky-500/10 rounded p-1.5 border border-sky-500/20 text-sky-700 dark:text-sky-300">
                          <span className="text-[10px] block">
                            Clínica ({100 - medicoPct}%)
                          </span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(item.importeClinica)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
