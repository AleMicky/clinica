"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  DollarSign,
  Building2,
  User,
  Calculator,
  FolderTree,
  Stethoscope,
  Handshake,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { formatCurrency } from "@/lib/utils";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio";
import { useServicios } from "@/modules/servicios/servicio";
import {
  useCreateMedicoServicioAcuerdo,
  useUpdateMedicoServicioAcuerdo,
} from "../hooks/use-medicos";
import {
  medicoServicioAcuerdoSchema,
  type MedicoServicioAcuerdoFormValues,
} from "../schemas/medico.schema";
import type { MedicoServicioAcuerdoResponse } from "../types/medico.types";

interface MedicoAcuerdoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoId: number;
  medicoId: number;
  acuerdoToEdit?: MedicoServicioAcuerdoResponse | null;
}

function getTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function MedicoAcuerdoDialog({
  open,
  onOpenChange,
  empleadoId,
  medicoId,
  acuerdoToEdit,
}: MedicoAcuerdoDialogProps) {
  const isEditing = Boolean(acuerdoToEdit);

  // Selected Service Category
  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number>(0);

  // Fetch Categorías
  const { data: categoriasData, isLoading: isLoadingCategorias } =
    useCategoriasServicio({ pageSize: 100 });

  const categorias = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);

  // Fetch Servicios filtered by Category
  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServicios(selectedCategoriaId, { pageSize: 200 }, open && selectedCategoriaId > 0);

  const servicios = React.useMemo(() => serviciosData?.items ?? [], [serviciosData]);

  const createMutation = useCreateMedicoServicioAcuerdo();
  const updateMutation = useUpdateMedicoServicioAcuerdo();

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

  // Sync state when opening modal / editing
  React.useEffect(() => {
    if (open) {
      if (acuerdoToEdit) {
        reset({
          servicioId: acuerdoToEdit.servicioId,
          importeServicio: Number(acuerdoToEdit.importeServicio),
          importeMedico: Number(acuerdoToEdit.importeMedico),
          fechaInicio: acuerdoToEdit.fechaInicio,
          fechaFin: acuerdoToEdit.fechaFin || "",
        });
      } else {
        setSelectedCategoriaId(0);
        reset({
          servicioId: 0,
          importeServicio: 0,
          importeMedico: 0,
          fechaInicio: getTodayISO(),
          fechaFin: "",
        });
      }
    }
  }, [open, acuerdoToEdit, reset]);

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

  const onSubmit = async (values: MedicoServicioAcuerdoFormValues) => {
    try {
      if (isEditing && acuerdoToEdit) {
        await updateMutation.mutateAsync({
          empleadoId,
          medicoId,
          id: acuerdoToEdit.id,
          request: {
            servicioId: values.servicioId,
            importeServicio: values.importeServicio,
            importeMedico: values.importeMedico,
            fechaInicio: values.fechaInicio,
            fechaFin: values.fechaFin?.trim() || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          empleadoId,
          medicoId,
          request: {
            servicioId: values.servicioId,
            importeServicio: values.importeServicio,
            importeMedico: values.importeMedico,
            fechaInicio: values.fechaInicio,
            fechaFin: values.fechaFin?.trim() || null,
          },
        });
      }
      onOpenChange(false);
    } catch {
      // Handled by toast in mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border/80 shadow-xl">
        <DialogHeader className="p-4 pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Handshake className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Editar Acuerdo" : "Nuevo Acuerdo de Servicio"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Defina los importes y la distribución económica por servicio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          {/* Categoría / Catálogo selector */}
          {!isEditing && (
            <div className="space-y-1">
              <Label htmlFor="dlgCategoriaId" className="text-xs font-semibold flex items-center gap-1">
                <FolderTree className="size-3 text-emerald-600" />
                Catálogo / Categoría
              </Label>
              <Autocomplete
                id="dlgCategoriaId"
                value={selectedCategoriaId ? String(selectedCategoriaId) : ""}
                onValueChange={(val) => {
                  const catId = Number(val);
                  setSelectedCategoriaId(catId);
                  setValue("servicioId", 0, { shouldValidate: false });
                }}
                options={categoriaOptions}
                placeholder="Seleccionar categoría..."
                emptyText="No se encontraron categorías"
                allowCustomValue={false}
                isLoading={isLoadingCategorias}
              />
            </div>
          )}

          {/* Servicio Clínico */}
          <div className="space-y-1">
            <Label htmlFor="dlgServicioId" className="text-xs font-semibold flex items-center gap-1">
              <Stethoscope className="size-3 text-emerald-600" />
              Servicio Clínico <span className="text-destructive">*</span>
            </Label>
            {isEditing && acuerdoToEdit?.servicio ? (
              <div className="p-2 bg-muted/40 rounded-lg border text-xs font-medium flex items-center justify-between">
                <span className="font-semibold text-foreground truncate mr-2">
                  {acuerdoToEdit.servicio.nombre}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  Cód: {acuerdoToEdit.servicio.codigo}
                </span>
              </div>
            ) : (
              <Autocomplete
                id="dlgServicioId"
                value={selectedServicioId ? String(selectedServicioId) : ""}
                onValueChange={handleSelectServicio}
                options={servicioOptions}
                placeholder={
                  selectedCategoriaId === 0
                    ? "Primero seleccione categoría..."
                    : "Buscar servicio..."
                }
                emptyText="No se encontraron servicios"
                allowCustomValue={false}
                disabled={selectedCategoriaId === 0 || isLoadingServicios}
                isLoading={isLoadingServicios}
                error={Boolean(errors.servicioId)}
              />
            )}
            {errors.servicioId && (
              <p className="text-[11px] text-destructive">{errors.servicioId.message}</p>
            )}
          </div>

          {/* Importes Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="dlgImporteServicio" className="text-xs font-semibold">
                Importe Total <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="dlgImporteServicio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-8 pl-6 text-xs font-mono font-medium"
                  {...register("importeServicio", { valueAsNumber: true })}
                />
                <DollarSign className="size-3 absolute left-2 top-2.5 text-muted-foreground" />
              </div>
              {errors.importeServicio && (
                <p className="text-[11px] text-destructive">{errors.importeServicio.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="dlgImporteMedico" className="text-xs font-semibold">
                Honorario Médico <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="dlgImporteMedico"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-8 pl-6 text-xs font-mono font-medium"
                  {...register("importeMedico", { valueAsNumber: true })}
                />
                <DollarSign className="size-3 absolute left-2 top-2.5 text-emerald-600" />
              </div>
              {errors.importeMedico && (
                <p className="text-[11px] text-destructive">{errors.importeMedico.message}</p>
              )}
            </div>
          </div>

          {/* Quick % Helpers */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calculator className="size-3" /> Asignar % Médico:
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[40, 50, 60, 70, 80, 100].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] cursor-pointer flex-1 hover:border-emerald-500 hover:text-emerald-600 transition-colors font-medium"
                  onClick={() => applyPercentageShortcut(pct)}
                  disabled={watchImporteServicio <= 0}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {/* Interactive Fee Distribution Breakdown */}
          {watchImporteServicio > 0 && (
            <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">Distribución</span>
                <span className="font-mono font-bold text-foreground">
                  Total: {formatCurrency(watchImporteServicio)}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-1.5 rounded-full bg-sky-500/20 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, calculatedMedicoPct))}%` }}
                />
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, calculatedClinicaPct))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-1.5 text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-0.5 font-medium">
                      <User className="size-2.5" /> Médico
                    </span>
                    <span className="font-bold">{calculatedMedicoPct}%</span>
                  </div>
                  <p className="font-mono font-bold text-xs mt-0.5">
                    {formatCurrency(watchImporteMedico)}
                  </p>
                </div>

                <div className="rounded bg-sky-500/10 border border-sky-500/20 p-1.5 text-sky-700 dark:text-sky-300">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-0.5 font-medium">
                      <Building2 className="size-2.5" /> Clínica
                    </span>
                    <span className="font-bold">{calculatedClinicaPct}%</span>
                  </div>
                  <p className="font-mono font-bold text-xs mt-0.5">
                    {formatCurrency(calculatedClinica)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fechas Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="dlgFechaInicio" className="text-xs font-semibold">
                Fecha Inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dlgFechaInicio"
                type="date"
                className="h-8 text-xs"
                {...register("fechaInicio")}
              />
              {errors.fechaInicio && (
                <p className="text-[11px] text-destructive">{errors.fechaInicio.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="dlgFechaFin" className="text-xs font-semibold">
                Fecha Fin (Opcional)
              </Label>
              <Input
                id="dlgFechaFin"
                type="date"
                className="h-8 text-xs"
                {...register("fechaFin")}
              />
            </div>
          </div>

          <DialogFooter className="pt-1 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-8"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span>{isEditing ? "Guardar Cambios" : "Registrar Acuerdo"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
