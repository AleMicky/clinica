"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Trash2,
  Handshake,
  Edit2,
  DollarSign,
  Building2,
  User,
  Search,
  X,
  AlertCircle,
  Stethoscope,
  FolderTree,
  Calculator,
  Calendar,
  Save,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { StatusBadge } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio";
import {
  useServiciosTarifario,
  type ServicioResponse,
  type PagedResult,
} from "@/modules/servicios/servicio";
import {
  useDeleteMedicoServicioAcuerdo,
  useMedicoServicioAcuerdos,
  useCreateMedicoServicioAcuerdo,
  useUpdateMedicoServicioAcuerdo,
} from "../hooks/use-medicos";
import {
  medicoServicioAcuerdoSchema,
  type MedicoServicioAcuerdoFormValues,
} from "../schemas/medico.schema";
import { getMedicoFullName } from "./medico-list";
import type {
  MedicoResponse,
  MedicoServicioAcuerdoResponse,
} from "../types/medico.types";

interface MedicoAcuerdosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoResponse | null;
}

function getTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function getServicePrice(srv: unknown): number {
  if (!srv || typeof srv !== "object") return 0;
  const raw = srv as Record<string, unknown>;
  const keys = [
    "precio",
    "Precio",
    "precioBase",
    "PrecioBase",
    "monto",
    "Monto",
    "price",
    "Price",
  ];
  for (const key of keys) {
    const val = raw[key];
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string" && val.trim() !== "") {
      const num = Number(val);
      if (!isNaN(num)) return num;
    }
  }
  return 0;
}

export function MedicoAcuerdosModal({
  open,
  onOpenChange,
  medico,
}: MedicoAcuerdosModalProps) {
  const empleadoId = medico?.empleadoId ?? 0;
  const medicoId = medico?.id ?? 0;

  // Inline Form State (Panel de creación/edición sin abrir segundo modal)
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingAcuerdo, setEditingAcuerdo] =
    React.useState<MedicoServicioAcuerdoResponse | null>(null);

  // Selected Service Category for Filter
  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number>(0);

  // Search & Filters inside modal
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterVigencia, setFilterVigencia] = React.useState<
    "ALL" | "ACTIVOS" | "FINALIZADOS"
  >("ALL");

  // Queries
  const {
    data: acuerdosData,
    isLoading: isLoadingAcuerdos,
    refetch,
  } = useMedicoServicioAcuerdos(empleadoId, medicoId, open && medicoId > 0);

  const { data: categoriasData, isLoading: isLoadingCategorias } =
    useCategoriasServicio({ pageSize: 100 });

  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServiciosTarifario(
      selectedCategoriaId,
      undefined,
      undefined,
      open && isFormOpen && selectedCategoriaId > 0
    );

  // Mutations
  const createMutation = useCreateMedicoServicioAcuerdo();
  const updateMutation = useUpdateMedicoServicioAcuerdo();
  const deleteAcuerdoMutation = useDeleteMedicoServicioAcuerdo();

  const categorias = React.useMemo(
    () => categoriasData?.items ?? [],
    [categoriasData]
  );

  const servicios = React.useMemo(() => {
    if (!serviciosData) return [];
    if (Array.isArray(serviciosData)) return serviciosData as ServicioResponse[];
    if (Array.isArray((serviciosData as PagedResult<ServicioResponse>).items)) {
      return (serviciosData as PagedResult<ServicioResponse>).items;
    }
    return [];
  }, [serviciosData]);

  const categoriaOptions: AutocompleteOption[] = React.useMemo(() => {
    return categorias.map((cat) => ({
      value: String(cat.id),
      label: cat.nombre,
      description: cat.codigo ? `Cód: ${cat.codigo}` : undefined,
    }));
  }, [categorias]);

  const servicioOptions: AutocompleteOption[] = React.useMemo(() => {
    return servicios.map((srv) => {
      const price = getServicePrice(srv);
      return {
        value: String(srv.id),
        label: srv.nombre,
        description: srv.codigo
          ? `Cód: ${srv.codigo}${price > 0 ? ` • ${formatCurrency(price)}` : ""}`
          : undefined,
      };
    });
  }, [servicios]);

  // Form setup
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
  const rawImporteServicio = watch("importeServicio");
  const rawImporteMedico = watch("importeMedico");
  const watchImporteServicio =
    typeof rawImporteServicio === "number" && !isNaN(rawImporteServicio)
      ? rawImporteServicio
      : Number(rawImporteServicio) || 0;
  const watchImporteMedico =
    typeof rawImporteMedico === "number" && !isNaN(rawImporteMedico)
      ? rawImporteMedico
      : Number(rawImporteMedico) || 0;

  const calculatedClinica = Math.max(0, watchImporteServicio - watchImporteMedico);
  const calculatedMedicoPct =
    watchImporteServicio > 0
      ? Math.round((watchImporteMedico / watchImporteServicio) * 100)
      : 0;
  const calculatedClinicaPct =
    watchImporteServicio > 0
      ? Math.round((calculatedClinica / watchImporteServicio) * 100)
      : 0;

  const acuerdos = React.useMemo(
    () => acuerdosData?.items ?? [],
    [acuerdosData]
  );

  // Filtered agreements
  const filteredAcuerdos = React.useMemo(() => {
    return acuerdos.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.servicio?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.servicio?.codigo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const today = new Date().toISOString().slice(0, 10);
      const isActivo =
        item.activo &&
        (!item.fechaFin || item.fechaFin >= today) &&
        item.fechaInicio <= today;

      if (filterVigencia === "ACTIVOS") {
        return matchSearch && isActivo;
      }
      if (filterVigencia === "FINALIZADOS") {
        return matchSearch && !isActivo;
      }
      return matchSearch;
    });
  }, [acuerdos, searchTerm, filterVigencia]);

  // Reset states when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setIsFormOpen(false);
      setEditingAcuerdo(null);
      setSearchTerm("");
      setSelectedCategoriaId(0);
    }
  }, [open]);

  const handleOpenAdd = () => {
    setEditingAcuerdo(null);
    setSelectedCategoriaId(0);
    reset({
      servicioId: 0,
      importeServicio: 0,
      importeMedico: 0,
      fechaInicio: getTodayISO(),
      fechaFin: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (acuerdo: MedicoServicioAcuerdoResponse) => {
    setEditingAcuerdo(acuerdo);
    setSelectedCategoriaId(0);
    reset({
      servicioId: acuerdo.servicioId,
      importeServicio: Number(acuerdo.importeServicio),
      importeMedico: Number(acuerdo.importeMedico),
      fechaInicio: acuerdo.fechaInicio?.slice(0, 10) || getTodayISO(),
      fechaFin: acuerdo.fechaFin?.slice(0, 10) || "",
    });
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAcuerdo(null);
    setSelectedCategoriaId(0);
  };

  const handleSelectServicio = (val: string) => {
    const sId = Number(val);
    setValue("servicioId", sId, { shouldValidate: true });

    if (!sId) return;

    const srv = servicios.find((s) => s.id === sId);
    if (srv) {
      const precioBase = getServicePrice(srv);
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
      if (editingAcuerdo) {
        await updateMutation.mutateAsync({
          empleadoId,
          medicoId,
          id: editingAcuerdo.id,
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
      setIsFormOpen(false);
      setEditingAcuerdo(null);
      refetch();
    } catch {
      // Handled by toast in mutation
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
      refetch();
    } catch {
      // Handled by toast
    }
  };

  const isFormPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const medicoNombre = medico ? getMedicoFullName(medico) : "Médico";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 overflow-hidden">
        {/* CABECERA */}
        <DialogHeader className="space-y-1 pb-2 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
                <Handshake className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Acuerdos de Honorarios y Tarifas
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Dr(a).{" "}
                  <span className="font-semibold text-foreground">
                    {medicoNombre}
                  </span>{" "}
                  · Matrícula:{" "}
                  <span className="font-mono font-bold text-primary">
                    #{medico?.matriculaProfesional}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {!isFormOpen && (
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="h-8.5 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Nuevo Acuerdo</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* CONTENIDO SCROLLABLE */}
        <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {/* FORMULARIO INLINE DIRECTO (SIN SEGUNDO MODAL) */}
          {isFormOpen && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3 animate-in fade-in-50 duration-200 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Handshake className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {editingAcuerdo
                      ? "Editar Acuerdo de Servicio"
                      : "Registrar Nuevo Acuerdo de Servicio"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  className="size-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Categoría Selector (Filtro rápido) */}
                  {!editingAcuerdo && (
                    <div className="space-y-1">
                      <Label
                        htmlFor="inlineCategoriaId"
                        className="text-xs font-semibold flex items-center gap-1"
                      >
                        <FolderTree className="size-3 text-primary" />
                        <span>Catálogo / Categoría</span>
                      </Label>
                      <Autocomplete
                        id="inlineCategoriaId"
                        value={
                          selectedCategoriaId ? String(selectedCategoriaId) : ""
                        }
                        onValueChange={(val) => {
                          const catId = Number(val);
                          setSelectedCategoriaId(catId);
                          setValue("servicioId", 0, { shouldValidate: false });
                        }}
                        options={categoriaOptions}
                        placeholder="Filtrar servicios por categoría..."
                        emptyText="No se encontraron categorías"
                        allowCustomValue={false}
                        isLoading={isLoadingCategorias}
                        className="h-8.5 text-xs"
                      />
                    </div>
                  )}

                  {/* Servicio Clínico */}
                  <div
                    className={`space-y-1 ${
                      editingAcuerdo ? "sm:col-span-2" : ""
                    }`}
                  >
                    <Label
                      htmlFor="inlineServicioId"
                      className="text-xs font-semibold flex items-center gap-1"
                    >
                      <Stethoscope className="size-3 text-primary" />
                      <span>Servicio Clínico</span>
                      <span className="text-destructive">*</span>
                    </Label>

                    {editingAcuerdo?.servicio ? (
                      <div className="p-2 bg-muted/50 rounded-lg border text-xs font-medium flex items-center justify-between h-8.5">
                        <span className="font-semibold text-foreground truncate mr-2">
                          {editingAcuerdo.servicio.nombre}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                          Cód: {editingAcuerdo.servicio.codigo}
                        </span>
                      </div>
                    ) : (
                      <Autocomplete
                        id="inlineServicioId"
                        value={
                          selectedServicioId ? String(selectedServicioId) : ""
                        }
                        onValueChange={handleSelectServicio}
                        options={servicioOptions}
                        placeholder={
                          selectedCategoriaId === 0
                            ? "Seleccione categoría para listar servicios..."
                            : "Buscar servicio..."
                        }
                        emptyText="No se encontraron servicios"
                        allowCustomValue={false}
                        disabled={
                          selectedCategoriaId === 0 || isLoadingServicios
                        }
                        isLoading={isLoadingServicios}
                        error={Boolean(errors.servicioId)}
                        className="h-8.5 text-xs"
                      />
                    )}
                    {errors.servicioId && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.servicioId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Importes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="inlineImporteServicio"
                      className="text-xs font-semibold"
                    >
                      Tarifa Total Servicio <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="inlineImporteServicio"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-8.5 pl-6 text-xs font-mono font-medium"
                        {...register("importeServicio", { valueAsNumber: true })}
                      />
                      <DollarSign className="size-3 absolute left-2 top-2.5 text-muted-foreground" />
                    </div>
                    {errors.importeServicio && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.importeServicio.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="inlineImporteMedico"
                      className="text-xs font-semibold"
                    >
                      Pago Honorario Médico <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="inlineImporteMedico"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-8.5 pl-6 text-xs font-mono font-medium"
                        {...register("importeMedico", { valueAsNumber: true })}
                      />
                      <DollarSign className="size-3 absolute left-2 top-2.5 text-emerald-600" />
                    </div>
                    {errors.importeMedico && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.importeMedico.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Atajos Rápidos de Porcentaje */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calculator className="size-3" /> Asignar % para el Médico:
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[40, 50, 60, 70, 80, 100].map((pct) => (
                      <Button
                        key={pct}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-[10px] cursor-pointer flex-1 hover:border-emerald-500 hover:text-emerald-600 transition-colors font-semibold"
                        onClick={() => applyPercentageShortcut(pct)}
                        disabled={watchImporteServicio <= 0}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Desglose de Distribución Económica */}
                {watchImporteServicio > 0 && (
                  <div className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">
                        Distribución Calculada
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        Total: {formatCurrency(watchImporteServicio)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-sky-500/20 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, calculatedMedicoPct)
                          )}%`,
                        }}
                      />
                      <div
                        className="h-full bg-sky-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, calculatedClinicaPct)
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                      <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-1.5 text-emerald-700 dark:text-emerald-300">
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

                      <div className="rounded-md bg-sky-500/10 border border-sky-500/20 p-1.5 text-sky-700 dark:text-sky-300">
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

                {/* Fechas de Vigencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="inlineFechaInicio"
                      className="text-xs font-semibold"
                    >
                      Fecha Inicio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="inlineFechaInicio"
                      type="date"
                      className="h-8.5 text-xs"
                      {...register("fechaInicio")}
                    />
                    {errors.fechaInicio && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.fechaInicio.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="inlineFechaFin"
                      className="text-xs font-semibold"
                    >
                      Fecha Fin (Opcional)
                    </Label>
                    <Input
                      id="inlineFechaFin"
                      type="date"
                      className="h-8.5 text-xs"
                      {...register("fechaFin")}
                    />
                  </div>
                </div>

                {/* Botones de acción del formulario */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelForm}
                    disabled={isFormPending}
                    className="text-xs h-8 cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="text-xs h-8 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer"
                    disabled={isFormPending}
                  >
                    {isFormPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        <span>
                          {editingAcuerdo ? "Guardar Cambios" : "Registrar Acuerdo"}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* BUSCADOR Y FILTROS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por servicio o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8.5 pl-8 pr-7 text-xs bg-background shadow-2xs"
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

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterVigencia("ALL")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterVigencia === "ALL"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                Todos ({acuerdos.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterVigencia("ACTIVOS")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterVigencia === "ACTIVOS"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                Vigentes
              </button>
              <button
                type="button"
                onClick={() => setFilterVigencia("FINALIZADOS")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterVigencia === "FINALIZADOS"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                Finalizados
              </button>
            </div>
          </div>

          {/* TABLA DE ACUERDOS */}
          {isLoadingAcuerdos ? (
            <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2 border rounded-xl bg-card">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando acuerdos de honorarios...</span>
            </div>
          ) : filteredAcuerdos.length === 0 ? (
            <div className="py-10 text-center border border-dashed rounded-xl bg-muted/10 space-y-2">
              <AlertCircle className="size-7 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                No se encontraron acuerdos comerciales
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                {searchTerm || filterVigencia !== "ALL"
                  ? "Intente ajustando los filtros de búsqueda."
                  : "Haga clic en 'Nuevo Acuerdo' para definir la distribución de honorarios por servicio."}
              </p>
            </div>
          ) : (
            <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-bold h-9">
                      Servicio Clínico
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-right">
                      Tarifa Total
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-right">
                      Pago Médico
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-right">
                      Retención Clínica
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-center">
                      Vigencia
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-center w-20">
                      Estado
                    </TableHead>
                    <TableHead className="text-xs font-bold h-9 text-right w-20">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcuerdos.map((item) => {
                    const totalServicio = item.importeServicio || 0;
                    const pagoMedico = item.importeMedico || 0;
                    const clinica = item.importeClinica || 0;
                    const medicoPct =
                      totalServicio > 0
                        ? Math.round((pagoMedico / totalServicio) * 100)
                        : 0;
                    const clinicaPct =
                      totalServicio > 0
                        ? Math.round((clinica / totalServicio) * 100)
                        : 0;

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="py-2.5">
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.servicio?.nombre ||
                                `Servicio #${item.servicioId}`}
                            </p>
                            {item.servicio?.codigo && (
                              <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/40">
                                #{item.servicio.codigo}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 text-right font-mono font-bold text-xs">
                          {formatCurrency(totalServicio)}
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(pagoMedico)}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({medicoPct}%)
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <div className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                            {formatCurrency(clinica)}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({clinicaPct}%)
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5 text-center text-[10.5px] font-mono text-muted-foreground">
                          <div>
                            Desde: {item.fechaInicio?.slice(0, 10) || "—"}
                          </div>
                          {item.fechaFin && (
                            <div className="text-[10px] text-muted-foreground/70">
                              Hasta: {item.fechaFin.slice(0, 10)}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-center">
                          <StatusBadge active={item.activo} />
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="size-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer rounded-lg"
                              title="Editar acuerdo"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAcuerdo(item.id)}
                              disabled={deleteAcuerdoMutation.isPending}
                              className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
