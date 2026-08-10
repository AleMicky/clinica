"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Percent, Trash2, Handshake, Calendar } from "lucide-react";
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
      description: srv.codigo ? `Cód: ${srv.codigo}` : undefined,
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
      porcentajeMedico: 50,
      fechaInicio: getTodayISO(),
      fechaFin: "",
    },
  });

  const selectedServicioId = watch("servicioId");

  React.useEffect(() => {
    if (open) {
      reset({
        servicioId: 0,
        porcentajeMedico: 50,
        fechaInicio: getTodayISO(),
        fechaFin: "",
      });
    }
  }, [open, reset]);

  const onSubmitAdd = async (values: MedicoServicioAcuerdoFormValues) => {
    if (!medico) return;
    try {
      await createMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        request: {
          servicioId: values.servicioId,
          porcentajeMedico: values.porcentajeMedico,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin?.trim() || null,
        },
      });
      reset({
        servicioId: 0,
        porcentajeMedico: 50,
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
              Configuración de porcentajes de pago por servicio clínico para <span className="font-semibold text-foreground">{medicoNombre}</span>.
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
                <div className="sm:col-span-5 space-y-1.5">
                  <Label htmlFor="servicioId" className="text-xs">
                    Servicio Clínico
                  </Label>
                  <Autocomplete
                    id="servicioId"
                    value={selectedServicioId ? String(selectedServicioId) : ""}
                    onValueChange={(val) =>
                      setValue("servicioId", Number(val), { shouldValidate: true })
                    }
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

                {/* Porcentaje % */}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="porcentajeMedico" className="text-xs">
                    % Médico
                  </Label>
                  <div className="relative">
                    <Input
                      id="porcentajeMedico"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="h-9 pr-6"
                      {...register("porcentajeMedico", { valueAsNumber: true })}
                    />
                    <Percent className="size-3.5 absolute right-2 top-2.5 text-muted-foreground" />
                  </div>
                  {errors.porcentajeMedico && (
                    <p className="text-xs text-destructive">
                      {errors.porcentajeMedico.message}
                    </p>
                  )}
                </div>

                {/* Fecha Inicio */}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="fechaInicio" className="text-xs">
                    Fecha Inicio
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

                {/* Fecha Fin */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="fechaFin" className="text-xs">
                    Fecha Fin (Opcional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="fechaFin"
                      type="date"
                      className="h-9 text-xs"
                      {...register("fechaFin")}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-3 shrink-0"
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
            </form>
          </div>

          {/* Listado de Acuerdos */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Acuerdos Registrados ({acuerdos.length})
            </h4>

            {isLoadingAcuerdos ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Cargando acuerdos de servicio...
              </div>
            ) : acuerdos.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
                No hay acuerdos de porcentaje registrados para este médico.
              </div>
            ) : (
              <div className="divide-y border rounded-lg">
                {acuerdos.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-0.5">
                        {item.porcentajeMedico}%
                      </div>
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
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
