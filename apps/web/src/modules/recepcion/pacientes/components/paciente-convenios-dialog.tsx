"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Handshake,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Shield,
  Calendar,
  CreditCard,
  HeartPulse,
  X,
  Star,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  usePacienteConvenios,
  useCreatePacienteConvenio,
  useDeletePacienteConvenio,
} from "../hooks/use-pacientes";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import {
  pacienteConvenioSchema,
  type PacienteConvenioFormValues,
} from "../schemas/paciente.schema";
import type { PacienteResponse } from "../types/paciente.types";
import { getPacienteFullName, getPacienteDocument } from "./paciente-card";
import { cn } from "@/lib/utils";

interface PacienteConveniosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: PacienteResponse | null;
}

export function PacienteConveniosDialog({
  open,
  onOpenChange,
  paciente,
}: PacienteConveniosDialogProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);

  const pacienteId = paciente?.id ?? 0;
  const { data: conveniosData, isLoading: isLoadingPacienteConvenios } =
    usePacienteConvenios(pacienteId, open && pacienteId > 0);

  const { data: catConveniosData } = useConvenios({ pageSize: 100 });

  const createMutation = useCreatePacienteConvenio();
  const deleteMutation = useDeletePacienteConvenio();

  const pacienteConvenios = conveniosData?.items ?? [];
  const disponibleConvenios = catConveniosData?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteConvenioFormValues>({
    resolver: zodResolver(pacienteConvenioSchema),
    defaultValues: {
      convenioId: 0,
      numeroAfiliado: "",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      esPrincipal: false,
    },
  });

  const convenioIdVal = watch("convenioId");
  const esPrincipalVal = watch("esPrincipal");

  const selectedConvenio = React.useMemo(() => {
    if (!convenioIdVal) return null;
    return disponibleConvenios.find((c) => c.id === Number(convenioIdVal)) ?? null;
  }, [convenioIdVal, disponibleConvenios]);

  const selectedConvenioLabel = selectedConvenio
    ? `${selectedConvenio.codigo ? `[${selectedConvenio.codigo}] ` : ""}${selectedConvenio.nombre}`
    : "";

  React.useEffect(() => {
    if (open) {
      setShowAddForm(false);
      reset({
        convenioId: 0,
        numeroAfiliado: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: "",
        esPrincipal: false,
      });
    }
  }, [open, reset]);

  if (!paciente) return null;

  const nombrePaciente = getPacienteFullName(paciente);
  const docFormatted = getPacienteDocument(paciente);
  const initials = paciente.persona
    ? ((paciente.persona.nombres[0] || "") + (paciente.persona.apellidoPaterno[0] || "")).toUpperCase()
    : "PAC";

  const convenioPrincipal = pacienteConvenios.find((c) => c.esPrincipal);

  const onAddConvenio = async (values: PacienteConvenioFormValues) => {
    try {
      await createMutation.mutateAsync({
        pacienteId,
        data: {
          convenioId: values.convenioId,
          numeroAfiliado: values.numeroAfiliado || undefined,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin || undefined,
          esPrincipal: values.esPrincipal,
        },
      });

      toast.success("Convenio asignado al paciente exitosamente.");
      setShowAddForm(false);
      reset();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "No se pudo asignar el convenio.";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: number, convenioNombre?: string) => {
    try {
      await deleteMutation.mutateAsync({ pacienteId, id });
      toast.success(
        `Convenio ${convenioNombre || ""} removido del expediente.`
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al desvincular convenio.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl sm:w-[820px] md:w-[900px] p-0 flex flex-col justify-between overflow-hidden border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Convenios y Coberturas Médicas</DialogTitle>
        </DialogHeader>

        <div>
          {/* Header Visual Banner */}
          <div className="relative p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-12 size-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Patient Context */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-purple-400/40 shadow-md shrink-0">
                  <AvatarFallback className="bg-purple-600/30 text-purple-200 font-bold text-base">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white truncate">
                      {nombrePaciente}
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-purple-500/20 text-purple-200 border-purple-400/30 font-mono text-xs px-2 py-0.5"
                    >
                      <HeartPulse className="size-3 mr-1 text-purple-400" />
                      {paciente.numeroHistoriaClinica}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-purple-200/80 mt-1">
                    <span>{docFormatted}</span>
                    {convenioPrincipal && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <Star className="size-3 fill-emerald-400 text-emerald-400" />
                        Cob: {convenioPrincipal.convenio?.nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!showAddForm ? (
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="h-9 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md shadow-purple-900/30 shrink-0"
                >
                  <Plus className="size-4" />
                  Asignar Nuevo Convenio
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="h-9 px-3 text-xs font-medium text-white border-white/20 bg-white/10 hover:bg-white/20 shrink-0 gap-1.5"
                >
                  <X className="size-3.5" />
                  Cerrar Formulario
                </Button>
              )}
            </div>
          </div>

          {/* Body Content Area */}
          <div className="p-6 space-y-6 max-h-[560px] overflow-y-auto bg-background">
            {/* Form Drawer Section */}
            {showAddForm && (
              <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-500/5 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Sparkles className="size-4" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Asignación de Seguro o Convenio Institucional
                    </h4>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Campos requeridos (*)</span>
                </div>

                <form onSubmit={handleSubmit(onAddConvenio)} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {/* Convenio Selector - Full Width */}
                    <div className="space-y-1.5 w-full">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        Convenio / Seguro Institucional <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={convenioIdVal ? String(convenioIdVal) : ""}
                        onValueChange={(val) =>
                          setValue("convenioId", Number(val), {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 text-xs bg-background border-border/80 w-full",
                            errors.convenioId && "border-destructive"
                          )}
                        >
                          <SelectValue placeholder="Seleccionar convenio o seguro registrado...">
                            {selectedConvenioLabel || undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {disponibleConvenios.map((conv) => (
                            <SelectItem key={conv.id} value={String(conv.id)}>
                              {conv.codigo ? `[${conv.codigo}] ` : ""}{conv.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.convenioId && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.convenioId.message}
                        </p>
                      )}
                    </div>

                    {/* N° Afiliado / Póliza - Full Width */}
                    <div className="space-y-1.5 w-full">
                      <Label htmlFor="numeroAfiliado" className="text-xs font-semibold">
                        N° Afiliado / Póliza / Matrícula
                      </Label>
                      <Input
                        id="numeroAfiliado"
                        placeholder="Ej. POL-984210"
                        {...register("numeroAfiliado")}
                        className="h-10 text-xs bg-background w-full"
                      />
                    </div>

                    {/* Fecha Inicio - Full Width */}
                    <div className="space-y-1.5 w-full">
                      <Label htmlFor="fechaInicio" className="text-xs font-semibold">
                        Fecha Inicio Cobertura <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        {...register("fechaInicio")}
                        className="h-10 text-xs bg-background w-full"
                      />
                    </div>
                  </div>

                  {/* Es Principal Checkbox */}
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border/60">
                    <Checkbox
                      id="esPrincipal"
                      checked={esPrincipalVal}
                      onCheckedChange={(checked) =>
                        setValue("esPrincipal", Boolean(checked))
                      }
                    />
                    <div className="flex flex-col leading-tight">
                      <Label
                        htmlFor="esPrincipal"
                        className="text-xs font-semibold cursor-pointer text-foreground"
                      >
                        Establecer como Cobertura Principal del Paciente
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Al marcar esta opción, se actualizará el tarifario principal para facturaciones.
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                      className="h-8 text-xs font-medium"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || isSubmitting}
                      size="sm"
                      className="h-8 text-xs font-semibold gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {createMutation.isPending && (
                        <Loader2 className="size-3.5 animate-spin" />
                      )}
                      Guardar Convenio
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Registered Convenios */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Shield className="size-3.5 text-purple-600" />
                  Convenios Asignados al Expediente ({pacienteConvenios.length})
                </h4>
              </div>

              {isLoadingPacienteConvenios ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : pacienteConvenios.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-2xl text-muted-foreground text-xs space-y-2 bg-muted/10">
                  <div className="size-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                    <Handshake className="size-5" />
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    Sin convenios institucionales registrados
                  </p>
                  <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                    El paciente no cuenta con seguros médicos o convenios especiales asociados a su expediente.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    className="h-8 text-xs font-semibold gap-1.5 mt-2 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                  >
                    <Plus className="size-3.5" />
                    Asignar Primer Convenio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pacienteConvenios.map((pc) => (
                    <div
                      key={pc.id}
                      className={cn(
                        "group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 gap-3",
                        pc.esPrincipal
                          ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-xs"
                          : "border-border/70 bg-card hover:border-border"
                      )}
                    >
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono font-bold text-xs px-2 py-0.5 shrink-0",
                              pc.esPrincipal
                                ? "bg-purple-600 text-white border-none"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {pc.convenio?.codigo || "CONV"}
                          </Badge>
                          <span className="font-bold text-sm text-foreground truncate">
                            {pc.convenio?.nombre || "Convenio General"}
                          </span>
                        </div>

                        {pc.esPrincipal && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0 shrink-0"
                          >
                            <CheckCircle2 className="size-2.5 mr-1 text-emerald-600" />
                            Principal
                          </Badge>
                        )}
                      </div>

                      {/* Details Content Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <CreditCard className="size-3.5 text-purple-600/70 shrink-0" />
                          <span className="truncate">
                            Póliza: <strong>{pc.numeroAfiliado || "N/A"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="size-3.5 text-purple-600/70 shrink-0" />
                          <span className="truncate">Desde: {pc.fechaInicio}</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px]">
                        <span className="text-muted-foreground">
                          {pc.activo ? "Estado: Vigente" : "Inactivo"}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pc.id, pc.convenio?.nombre)}
                          disabled={deleteMutation.isPending}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5 mr-1" />
                          Desvincular
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
